import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            const res = await axios.post(`${apiUrl}/api/auth/login`, { email, password });
            const { token, user } = res.data;
            login(token, user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Form Panel (Right Side via CSS) */}
            <div className="login-form-panel animate-in fade-in slide-in-from-right duration-700">
                <div className="login-form-inner">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#346eea]">
                            <Zap size={20} className="text-white fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#111827] font-black text-lg leading-tight uppercase tracking-tight">EV Acquisition</span>
                            <span className="text-[#94A3B8] text-[10px] font-black uppercase tracking-[0.2em]">system</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-[#111827] tracking-tight mb-2">Welcome back</h1>
                    <p className="text-sm text-[#6B7280] font-medium mb-8">Sign in to access your vehicle monitoring dashboard</p>

                    {error && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mb-6">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Email Address</label>
                            <div className="relative">

                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="auth-input pl-11"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Password</label>
                                <a href="#" className="text-[10px] font-black text-[#346eea] uppercase tracking-widest hover:underline">Forgot?</a>
                            </div>
                            <div className="relative">

                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="auth-input pl-11 pr-11"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#111827] transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full primary-btn h-12 flex items-center justify-center gap-3 mt-4">
                            {loading ? <span className="btn-spinner"></span> : (
                                <>
                                    <span>Sign In</span>
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-xs font-bold text-[#6B7280]">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-[#346eea] hover:underline">Create one</Link>
                    </p>
                </div>
            </div>

            {/* Hero Panel (Left Side via CSS) */}
            <div className="login-hero-panel flex-1 hidden lg:flex relative bg-[#111827] overflow-hidden items-center justify-center p-20 animate-in fade-in slide-in-from-left duration-700">
                {/* Abstract Tech Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#346eea 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#111827]/90 to-[#346eea]/5"></div>

                <div className="relative z-10 w-full max-w-lg text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-[#346eea]/10 border border-[#346eea]/20 px-3 py-1.5 rounded-lg mb-8 mx-auto lg:mx-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#346eea] animate-pulse"></div>
                        <span className="text-[10px] font-black text-[#346eea] uppercase tracking-[0.2em]">System Online</span>
                    </div>

                    <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                        Enterprise EV <br />
                        <span className="text-[#346eea]">Workstation.</span>
                    </h2>

                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                        Real-time telemetry, battery diagnostics, and fleet tracking — all in one advanced monitoring terminal.
                    </p>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-white tracking-tighter">99.9%</p>
                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Accuracy</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-[#346eea] tracking-tighter">AES-256</p>
                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Encryption</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Blur */}
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#346eea]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#346eea]/5 rounded-full blur-[120px]"></div>
            </div>
        </div>
    );
};

export default Login;
