import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { registerCustomer } from '../shopifyClient';
import SEO from '../components/SEO';

export default function Register() {
    const navigate = useNavigate();
    const { setUser } = useApp();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const nameParts = formData.name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Mahal Patron';

        const { customer, customerUserErrors } = await registerCustomer({
            email: formData.email,
            password: formData.password,
            firstName,
            lastName,
            phone: formData.phone || undefined,
            acceptsMarketing: true,
        });

        if (customerUserErrors && customerUserErrors.length > 0) {
            setError(customerUserErrors[0].message);
            setLoading(false);
            return;
        }

        if (customer) {
            setUser({
                name: `${customer.firstName} ${customer.lastName}`,
                email: customer.email,
                phone: customer.phone,
                shopifyId: customer.id,
            });

            navigate('/profile');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex font-body bg-[#fdfbf7] flex-row-reverse">
            <SEO 
                title="Register - Radha Mahal"
                description="Create your exclusive Radha Mahal profile to track bespoke orders and build your wishlist."
            />
            <div className="hidden lg:block lg:w-1/2 relative bg-[#4b284d]">
                <img
                    src="/register-campaign.png"
                    alt="Campaign"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#4b284d]/90 via-[#4b284d]/20 to-transparent flex items-end p-16">
                    <h2 className="text-[#fdfbf7] font-display text-5xl leading-tight">
                        Weave Your <br />
                        <span className="italic text-[#d4af37]">Story</span>
                    </h2>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <Link to="/" className="inline-block mb-10">
                            <span className="font-display text-3xl text-primary font-bold tracking-widest">
                                Radha Mahal
                            </span>
                        </Link>
                        <h2 className="font-display text-3xl text-primary mb-2 italic">Begin Your Heritage Journey</h2>
                        <p className="text-[#000000] text-xs md:text-sm px-4">
                            Create your exclusive Radha Mahal profile to track bespoke orders and build your wishlist.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-700 text-xs text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5">
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-1 font-bold">
                                    Full Name
                                </label>
                                <input
                                    required
                                    disabled={loading}
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary placeholder-primary/30"
                                    placeholder="Full Name"
                                />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-1 font-bold">
                                    Email Address
                                </label>
                                <input
                                    required
                                    disabled={loading}
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary placeholder-primary/30"
                                    placeholder="Email Address"
                                />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-1 font-bold">
                                    Phone (Optional)
                                </label>
                                <input
                                    disabled={loading}
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary placeholder-primary/30"
                                    placeholder="Phone (Optional)"
                                />
                            </div>
                            <div className="relative group">
                                <label className="block text-[10px] uppercase tracking-widest text-primary/60 mb-1 font-bold">
                                    Password
                                </label>
                                <input
                                    required
                                    disabled={loading}
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="autofill-light w-full bg-transparent border-0 border-b border-primary/20 focus:ring-0 focus:border-primary transition-all py-2 px-0 text-primary tracking-widest placeholder-primary/30"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 mt-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:-translate-y-1 ${loading ? 'bg-primary/50 text-[#fdfbf7]' : 'bg-transparent border border-primary text-primary hover:bg-primary hover:text-[#fdfbf7]'}`}
                        >
                            {loading ? 'Creating Heritage Profile...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-xs text-[#000000]">
                            Already a patron?{' '}
                            <Link
                                to="/login"
                                className="font-display text-primary hover:text-secondary italic text-lg ml-2 transition-colors"
                            >
                                Return to Mahal
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
