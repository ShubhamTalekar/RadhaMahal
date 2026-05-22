import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { activateCustomerByUrl } from '../shopifyClient';

export default function Activate() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useApp();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activationUrl, setActivationUrl] = useState('');

    useEffect(() => {
        const url = searchParams.get('activation_url');
        if (url) {
            setActivationUrl(url);
        } else {
            setError('Invalid or missing activation URL. Please check the link from your email.');
        }
    }, [searchParams]);

    const handleActivate = async (e) => {
        e.preventDefault();
        
        if (!activationUrl) {
            setError('Activation URL is missing.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 5) {
            setError('Password must be at least 5 characters long.');
            return;
        }

        setLoading(true);
        setError('');

        const { customer, customerAccessToken, customerUserErrors } = await activateCustomerByUrl(activationUrl, password);

        if (customerUserErrors && customerUserErrors.length > 0) {
            setError(customerUserErrors[0].message);
            setLoading(false);
            return;
        }

        if (customer && customerAccessToken) {
            setUser({ 
                name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(), 
                email: customer.email, 
                phone: customer.phone,
                shopifyId: customer.id,
                shopifyToken: customerAccessToken.accessToken
            });

            navigate('/profile');
        } else {
            setError('Account activation failed. Please try again or contact support.');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex font-body bg-[#fdfbf7] flex-row-reverse pt-20">
            <div className="w-full flex items-center justify-center p-8 md:p-16 relative">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Link to="/" className="inline-block mb-10">
                            <span className="font-display text-3xl text-primary font-bold tracking-widest">Radha Mahal</span>
                        </Link>
                        <h2 className="font-display text-3xl text-primary mb-2 italic">Activate Your Account</h2>
                        <p className="text-[#000000] text-xs md:text-sm px-4">
                            Set a password to complete your Radha Mahal profile activation.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleActivate}>
                        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-xs text-center animate-shake">{error}</div>}
                        
                        <div className="grid grid-cols-1 gap-5">
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-1 font-bold">New Password</label>
                                <input 
                                    required 
                                    disabled={loading || !activationUrl} 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary tracking-widest placeholder-primary/30" 
                                    placeholder="••••••••" 
                                />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-1 font-bold">Confirm Password</label>
                                <input 
                                    required 
                                    disabled={loading || !activationUrl} 
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary tracking-widest placeholder-primary/30" 
                                    placeholder="••••••••" 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !activationUrl} 
                            className={`w-full py-4 mt-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:-translate-y-1 ${loading || !activationUrl ? 'bg-primary/50 text-[#fdfbf7] cursor-not-allowed' : 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-[#fdfbf7]'}`}
                        >
                            {loading ? 'Activating...' : 'Activate Account'}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-xs text-[#000000]">
                            Already active?{' '}
                            <Link to="/login" className="font-display text-primary hover:text-secondary italic text-lg ml-2 transition-colors">Return to Mahal</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
