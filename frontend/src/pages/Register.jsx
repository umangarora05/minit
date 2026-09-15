// ========================================================================
// MODULE 1: HTML5 — New HTML5 Form Input Types
// MODULE 2: React — Controlled Components, State
// ========================================================================
// Topics: HTML5 Input Types (text, email, password, select/option),
//         Controlled Components, Event Handling, Async/Await
// ========================================================================

import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus, Loader, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const Register = () => {
    // --- STATE for each form field (Controlled Components) ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');   // default value
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef(null);
    const { register, sendOtp } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' }); // Field-level errors

    // ========================================================================
    // REGEX PATTERNS — Email & Password validation
    // ========================================================================
    // Email regex: must be a valid email format (supports Gmail & other providers)
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    // Password regex: min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // --- Countdown timer for Resend OTP ---
    const startResendTimer = () => {
        setResendTimer(60);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) { clearInterval(timerRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // --- FIELD-LEVEL VALIDATION ---
    const validateField = (field, value) => {
        let errorMsg = '';
        if (field === 'email') {
            if (!value.trim()) errorMsg = 'Email is required';
            else if (!EMAIL_REGEX.test(value)) errorMsg = 'Enter a valid email (e.g., name@gmail.com)';
        }
        if (field === 'password') {
            if (!value) errorMsg = 'Password is required';
            else if (!PASSWORD_REGEX.test(value)) errorMsg = 'Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char (@$!%*?&)';
        }
        if (field === 'confirmPassword') {
            if (!value) errorMsg = 'Please confirm your password';
            else if (value !== password) errorMsg = 'Passwords do not match';
        }
        if (field === 'otp') {
            if (otpSent && !value) errorMsg = 'OTP is required';
        }
        setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
        return errorMsg === '';
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);
        const isConfirmValid = validateField('confirmPassword', confirmPassword);
        if (!isEmailValid || !isPasswordValid || !isConfirmValid) return;

        setLoading(true);
        try {
            await sendOtp(email, { forRegistration: true });
            setOtpSent(true);
            startResendTimer();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setOtp('');
        setLoading(true);
        try {
            await sendOtp(email, { forRegistration: true });
            startResendTimer();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // --- FORM SUBMISSION EVENT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();          // Prevent default browser form submission
        setError('');

        // Validate all fields with regex before submitting
        const isEmailValid = validateField('email', email);
        const isPasswordValid = validateField('password', password);
        const isConfirmValid = validateField('confirmPassword', confirmPassword);
        const isOtpValid = validateField('otp', otp);
        if (!isEmailValid || !isPasswordValid || !isConfirmValid || (otpSent && !isOtpValid)) return;

        setLoading(true);
        try {
            await register(name, email, password, role, otp); // Ajax POST to server
            navigate('/dashboard');                        // Redirect on success
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed';
            // Check for duplicate email message from backend
            if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
                setError('This email is already registered. Please sign in or use a different email.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }} className="login-container">
            {/* Background decorations removed */}

             <div className="glass-panel" style={{
                padding: '3rem',
                width: '100%',
                maxWidth: '500px',
                zIndex: 2,
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        color: 'var(--primary)',
                        fontWeight: '900'
                    }}>JOIN MINIT</h1>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', letterSpacing: '0.05em' }}>Create your account</p>
                </div>

                {/* Conditional Rendering — show error message if exists */}
                {error && (
                    <div style={{
                        color: 'var(--danger)',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '0.75rem',
                        border: '1px solid var(--danger)',
                        borderRadius: '4px'
                    }}>{error}</div>
                )}

                {/* ========== HTML5 FORM with Various Input Types ========== */}
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>

                    {/* INPUT TYPE: text — basic text input */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            required
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '4px',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* INPUT TYPE: email — validates email format (HTML5) */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) validateField('email', e.target.value); }}
                            onBlur={() => validateField('email', email)}
                            placeholder="you@gmail.com"
                            required
                            style={{
                                background: 'var(--input-bg)',
                                border: fieldErrors.email ? '1px solid var(--danger)' : '1px solid var(--border)',
                                color: 'var(--text)',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '4px',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = fieldErrors.email ? 'var(--danger)' : 'var(--primary)'}
                        />
                        {fieldErrors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.email}</p>}
                    </div>

                    {/* INPUT TYPE: password — hides typed characters (HTML5) */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) validateField('password', e.target.value); }}
                                onBlur={() => validateField('password', password)}
                                placeholder="••••••••"
                                required
                                style={{
                                    background: 'var(--input-bg)',
                                    border: fieldErrors.password ? '1px solid var(--danger)' : '1px solid var(--border)',
                                    color: 'var(--text)',
                                    width: '100%',
                                    padding: '1rem',
                                    paddingRight: '3rem',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = fieldErrors.password ? 'var(--danger)' : 'var(--primary)'}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldErrors.password && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); if (fieldErrors.confirmPassword) validateField('confirmPassword', e.target.value); }}
                                onBlur={() => validateField('confirmPassword', confirmPassword)}
                                placeholder="••••••••"
                                required
                                style={{
                                    background: 'var(--input-bg)',
                                    border: fieldErrors.confirmPassword ? '1px solid var(--danger)' : '1px solid var(--border)',
                                    color: 'var(--text)',
                                    width: '100%',
                                    padding: '1rem',
                                    paddingRight: '3rem',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = fieldErrors.confirmPassword ? 'var(--danger)' : 'var(--primary)'}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.confirmPassword}</p>}
                    </div>

                    {otpSent && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>OTP</label>
                                {resendTimer > 0 ? (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resend in {resendTimer}s</span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700, padding: 0 }}
                                    >
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => { setOtp(e.target.value); if (fieldErrors.otp) validateField('otp', e.target.value); }}
                                onBlur={() => validateField('otp', otp)}
                                placeholder="Enter 6-digit OTP"
                                required
                                style={{
                                    background: 'var(--input-bg)',
                                    border: fieldErrors.otp ? '1px solid var(--danger)' : '1px solid var(--border)',
                                    color: 'var(--text)',
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                                onFocus={(e) => e.target.style.borderColor = fieldErrors.otp ? 'var(--danger)' : 'var(--primary)'}
                            />
                            {fieldErrors.otp && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.otp}</p>}
                        </div>
                    )}

                    {/* SELECT / DROPDOWN — HTML5 Drop Down Menu */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>I am a...</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '4px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontFamily: 'inherit',
                                appearance: 'none'
                            }}
                        >
                            {/* <option> elements inside <select> = dropdown menu items */}
                            <option value="student">Student</option>
                            <option value="vendor">Vendor</option>
                            <option value="delivery">Delivery Partner</option>
                            {/* <option value="admin">Admin</option> */}
                        </select>
                    </div>

                    {/* Submit or Send OTP button with conditional rendering */}
                    {!otpSent ? (
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            className="btn btn-secondary"
                            style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} style={{ marginRight: '0.5rem', animation: 'rotate 1s linear infinite' }} />
                                    SENDING OTP...
                                </>
                            ) : (
                                'SEND OTP'
                            )}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader size={18} style={{ marginRight: '0.5rem', animation: 'rotate 1s linear infinite' }} />
                                    CREATING ACCOUNT...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} style={{ marginRight: '0.5rem' }} /> CREATE ACCOUNT
                                </>
                            )}
                        </button>
                    )}
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
