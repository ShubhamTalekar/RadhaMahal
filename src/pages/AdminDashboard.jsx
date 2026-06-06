import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Users,
    Activity,
    LogOut,
    CheckCircle,
    Trash2,
    Heart,
    RefreshCw,
    Type,
    MessageSquare,
    Star,
    Edit,
    Plus,
    X,
} from 'lucide-react';
import { adminLogout, isAdminAuthenticated } from '../lib/auth';
import { config } from '../lib/config';

export default function AdminDashboard() {
    const { user, setUser } = useApp();
    const navigate = useNavigate();

    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const [bannerConfig, setBannerConfig] = useState({
        titlePrefix: '',
        titleHighlight: '',
        description: '',
        buttonText: '',
        discountNum: '',
        discountLabel: '',
        designsNum: '',
        designsLabel: '',
        badgeTitle: '',
        badgeLabel: '',
        marqueeText: '',
    });
    const [bannerLoaded, setBannerLoaded] = useState(false);
    const [savingBanner, setSavingBanner] = useState(false);
    const [adminToast, setAdminToast] = useState(null);
    const showAdminToast = (msg, type = 'success') => {
        setAdminToast({ msg, type });
        setTimeout(() => setAdminToast(null), 3500);
    };

    const [adminReviews, setAdminReviews] = useState([]);
    const [fetchingReviews, setFetchingReviews] = useState(false);
    const [editingReview, setEditingReview] = useState(null); // { productId, id, author, rating, comment, isVerified }
    const [showReviewForm, setShowReviewForm] = useState(false); // for create or edit
    const [reviewFormState, setReviewFormState] = useState({
        productId: '',
        author: '',
        rating: 5,
        comment: '',
        isVerified: false,
    });

    const fetchAdminReviews = async () => {
        setFetchingReviews(true);
        try {
            const BASE = config.API_BASE_URL;
            const response = await fetch(`${BASE}/api/v1/admin/reviews`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setAdminReviews(data.reviews);
            }
        } catch (e) {
            console.error('Failed to fetch admin reviews:', e);
        } finally {
            setFetchingReviews(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'reviews') {
            fetchAdminReviews();
        }
    }, [activeTab]);

    const handleCreateOrUpdateReview = async e => {
        e.preventDefault();
        const BASE = config.API_BASE_URL;
        const isEditing = !!editingReview;
        const url = isEditing
            ? `${BASE}/api/v1/admin/reviews/${editingReview.productId}/${editingReview.id}`
            : `${BASE}/api/v1/admin/reviews/${reviewFormState.productId}`;

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    author: reviewFormState.author,
                    rating: Number(reviewFormState.rating),
                    comment: reviewFormState.comment,
                    isVerified: reviewFormState.isVerified,
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                showAdminToast(isEditing ? 'Review updated successfully!' : 'Review created successfully!');
                setShowReviewForm(false);
                setEditingReview(null);
                setReviewFormState({ productId: '', author: '', rating: 5, comment: '', isVerified: false });
                fetchAdminReviews();
            } else {
                showAdminToast(data.message || 'Failed to save review', 'error');
            }
        } catch {
            showAdminToast('Network error saving review', 'error');
        }
    };

    const handleDeleteReview = async (productId, reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        const BASE = config.API_BASE_URL;
        try {
            const response = await fetch(`${BASE}/api/v1/admin/reviews/${productId}/${reviewId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showAdminToast('Review deleted successfully!');
                fetchAdminReviews();
            } else {
                showAdminToast(data.message || 'Failed to delete review', 'error');
            }
        } catch {
            showAdminToast('Network error deleting review', 'error');
        }
    };

    const startEditReview = rev => {
        setEditingReview(rev);
        setReviewFormState({
            productId: rev.productId,
            author: rev.author || rev.userName || '',
            rating: rev.rating,
            comment: rev.comment,
            isVerified: !!rev.isVerified,
        });
        setShowReviewForm(true);
    };

    useEffect(() => {
        if (activeTab === 'content' && !bannerLoaded) {
            const fetchBanner = async () => {
                try {
                    const BASE = config.API_BASE_URL;
                    const response = await fetch(`${BASE}/api/v1/public/banner`);
                    const data = await response.json();
                    if (data.success && data.data) {
                        setBannerConfig(data.data);
                        setBannerLoaded(true);
                    }
                } catch (e) {
                    console.error(e);
                }
            };
            fetchBanner();
        }
    }, [activeTab, bannerLoaded]);

    const handleSaveBanner = async e => {
        e.preventDefault();
        setSavingBanner(true);
        try {
            const BASE = config.API_BASE_URL;

            const formData = new FormData();
            formData.append('titlePrefix', bannerConfig.titlePrefix);
            formData.append('titleHighlight', bannerConfig.titleHighlight);
            formData.append('description', bannerConfig.description);
            formData.append('buttonText', bannerConfig.buttonText);
            formData.append('marqueeText', bannerConfig.marqueeText);
            formData.append('discountNum', bannerConfig.discountNum);
            formData.append('discountLabel', bannerConfig.discountLabel);
            formData.append('designsNum', bannerConfig.designsNum);
            formData.append('designsLabel', bannerConfig.designsLabel);
            formData.append('badgeTitle', bannerConfig.badgeTitle);
            formData.append('badgeLabel', bannerConfig.badgeLabel);

            if (bannerConfig.imageFile) {
                formData.append('image', bannerConfig.imageFile);
            }

            const response = await fetch(`${BASE}/api/v1/admin/banner`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showAdminToast('Banner updated successfully!');
                // Clear the file from state after successful upload
                setBannerConfig(prev => ({ ...prev, imageFile: null }));
            } else {
                if (response.status === 401) navigate('/login');
                showAdminToast(data.message || 'Server error saving banner', 'error');
            }
        } catch {
            showAdminToast('Network error — could not reach server', 'error');
        } finally {
            setSavingBanner(false);
        }
    };

    useEffect(() => {
        if (!isAdminAuthenticated()) {
            navigate('/admin/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const BASE = config.API_BASE_URL;
                const response = await fetch(`${BASE}/api/v1/admin/dashboard`, {
                    credentials: 'include',
                });

                if (response.status === 401) {
                    await adminLogout();
                    navigate('/admin/login');
                    return;
                }

                const data = await response.json();
                if (data.success) {
                    setAdminData(data.data);
                } else {
                    setErrorMsg(data.error || 'Failed to load data');
                }
            } catch (err) {
                console.error('Failed to load admin data', err);
                setErrorMsg('Network error connecting to backend API');
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user, navigate]);

    const handleLogout = async () => {
        await adminLogout();
        setUser(null);
        navigate('/');
    };

    const handleDeleteUser = async email => {
        if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

        try {
            const BASE = config.API_BASE_URL;
            const response = await fetch(`${BASE}/api/v1/admin/users/delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email }),
            });
            if (response.ok) {
                setAdminData(prev => ({
                    ...prev,
                    users: prev.users.filter(u => u.email !== email),
                }));
            }
        } catch (error) {
            console.error('Delete user failed', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center font-body">
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center font-body space-y-4 p-8 text-center">
                <h3 className="font-headline text-3xl text-red-600">Authentication Error</h3>
                <p className="max-w-md text-primary/70">{errorMsg}</p>
                <div className="bg-white p-4 rounded text-left border shadow-sm text-sm mt-4 w-full max-w-lg">
                    <p className="font-bold mb-2">How to fix this:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>
                            Open your <code className="bg-gray-100 px-1 rounded">.env</code> or{' '}
                            <code className="bg-gray-100 px-1 rounded">.env.local</code> file
                        </li>
                        <li>Add your valid Shopify Admin API token:</li>
                        <code className="block bg-gray-100 p-2 mt-1 rounded break-all">
                            SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
                        </code>
                        <li>Restart your backend server</li>
                    </ul>
                </div>
                <button
                    onClick={handleLogout}
                    className="mt-8 px-8 py-3 bg-primary text-white uppercase tracking-widest font-bold text-xs rounded-full hover:bg-primary/90 transition-colors"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    if (!adminData) return null;

    const { users, orders, analytics } = adminData;

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-body text-primary pt-24 pb-12 px-6 lg:px-16 flex flex-col md:flex-row gap-8">
            {/* Toast Notification */}
            {adminToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-60 sm:w-72 text-[10px] sm:text-xs">
                    <div className="cursor-default flex items-center justify-between w-full h-12 sm:h-14 rounded-lg bg-[#232531] px-[10px] shadow-2xl">
                        <div className="flex gap-2 items-center">
                            <div
                                className={`${adminToast.type === 'error' ? 'text-red-400' : 'text-[#2b9875]'} bg-white/5 backdrop-blur-xl p-1 rounded-lg`}
                            >
                                {adminToast.type === 'error' ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="w-5 h-5"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="text-white font-semibold">
                                    {adminToast.type === 'error' ? 'Error' : 'Saved!'}
                                </p>
                                <p className="text-gray-400">{adminToast.msg}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAdminToast(null)}
                            className="text-gray-500 hover:bg-white/5 p-1 rounded-md transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="p-6 bg-white shadow-xl rounded-2xl border border-primary/5 sticky top-32">
                    <h2 className="font-display text-2xl mb-8 flex items-center gap-3">
                        <Activity className="w-6 h-6 text-[#d4af37]" /> Atelier Admin
                    </h2>

                    <nav className="space-y-2">
                        {[
                            { id: 'overview', icon: Activity, label: 'Analytics' },
                            { id: 'users', icon: Users, label: 'Patrons & Wishlists' },
                            { id: 'orders', icon: Package, label: 'Purchases' },
                            { id: 'content', icon: Type, label: 'Content Settings' },
                            { id: 'reviews', icon: MessageSquare, label: 'Reviews / Comments' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-bold uppercase tracking-widest ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-[#fdfbf7]'
                                        : 'hover:bg-primary/5 text-primary/70'
                                }`}
                            >
                                <tab.icon className="w-5 h-5 flex-shrink-0" /> {tab.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="mt-12 w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all text-sm font-bold uppercase tracking-widest"
                    >
                        <LogOut className="w-5 h-5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        <h3 className="font-headline text-4xl mb-6">Store Analytics</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-primary/5 border border-primary/5">
                                <p className="text-xs uppercase tracking-widest font-bold text-primary/50 mb-2">
                                    Total Revenue
                                </p>
                                <p className="text-3xl font-display text-[#d4af37]">
                                    ₹{analytics.totalRevenue.toLocaleString('en-IN')}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-primary/5 border border-primary/5">
                                <p className="text-xs uppercase tracking-widest font-bold text-primary/50 mb-2">
                                    Total Orders
                                </p>
                                <p className="text-3xl font-display">{analytics.totalOrders}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-xl shadow-primary/5 border border-primary/5">
                                <p className="text-xs uppercase tracking-widest font-bold text-primary/50 mb-2">
                                    Total Patrons
                                </p>
                                <p className="text-3xl font-display">{users.length}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-primary/5">
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-[#d4af37]" /> Top Wishlisted Products
                                </h4>
                                <ul className="space-y-4">
                                    {analytics.topWishlisted.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="flex justify-between items-center text-sm border-b border-primary/5 pb-2"
                                        >
                                            <span className="truncate pr-4">{item.title}</span>
                                            <span className="font-bold flex-shrink-0 bg-primary/5 px-2 py-1 rounded">
                                                {item.count} lists
                                            </span>
                                        </li>
                                    ))}
                                    {analytics.topWishlisted.length === 0 && (
                                        <p className="text-sm text-primary/50 italic">No wishlist data yet.</p>
                                    )}
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-primary/5">
                                <h4 className="font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" /> Best Sellers
                                </h4>
                                <ul className="space-y-4">
                                    {analytics.bestSellers.map((item, idx) => (
                                        <li
                                            key={idx}
                                            className="flex justify-between items-center text-sm border-b border-primary/5 pb-2"
                                        >
                                            <span className="truncate pr-4">{item.title}</span>
                                            <span className="font-bold flex-shrink-0 bg-primary/5 px-2 py-1 rounded">
                                                {item.sold} sold
                                            </span>
                                        </li>
                                    ))}
                                    {analytics.bestSellers.length === 0 && (
                                        <p className="text-sm text-primary/50 italic">No sales data yet.</p>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-headline text-4xl mb-6">Patrons Directory</h3>
                        <div className="bg-white rounded-2xl shadow-xl border border-primary/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-primary/5 text-xs uppercase tracking-widest">
                                            <th className="p-4 font-bold w-1/3">Patron</th>
                                            <th className="p-4 font-bold">Wishlist Items</th>
                                            <th className="p-4 font-bold">Orders</th>
                                            <th className="p-4 font-bold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {users.map(u => (
                                            <tr
                                                key={u.id}
                                                className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors"
                                            >
                                                <td className="p-4">
                                                    <p className="font-bold">
                                                        {u.firstName} {u.lastName}
                                                    </p>
                                                    <p className="text-xs text-primary/60">{u.email}</p>
                                                </td>
                                                <td className="p-4">
                                                    {u.wishlist.length} item(s)
                                                    {u.wishlist.length > 0 && (
                                                        <div className="mt-1 text-[10px] text-primary/40 truncate max-w-[200px]">
                                                            {u.wishlist.map(w => w.title).join(', ')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center">{u.ordersCount}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteUser(u.email)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors inline-block"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-headline text-4xl mb-6">Recent Purchases</h3>
                        <div className="grid gap-4">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className="bg-white p-6 rounded-2xl shadow-md border border-primary/5 flex flex-col md:flex-row justify-between gap-4"
                                >
                                    <div>
                                        <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded inline-block mb-3">
                                            {order.id}
                                        </span>
                                        <p className="font-bold mb-1">{order.customerEmail}</p>
                                        <p className="text-xs text-primary/60">
                                            {new Date(order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                        </p>
                                    </div>
                                    <div className="md:text-right flex flex-col justify-between">
                                        <p className="font-display text-xl text-[#d4af37]">
                                            ₹{order.total.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-xs mt-2 uppercase tracking-widest font-bold">
                                            {order.items.length} item(s) purchased
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && (
                                <p className="text-center italic py-10 text-primary/50">No orders found.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="font-headline text-4xl mb-6">Content Settings</h3>

                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-primary/5">
                            <form onSubmit={handleSaveBanner} className="space-y-6">
                                <h4 className="font-bold uppercase tracking-widest text-[#d4af37] mb-6">
                                    Global Top Marquee
                                </h4>
                                <div className="mb-0 p-6 bg-[#fdfbf7] rounded-xl border border-primary/10">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                        Scrolling Announcement Text
                                    </label>
                                    <input
                                        type="text"
                                        value={bannerConfig.marqueeText || ''}
                                        onChange={e =>
                                            setBannerConfig({ ...bannerConfig, marqueeText: e.target.value })
                                        }
                                        className="w-full bg-white border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                        placeholder="e.g. Free shipping all over Maharashtra"
                                    />
                                </div>

                                <h4 className="font-bold uppercase tracking-widest text-[#d4af37] mb-6 border-t border-primary/10 pt-8 mt-8">
                                    Homepage Hero Banner
                                </h4>

                                {!bannerLoaded ? (
                                    <div className="py-10 text-center text-primary/50 flex flex-col items-center gap-3">
                                        <RefreshCw className="w-6 h-6 animate-spin" /> Fetching banner config...
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Title Prefix
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.titlePrefix}
                                                    onChange={e =>
                                                        setBannerConfig({
                                                            ...bannerConfig,
                                                            titlePrefix: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Title Highlight (Gold text)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.titleHighlight}
                                                    onChange={e =>
                                                        setBannerConfig({
                                                            ...bannerConfig,
                                                            titleHighlight: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                Description Paragraph
                                            </label>
                                            <textarea
                                                value={bannerConfig.description}
                                                onChange={e =>
                                                    setBannerConfig({ ...bannerConfig, description: e.target.value })
                                                }
                                                rows="3"
                                                className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                            ></textarea>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                Call-to-Action Button Label
                                            </label>
                                            <input
                                                type="text"
                                                value={bannerConfig.buttonText}
                                                onChange={e =>
                                                    setBannerConfig({ ...bannerConfig, buttonText: e.target.value })
                                                }
                                                className="w-full max-w-sm bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-primary/5">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Left Statistic (Number)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.discountNum}
                                                    onChange={e =>
                                                        setBannerConfig({
                                                            ...bannerConfig,
                                                            discountNum: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37] mb-3"
                                                />
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Left Subtitle
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.discountLabel}
                                                    onChange={e =>
                                                        setBannerConfig({
                                                            ...bannerConfig,
                                                            discountLabel: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Right Statistic (Number)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.designsNum}
                                                    onChange={e =>
                                                        setBannerConfig({ ...bannerConfig, designsNum: e.target.value })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37] mb-3"
                                                />
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Right Subtitle
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.designsLabel}
                                                    onChange={e =>
                                                        setBannerConfig({
                                                            ...bannerConfig,
                                                            designsLabel: e.target.value,
                                                        })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-primary/5">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Floating Badge Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.badgeTitle}
                                                    onChange={e =>
                                                        setBannerConfig({ ...bannerConfig, badgeTitle: e.target.value })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-2">
                                                    Floating Badge Subtitle
                                                </label>
                                                <input
                                                    type="text"
                                                    value={bannerConfig.badgeLabel}
                                                    onChange={e =>
                                                        setBannerConfig({ ...bannerConfig, badgeLabel: e.target.value })
                                                    }
                                                    className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2 mt-6">
                                                Background Image Upload
                                            </label>
                                            <div className="flex items-center gap-4 bg-[#fdfbf7] border border-primary/10 rounded p-4">
                                                {(bannerConfig.previewUrl || bannerConfig.imageUrl) && (
                                                    <img
                                                        src={
                                                            bannerConfig.previewUrl ||
                                                            (bannerConfig.imageUrl.startsWith('/')
                                                                ? `${config.API_BASE_URL}${bannerConfig.imageUrl}`
                                                                : bannerConfig.imageUrl)
                                                        }
                                                        alt="Preview"
                                                        className="w-16 h-16 rounded object-cover shadow-sm"
                                                    />
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={e => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setBannerConfig({ ...bannerConfig, imageFile: file });
                                                            const objectUrl = URL.createObjectURL(file);
                                                            if (bannerConfig.previewUrl)
                                                                URL.revokeObjectURL(bannerConfig.previewUrl);
                                                            setBannerConfig(prev => ({
                                                                ...prev,
                                                                previewUrl: objectUrl,
                                                            }));
                                                        }
                                                    }}
                                                    className="w-full text-sm font-semibold file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/5 file:text-primary hover:file:bg-primary/10 transition-all cursor-pointer focus:outline-none"
                                                />
                                            </div>
                                            {bannerConfig.imageFile && (
                                                <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" /> New image queued for upload
                                                </p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={savingBanner}
                                            className="mt-8 px-10 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4d56f] text-primary rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all font-bold tracking-widest uppercase text-sm disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {savingBanner ? (
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            {savingBanner ? 'Saving...' : 'Publish Changes'}
                                        </button>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-headline text-4xl">Reviews & Comments</h3>
                            <button
                                onClick={() => {
                                    setEditingReview(null);
                                    setReviewFormState({
                                        productId: '',
                                        author: '',
                                        rating: 5,
                                        comment: '',
                                        isVerified: false,
                                    });
                                    setShowReviewForm(true);
                                }}
                                className="px-6 py-3 bg-[#d4af37] text-primary rounded-full hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all font-bold tracking-widest uppercase text-xs flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Review
                            </button>
                        </div>

                        {showReviewForm && (
                            <div className="bg-white p-6 rounded-2xl border border-primary/10 shadow-xl space-y-4 max-w-lg">
                                <div className="flex justify-between items-center pb-4 border-b border-primary/5">
                                    <h4 className="font-bold uppercase tracking-widest text-[#d4af37]">
                                        {editingReview ? 'Edit Review' : 'Create New Review'}
                                    </h4>
                                    <button
                                        onClick={() => {
                                            setShowReviewForm(false);
                                            setEditingReview(null);
                                        }}
                                        className="text-primary/60 hover:text-primary"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateOrUpdateReview} className="space-y-4">
                                    {!editingReview && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">
                                                Shopify Product ID / Handle
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                value={reviewFormState.productId}
                                                onChange={e =>
                                                    setReviewFormState({
                                                        ...reviewFormState,
                                                        productId: e.target.value,
                                                    })
                                                }
                                                className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                                                placeholder="e.g. saree or numeric Shopify ID"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">
                                            Author Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={reviewFormState.author}
                                            onChange={e =>
                                                setReviewFormState({ ...reviewFormState, author: e.target.value })
                                            }
                                            className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                                            placeholder="e.g. Priya Sharma"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">
                                            Rating
                                        </label>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() =>
                                                        setReviewFormState({ ...reviewFormState, rating: num })
                                                    }
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        className={`w-6 h-6 ${num <= reviewFormState.rating ? 'fill-[#d4af37] text-[#d4af37]' : 'text-primary/20'}`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">
                                            Review Comment
                                        </label>
                                        <textarea
                                            required
                                            rows="3"
                                            value={reviewFormState.comment}
                                            onChange={e =>
                                                setReviewFormState({ ...reviewFormState, comment: e.target.value })
                                            }
                                            className="w-full bg-[#fdfbf7] border border-primary/10 rounded px-4 py-2 text-sm focus:outline-none focus:border-[#d4af37]"
                                            placeholder="Beautiful fabric and fit..."
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isVerified"
                                            checked={reviewFormState.isVerified}
                                            onChange={e =>
                                                setReviewFormState({ ...reviewFormState, isVerified: e.target.checked })
                                            }
                                            className="rounded border-primary/10 text-primary focus:ring-primary/20"
                                        />
                                        <label
                                            htmlFor="isVerified"
                                            className="text-xs font-bold uppercase tracking-widest text-primary/70 cursor-pointer"
                                        >
                                            Verified Purchase
                                        </label>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-primary text-white uppercase tracking-widest font-bold text-xs rounded-full hover:bg-primary/95 transition-all shadow-md mt-2"
                                    >
                                        Save Review
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-xl border border-primary/5 overflow-hidden">
                            {fetchingReviews ? (
                                <div className="py-20 text-center text-primary/50 flex flex-col items-center gap-3">
                                    <RefreshCw className="w-6 h-6 animate-spin" /> Fetching reviews...
                                </div>
                            ) : adminReviews.length === 0 ? (
                                <div className="py-20 text-center text-primary/50">
                                    No reviews found. Click "Add Review" to create one.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-primary/5 text-xs uppercase tracking-widest">
                                                <th className="p-4 font-bold">Product ID</th>
                                                <th className="p-4 font-bold">Author</th>
                                                <th className="p-4 font-bold">Rating</th>
                                                <th className="p-4 font-bold w-1/3">Comment</th>
                                                <th className="p-4 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {adminReviews.map(rev => (
                                                <tr
                                                    key={rev.id}
                                                    className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors"
                                                >
                                                    <td className="p-4 font-mono text-xs text-primary/60">
                                                        {rev.productId}
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-bold">{rev.author}</p>
                                                        {rev.isVerified && (
                                                            <span className="inline-block text-[9px] uppercase tracking-widest font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                                                Verified
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex text-[#d4af37]">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-3 h-3 ${star <= rev.rating ? 'fill-[#d4af37]' : 'text-primary/10'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-xs italic text-primary/70">
                                                        {rev.comment}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => startEditReview(rev)}
                                                                className="text-primary hover:text-[#d4af37] p-2 rounded transition-colors inline-block"
                                                                title="Edit review"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteReview(rev.productId, rev.id)
                                                                }
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors inline-block"
                                                                title="Delete review"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
