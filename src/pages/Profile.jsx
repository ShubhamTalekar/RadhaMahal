import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Package, Clock, MessageSquare, Edit3, LogOut, CheckCircle, Trash2, PlusCircle, X, Star, Camera, Check } from 'lucide-react';
import SEO from '../components/SEO';

export default function Profile() {
    const { user, setUser } = useApp();
    const navigate = useNavigate();
    
    useEffect(() => {
        // Handled by AuthGuard in App.jsx
    }, [user]);

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
    });

    const [addresses, setAddresses] = useState(user?.addresses || []);
    const fileInputRef = useRef(null);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !user?.email) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_SIZE = 250;
                let width = img.width;
                let height = img.height;
                
                if (width > height && width > MAX_SIZE) {
                    height *= MAX_SIZE / width;
                    width = MAX_SIZE;
                } else if (height > MAX_SIZE) {
                    width *= MAX_SIZE / height;
                    height = MAX_SIZE;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob(async (blob) => {
                    if (!blob) return;
                    
                    const fileName = `${crypto.randomUUID()}.webp`;
                    const filePath = `${user.email.replace(/[^a-zA-Z0-9]/g, '_')}/${fileName}`;
                    
                    toast.loading("Uploading photo...", { id: "photo-upload" });

                    try {
                        const { data, error } = await supabase.storage
                            .from('avatars')
                            .upload(filePath, blob, {
                                contentType: 'image/webp',
                                upsert: true
                            });

                        if (error) throw error;

                        const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(filePath);

                        setUser({ ...user, photoUrl: publicUrl });
                        toast.success("Profile photo updated", { id: "photo-upload" });
                    } catch (error) {
                        console.error('Photo upload error:', error);
                        toast.error("Failed to upload photo", { id: "photo-upload" });
                    }
                }, 'image/webp', 0.85);
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [newAddress, setNewAddress] = useState({ title: '', lines: '' });
    const [showAllOrders, setShowAllOrders] = useState(false);
    const [shopifyOrders, setShopifyOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Rely completely on user.orders mapped from Shopify.
    const allOrders = [...(user?.orders || [])].reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) return acc.concat([current]);
        return acc;
    }, []);

    const latestOrder = allOrders[0];

    const [trackedOrderId, setTrackedOrderId] = useState(latestOrder?.id || null);
    const [trackingDetails, setTrackingDetails] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);

    useEffect(() => {
        if (latestOrder && !trackedOrderId) {
            setTrackedOrderId(latestOrder.id);
        }
    }, [latestOrder, trackedOrderId]);

    useEffect(() => {
        if (!trackedOrderId) {
            setTrackingDetails(null);
            return;
        }
        let isMounted = true;
        setLoadingTracking(true);
        fetch(`/api/v1/track/${trackedOrderId}`)
            .then(res => {
                if (!res.ok) throw new Error('Order details not found');
                return res.json();
            })
            .then(data => {
                if (isMounted) {
                    setTrackingDetails(data);
                    setLoadingTracking(false);
                }
            })
            .catch(err => {
                console.error(err);
                if (isMounted) {
                    setTrackingDetails(null);
                    setLoadingTracking(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [trackedOrderId]);

    const trackedOrder = allOrders.find(o => o.id === trackedOrderId) || latestOrder;

    const getFallbackStages = (order) => {
        if (!order) return [];
        const isFulfilled = order.status === 'fulfilled';
        const isPartial = order.status === 'partial';
        
        return [
            {
                key: 'handcrafted',
                title: 'Handcrafted & Packaged',
                description: isFulfilled 
                    ? 'Your creation has been handwoven, carefully detailed, and packaged in our custom atelier box.'
                    : 'We are preparing your masterpiece at our atelier.',
                date: order.date,
                status: 'completed'
            },
            {
                key: 'dispatched',
                title: 'Dispatched',
                description: isFulfilled 
                    ? 'Handed over to our courier partner.' 
                    : 'Awaiting package handoff to courier.',
                date: isFulfilled ? order.date : null,
                status: isFulfilled ? 'completed' : isPartial ? 'active' : 'pending'
            },
            {
                key: 'in_transit',
                title: 'In Transit',
                description: isFulfilled 
                    ? 'Transit completed.' 
                    : 'Package moving through carrier network.',
                date: null,
                status: isFulfilled ? 'completed' : 'pending'
            },
            {
                key: 'out_for_delivery',
                title: 'Out for Delivery',
                description: 'Courier delivering package today.',
                date: null,
                status: isFulfilled ? 'completed' : 'pending'
            },
            {
                key: 'delivered',
                title: 'Delivered',
                description: 'Successfully received. Enjoy your heirloom creation!',
                date: isFulfilled ? order.date : null,
                status: isFulfilled ? 'completed' : 'pending'
            }
        ];
    };

    const handleAddAddress = () => {
        if (!newAddress.title || !newAddress.lines) {
            setIsAddingAddress(false);
            return;
        }
        const updatedAddresses = [
            ...addresses,
            { id: Date.now(), title: newAddress.title, lines: newAddress.lines.split('\n'), isPrimary: addresses.length === 0 }
        ];
        setAddresses(updatedAddresses);
        if (user) {
            setUser({ ...user, addresses: updatedAddresses });
        }
        setNewAddress({ title: '', lines: '' });
        setIsAddingAddress(false);
    };

    const handleEditAddressClick = (addr, e) => {
        e.stopPropagation();
        setEditingAddressId(addr.id);
        setNewAddress({ title: addr.title, lines: addr.lines.join('\n') });
        setIsAddingAddress(false);
    };

    const handleUpdateAddress = () => {
        if (!newAddress.title || !newAddress.lines) return setEditingAddressId(null);
        const updated = addresses.map(addr => addr.id === editingAddressId ? { ...addr, title: newAddress.title, lines: newAddress.lines.split('\n') } : addr);
        setAddresses(updated);
        if (user) setUser({ ...user, addresses: updated });
        setEditingAddressId(null);
        setNewAddress({ title: '', lines: '' });
    };

    const handleDeleteAddress = (id, e) => {
        e.stopPropagation();
        const updated = addresses.filter(addr => addr.id !== id);
        setAddresses(updated);
        if (user) setUser({ ...user, addresses: updated });
    };

    const handleSetPrimary = (id) => {
        const updated = addresses.map(addr => ({ ...addr, isPrimary: addr.id === id }));
        setAddresses(updated);
        if (user) setUser({ ...user, addresses: updated });
    };

    const handleSave = () => {
        setIsEditing(false);
        if (user) {
            setUser({ ...user, ...profileData });
        }
    };

    const handleSignOut = () => {
        setUser(null);
        navigate('/login');
    };

    return (
        <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-screen bg-[#fdfbf7] font-body">
            <SEO 
                title="Your Profile - Radha Mahal"
                description="View your sartorial history, bespoke journey, and saved destinations at Radha Mahal."
            />
            {/* Header Section */}
            <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-[2px] bg-[#d4af37]"></div>
                        <span className="text-[#d4af37] tracking-[0.3em] uppercase text-xs font-bold" >
                            Your Digital Atelier
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-8xl text-primary font-bold tracking-tight mb-6 font-display" >
                        My Account
                    </h1>
                    <p className="text-[#000000] text-xl max-w-2xl italic font-headline" >
                        Welcome back, {(profileData.name || 'Patron').split(' ')[0]}. Your sartorial history and bespoke journey await.
                    </p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-6 py-3 border border-primary/20 text-primary rounded-full hover:bg-primary hover:text-[#fdfbf7] transition-all duration-300 text-xs font-bold uppercase tracking-widest font-display"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Profile Info Card */}
                <section className="md:col-span-4 p-10 rounded-[2.5rem] bg-white border border-[#d4af37]/10 shadow-[0_20px_50px_rgba(74,26,107,0.05)] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-6">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    {user?.photoUrl ? (
                                        <div className="w-20 h-20 rounded-full border-2 border-[#d4af37] overflow-hidden">
                                            <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border-2 border-[#d4af37]/30 group-hover:border-[#d4af37] transition-colors">
                                            <User className="w-8 h-8 text-[#d4af37]" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-[#fdfbf7] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoUpload} 
                                        onClick={(e) => e.stopPropagation()}
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                </div>
                                <h2 className="text-3xl text-primary" >Profile Details</h2>
                            </div>
                            <button onClick={() => setIsEditing(!isEditing)} className="text-[#d4af37] hover:scale-110 transition-transform p-2 bg-[#d4af37]/10 rounded-full font-display">
                                {isEditing ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="space-y-8">
                            <div className="group">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold mb-2">Full Name</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all px-0 py-2 text-xl font-medium text-primary"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-[#d4af37]" />
                                        <p className="text-xl font-medium text-primary">{profileData.name}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold mb-2">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all px-0 py-2 text-primary"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-[#d4af37]" />
                                        <p className="text-[#000000]">{profileData.email}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold mb-2">Phone</p>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all px-0 py-2 text-primary"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-[#d4af37]" />
                                        <p className="text-[#000000]">{profileData.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-12">
                        {isEditing ? (
                            <button onClick={handleSave} className="w-full py-4 bg-primary text-[#fdfbf7] rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#3d1259] transition-all shadow-xl">
                                Save Changes
                            </button>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="w-full py-4 border border-primary text-primary rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-[#fdfbf7] transition-all">
                                Update Details
                            </button>
                        )}
                    </div>
                </section>

                {/* My Loom Heritage (Bespoke Tracker) */}
                <section className="md:col-span-8 bg-primary p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl text-[#d4af37] mb-10 flex items-center justify-between" >
                            <span>My Loom Heritage</span>
                            {loadingTracking && (
                                <span className="text-xs text-white/40 normal-case font-body flex items-center gap-2">
                                    <span className="animate-spin h-3 w-3 border border-t-transparent border-[#d4af37] rounded-full"></span>
                                    Syncing...
                                </span>
                            )}
                        </h2>
                        {trackedOrder ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 font-display">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                                            <Package className="w-10 h-10 text-[#d4af37]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl text-[#fdfbf7]" >{trackedOrder.items[0]?.title || 'Bespoke Creation'}</h3>
                                            <p className="text-white/50 text-sm font-headline">Order #{trackedOrder.id} • {trackedOrder.date}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Timeline stages */}
                                    <div className="relative pl-2 py-2">
                                        {(trackingDetails?.stages || getFallbackStages(trackedOrder)).map((stage, idx, arr) => {
                                            const isCompleted = stage.status === 'completed';
                                            const isActive = stage.status === 'active';
                                            const isPending = stage.status === 'pending';
                                            const isCancelled = stage.status === 'cancelled';

                                            return (
                                                <div key={stage.key} className="relative pl-8 pb-6 last:pb-0">
                                                    {/* Connecting Line */}
                                                    {idx < arr.length - 1 && (
                                                        <div className={`absolute left-3 top-6 bottom-0 w-[2px] transition-colors duration-500
                                                            ${isCompleted && (arr[idx+1].status === 'completed' || arr[idx+1].status === 'active')
                                                                ? 'bg-[#d4af37]' 
                                                                : 'bg-white/10'
                                                            }`} 
                                                        />
                                                    )}

                                                    {/* Timeline node */}
                                                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border transition-all duration-500 z-10
                                                        ${isCompleted 
                                                            ? 'bg-[#d4af37] border-[#d4af37] text-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]' 
                                                            : isActive 
                                                            ? 'bg-[#1a0b2e] border-[#d4af37] text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-pulse' 
                                                            : isCancelled 
                                                            ? 'bg-red-950 border-red-500 text-red-500'
                                                            : 'bg-[#1a0b2e] border-white/20 text-white/30'
                                                        }`}
                                                    >
                                                        {isCompleted ? (
                                                            <Check className="w-3.5 h-3.5 text-primary" />
                                                        ) : (
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#d4af37]' : 'bg-current'}`} />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className={`transition-all duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                                                        <div className="flex flex-wrap items-baseline gap-x-3 mb-1">
                                                            <span className={`font-display text-sm font-bold tracking-wider uppercase ${isActive ? 'text-[#d4af37]' : 'text-[#fdfbf7]'}`}>
                                                                {stage.title}
                                                            </span>
                                                            {stage.date && (
                                                                <span className="text-[10px] font-headline text-white/40 tracking-wider">
                                                                    {stage.date}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-white/60 font-body leading-relaxed max-w-md font-sans">
                                                            {stage.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="p-8 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-sm self-start">
                                    <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        Atelier Update
                                    </h4>
                                    <p className="text-white/80 italic leading-relaxed text-sm mb-6" >
                                        {trackingDetails?.tracking ? 
                                            `Your masterpiece has been handed to our logistics partners (${trackingDetails.tracking.company}). Follow its journey below.` :
                                            trackedOrder.tracking ?
                                            `Your masterpiece has been handed to our logistics partners (${trackedOrder.tracking.company}). Follow its journey below.` :
                                            `"Our master artisans are currently performing the intricate 'Zari' work on your garment. Each thread is being treated with the utmost care."`}
                                    </p>
                                    {(trackingDetails?.tracking || trackedOrder.tracking) ? (
                                        <a 
                                            href={trackingDetails?.tracking?.url || trackedOrder.tracking?.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4d56f] transition-colors text-xs font-bold uppercase tracking-widest group font-display"
                                        >
                                            <Package className="w-4 h-4" />
                                            Live Tracking #{trackingDetails?.tracking?.number || trackedOrder.tracking?.number}
                                            <div className="w-0 h-[1px] bg-[#d4af37] group-hover:w-full transition-all duration-300"></div>
                                        </a>
                                    ) : (
                                        <button className="flex items-center gap-2 text-[#d4af37] hover:text-[#f4d56f] transition-colors text-xs font-bold uppercase tracking-widest group">
                                            <MessageSquare className="w-4 h-4" />
                                            Talk to Atelier
                                            <div className="w-0 h-[1px] bg-[#d4af37] group-hover:w-full transition-all duration-300"></div>
                                        </button>
                                    )}

                                    {/* Items list inside this tracker */}
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest mb-4">Garments in Order</h4>
                                        <div className="space-y-4">
                                            {trackedOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    {item.image && (
                                                        <img src={item.image} alt={item.title} className="w-10 h-12 object-cover rounded-lg border border-white/10" />
                                                    )}
                                                    <div>
                                                        <p className="text-xs text-white font-medium line-clamp-1">{item.title}</p>
                                                        <p className="text-[10px] text-white/40 font-display">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Package className="w-16 h-16 text-white/20 mb-6" />
                                <p className="text-white/60 italic max-w-sm">No bespoke creations in progress. When you secure a piece, its heritage journey will be tracked here.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Order History Section */}
                <section className="md:col-span-7 p-10 rounded-[2.5rem] bg-white border border-[#d4af37]/10 shadow-[0_20px_50px_rgba(74,26,107,0.05)]">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl text-primary" >Sartorial History</h2>
                        {allOrders.length > 2 && (
                            <button onClick={() => setShowAllOrders(!showAllOrders)} className="text-[#d4af37] text-xs uppercase tracking-widest font-bold hover:text-primary transition-colors font-display">
                                {showAllOrders ? 'Show Less' : 'View All History'}
                            </button>
                        )}
                    </div>
                    <div className="space-y-6">
                        {allOrders.length > 0 ? (
                            (showAllOrders ? allOrders : allOrders.slice(0, 3)).map(order => (
                                <div key={order.id} className="group p-6 rounded-[1.5rem] bg-[#fdfbf7]/50 hover:bg-white hover:shadow-[0_10px_30px_rgba(74,26,107,0.08)] transition-all duration-500 border border-transparent hover:border-[#d4af37]/20 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="h-24 w-20 bg-white rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                                            <img alt={order.items[0]?.title} src={order.items[0]?.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-lg text-primary font-medium line-clamp-1" >{order.items[0]?.title} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</h4>
                                            <p className="text-xs text-[#000000] tracking-wide font-display">{order.status.toUpperCase()} • {order.date}</p>
                                            <Link 
                                                to={`/product/${order.items[0]?.id}#reviews`} 
                                                className="inline-flex items-center gap-2 text-[10px] font-bold text-[#d4af37] uppercase tracking-widest hover:text-primary transition-colors mt-2"
                                            >
                                                <Star className="w-3 h-3 fill-current" />
                                                Rate & Review
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <p className="text-[#d4af37] font-bold text-lg">₹{order.total.toLocaleString('en-IN')}</p>
                                        <button 
                                            onClick={() => setTrackedOrderId(order.id)}
                                            className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-full transition-all duration-300 font-bold ${trackedOrderId === order.id ? 'bg-[#d4af37] text-white shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37] hover:text-white'}`}
                                        >
                                            {trackedOrderId === order.id ? 'Tracking' : 'Track'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-16">
                                <p className="text-[#000000] mb-8 italic">Your order history is an empty canvas.</p>
                                <Link to="/catalog" className="inline-block px-10 py-3 bg-primary text-[#fdfbf7] rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-[#3d1259]">
                                    Discover The Collection
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Saved Addresses */}
                <section className="md:col-span-5 p-10 rounded-[2.5rem] bg-white border border-[#d4af37]/10 shadow-[0_20px_50px_rgba(74,26,107,0.05)]">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl text-primary" >Saved Addresses</h2>
                        <button onClick={() => setIsAddingAddress(!isAddingAddress)} className="p-2 bg-[#d4af37] text-white rounded-full hover:scale-110 transition-transform shadow-lg font-body">
                            {isAddingAddress ? <X className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                        </button>
                    </div>

                    {isAddingAddress && (
                        <div className="mb-10 p-6 border border-[#d4af37]/20 rounded-3xl bg-[#fdfbf7]">
                            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Add New Destination</h3>
                            <input
                                type="text"
                                placeholder="Address Title (e.g. Home, Studio)"
                                className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-sm font-medium text-primary mb-4 placeholder-primary/30"
                                value={newAddress.title}
                                onChange={e => setNewAddress({ ...newAddress, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Full Address Details"
                                rows="3"
                                className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-sm font-medium text-primary mb-6 resize-none placeholder-primary/30"
                                value={newAddress.lines}
                                onChange={e => setNewAddress({ ...newAddress, lines: e.target.value })}
                            ></textarea>
                            <button onClick={handleAddAddress} className="w-full py-3 bg-primary text-[#fdfbf7] rounded-full uppercase tracking-widest text-xs font-bold hover:bg-[#3d1259] transition-all">
                                Save Address
                            </button>
                        </div>
                    )}

                    <div className="space-y-6">
                        {addresses.length > 0 ? addresses.map((addr) => (
                            <div key={addr.id} onClick={() => handleSetPrimary(addr.id)} className={`p-6 border-2 rounded-3xl relative transition-all duration-300 cursor-pointer group ${addr.isPrimary ? 'border-[#d4af37] bg-[#fdfbf7]' : 'border-transparent bg-[#fdfbf7]/50 hover:border-[#d4af37]/30'}`}>
                                {editingAddressId === addr.id ? (
                                    <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                                        <input type="text" value={newAddress.title} onChange={e => setNewAddress({ ...newAddress, title: e.target.value })} className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-sm font-bold text-primary mb-4" />
                                        <textarea value={newAddress.lines} onChange={e => setNewAddress({ ...newAddress, lines: e.target.value })} className="w-full bg-transparent border-0 border-b border-primary/20 focus:border-[#d4af37] focus:ring-0 transition-all py-3 px-0 text-sm font-medium text-primary mb-6 resize-none" rows="3"></textarea>
                                        <div className="flex gap-4">
                                            <button onClick={handleUpdateAddress} className="flex-1 py-2 bg-primary text-[#fdfbf7] rounded-full uppercase tracking-widest text-xs font-bold">Update</button>
                                            <button onClick={() => setEditingAddressId(null)} className="flex-1 py-2 border border-primary/20 text-primary rounded-full uppercase tracking-widest text-xs font-bold">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <MapPin className={`w-4 h-4 ${addr.isPrimary ? 'text-[#d4af37]' : 'text-primary/30'}`} />
                                                <h4 className={`text-xs font-bold uppercase tracking-widest transition-colors ${addr.isPrimary ? 'text-primary' : 'text-primary/60'}`}>{addr.title}</h4>
                                            </div>
                                            <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => handleEditAddressClick(addr, e)} className="text-primary/40 hover:text-[#d4af37] transition-colors"><Edit3 className="w-4 h-4" /></button>
                                                <button onClick={(e) => handleDeleteAddress(addr.id, e)} className="text-primary/40 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed text-[#000000]" >
                                            {addr.lines.map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)}
                                        </p>
                                        {addr.isPrimary && (
                                            <div className="mt-4 flex items-center gap-2 text-[#d4af37] text-[10px] font-bold uppercase tracking-widest">
                                                <CheckCircle className="w-3 h-3" />
                                                Primary Destination
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )) : (
                            <p className="text-primary/30 text-center py-10 italic">No destinations saved.</p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
