import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronRight, UserPlus, ShieldCheck, Zap } from 'lucide-react';

const STEPS = { INFO: 'info', OTP: 'otp', DONE: 'done' };

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [step, setStep] = useState(searchParams.get('step') === 'otp' ? STEPS.OTP : STEPS.INFO);
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            await axios.post(`${apiUrl}/api/auth/register`, { email, password, role: 'user' });
            setStep(STEPS.OTP);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            await axios.post(`${apiUrl}/api/auth/send-otp`, { email });
            setCountdown(60);
            setSuccess('OTP resent successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return setError('Please enter all 6 digits.');
        setError('');
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL ;
            await axios.post(`${apiUrl}/api/auth/verify-otp`, { email, otp: code });
            setStep(STEPS.DONE);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
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

                    {step === STEPS.INFO && (
                        <>
                            <h1 className="text-2xl font-black text-[#111827] tracking-tight mb-2">Create Account</h1>
                            <p className="text-sm text-[#6B7280] font-medium mb-8">Join the platform to monitor your fleet metrics</p>

                            {error && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mb-6">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleRegister} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="auth-input pl-11"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="auth-input pl-11 pr-11"
                                            placeholder="Min 6 characters"
                                            required
                                            minLength={6}
                                        />
                                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="w-full primary-btn h-12 flex items-center justify-center gap-3">
                                    {loading ? <span className="btn-spinner"></span> : (
                                        <>
                                            <span>Send Code</span>
                                            <ChevronRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-xs font-bold text-[#6B7280]">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#346eea] hover:underline">Sign in</Link>
                            </p>
                        </>
                    )}

                    {step === STEPS.OTP && (
                        <>
                            <h1 className="text-2xl font-black text-[#111827] tracking-tight mb-2">Verify Identity</h1>
                            <p className="text-sm text-[#6B7280] font-medium mb-8">Handshake code transmitted to <strong className="text-[#111827]">{email}</strong></p>

                            {error && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold mb-6">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            className={`w-12 h-14 bg-slate-50 border-2 rounded-xl text-center text-xl font-bold outline-none transition-all ${digit ? 'border-[#346eea] bg-orange-50 text-[#346eea]' : 'border-slate-100 focus:border-[#346eea]'}`}
                                            autoFocus={i === 0}
                                        />
                                    ))}
                                </div>

                                <button type="submit" disabled={loading || otp.join('').length < 6} className="w-full primary-btn h-12 flex items-center justify-center gap-3">
                                    {loading ? <span className="btn-spinner"></span> : (
                                        <>
                                            <ShieldCheck size={18} />
                                            <span>Verify Code</span>
                                        </>
                                    )}
                                </button>

                                <button type="button" onClick={handleResendOtp} disabled={countdown > 0} className="w-full text-center text-[10px] font-black text-[#346eea] uppercase tracking-widest">
                                    {countdown > 0 ? `Retry in ${countdown}s` : 'Resend Code'}
                                </button>
                            </form>
                        </>
                    )}

                    {step === STEPS.DONE && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-[#111827] mb-2">Registration Complete</h2>
                            <p className="text-sm text-[#6B7280] mb-8 font-medium">System identity confirmed. You may now access the workstation.</p>
                            <button className="w-full primary-btn h-12" onClick={() => navigate('/login')}>
                                Continue to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Hero Panel (Left Side via CSS) */}
            <div className="login-hero-panel flex-1 hidden lg:flex relative bg-[#111827] overflow-hidden items-center justify-center p-20 animate-in fade-in slide-in-from-left duration-700">
                {/* Abstract Tech Pattern */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#346eea 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#111827]/90 to-[#346eea]/5"></div>
                
                <div className="relative z-10 w-full max-w-lg text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 bg-[#346eea]/10 border border-[#346eea]/20 px-3 py-1.5 rounded-lg mb-8 mx-auto lg:mx-0">
                        <UserPlus size={16} className="text-[#346eea]" />
                        <span className="text-[10px] font-black text-[#346eea] uppercase tracking-[0.2em]">Provisioning Mode</span>
                    </div>
                    
                    <h2 className="text-5xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                        Secure Fleet <br/> 
                        <span className="text-[#346eea]">Onboarding.</span>
                    </h2>
                    
                    <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
                        Initialize high-resolution monitoring nodes and secure your telemetry data streams with industry-grade encryption.
                    </p>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-white tracking-tighter">TLS 1.3</p>
                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Handshake</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-[#346eea] tracking-tighter">Instant</p>
                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em]">Sync Enabled</p>
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

export default Register;
