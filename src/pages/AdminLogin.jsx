import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { markAdminLoggedIn } from '../lib/auth';
import { toast } from 'sonner';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
            const res = await fetch(`${BASE}/api/v1/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Accept the HttpOnly cookie from the server
                body: JSON.stringify(credentials)
            });
            
            const data = await res.json();
            
            if (res.ok && data.success) {
                markAdminLoggedIn();
                toast.success('Admin login successful');
                // Allow state updates to flush before navigating
                setTimeout(() => navigate('/admin'), 100);
            } else {
                toast.error(data.message || 'Invalid admin credentials');
            }
        } catch (err) {
            console.error('Admin login error:', err);
            toast.error('Failed to connect to authentication server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#e8e4db]"
            >
                <div className="flex justify-center mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Lock className="text-primary w-6 h-6" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-serif text-primary text-center mb-2">Admin Portal</h1>
                <p className="text-[#8b8276] text-center mb-8 text-sm">Sign in to access the management dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 bg-[#fdfbf7] border border-[#e8e4db] rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                            value={credentials.email}
                            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-primary mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full p-3 bg-[#fdfbf7] border border-[#e8e4db] rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none pr-12"
                                value={credentials.password}
                                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-colors font-medium mt-6 flex justify-center items-center h-[52px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
