import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { loginCustomer } from './shopifyClient';

export default function Login() {
    const navigate = useNavigate();
    const { setUser } = useApp();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [authError, setAuthError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAuthError('');
        
        const { customer, error } = await loginCustomer(credentials.email, credentials.password);
        
        if (error) {
            setAuthError(error);
            setLoading(false);
            return;
        }

        if (customer) {
            const savedProfileStr = localStorage.getItem(`radha_mahal_profile_${customer.email}`);
            let localProfile = {};
            try { if (savedProfileStr) localProfile = JSON.parse(savedProfileStr); } catch (e) {}

            setUser({ 
                name: localProfile.name || `${customer.firstName} ${customer.lastName}`, 
                email: customer.email,
                phone: localProfile.phone || customer.phone || '',
                shopifyId: customer.id,
                photoUrl: localProfile.photoUrl,
                addresses: localProfile.addresses || [],
                orders: customer.parsedOrders || localProfile.orders || []
            });
            navigate('/profile');
        }
        setLoading(false);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            const nameParts = name ? name.split(' ') : ['Google', 'User'];
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Patron';
            const password = sub ? `${sub.substring(0, 10)}!G Auth` : Math.random().toString(36).slice(-10) + '!';

            const { registerCustomer } = await import('./shopifyClient');
            
            const regCheck = await registerCustomer({
                email, password, firstName, lastName
            });

            if (regCheck.customerUserErrors && regCheck.customerUserErrors.some(e => e.message.toLowerCase().includes('taken'))) {
                // R10/L5: Email is taken, so user is existing! Login via local state.
                const savedProfileStr = localStorage.getItem(`radha_mahal_profile_${email}`);
                let localProfile = {};
                try { if (savedProfileStr) localProfile = JSON.parse(savedProfileStr); } catch (e) {}

                setUser({ 
                    name: localProfile.name || name, 
                    email, 
                    photoUrl: localProfile.photoUrl, 
                    addresses: localProfile.addresses || [], 
                    phone: localProfile.phone || '', 
                    orders: localProfile.orders || [] 
                });
                navigate('/profile');
            } else {
                // L6: User not existing.
                throw new Error("Customer not found. Please Request an Invitation");
            }
        } catch (err) {
            console.error('Google Auth Error:', err);
            setAuthError(err.message || 'Authentication failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex font-body bg-[#fdfbf7]">
            <div className="hidden lg:block lg:w-1/2 relative bg-primary">
                <img src="/login-campaign.png" alt="Campaign" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-16">
                    <h2 className="text-[#fdfbf7] font-display text-5xl leading-tight">
                        The Art of <br/><span className="italic text-[#d4af37]">Elegance</span>
                    </h2>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
                <div className="max-w-md w-full space-y-10">
                    <div className="text-center">
                        <Link to="/" className="inline-block mb-12">
                            <span className="font-display text-3xl text-primary font-bold tracking-widest">Radha Mahal</span>
                        </Link>
                        <h2 className="font-display text-4xl text-primary mb-3">Welcome Back</h2>
                        <p className="text-[#000000] text-sm md:text-base">Sign in to your private atelier.</p>
                    </div>

                    {authError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-xs text-center animate-shake">
                            {authError}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-2 font-bold">Email Address</label>
                                <input
                                    required disabled={loading} type="email" value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary placeholder-primary/30"
                                    placeholder="princess@example.com"
                                />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-2 font-bold">Password</label>
                                <input
                                    required disabled={loading} type="password" value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary tracking-widest placeholder-primary/30"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`w-full py-4 mt-8 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:-translate-y-1 ${loading ? 'bg-primary/50 text-[#fdfbf7]' : 'bg-primary text-[#fdfbf7] hover:bg-primary/90'}`}
                        >
                            {loading ? 'Authenticating...' : 'Sign In Securely'}
                        </button>
                    </form>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-primary/10"></div>
                        <span className="flex-shrink-0 mx-4 text-primary/40 text-[10px] uppercase tracking-widest font-bold">Or Continue With</span>
                        <div className="flex-grow border-t border-primary/10"></div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setAuthError('Google connection failed.')} theme="outline" shape="pill" text="continue_with" />
                    </div>

                    <div className="pt-6 text-center">
                        <p className="text-xs text-[#000000]">
                            New to Radha Mahal?{' '}
                            <Link to="/register" className="font-display text-primary hover:text-secondary italic text-lg ml-2 transition-colors">
                                Request an Invitation
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
