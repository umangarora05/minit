// ========================================================================
// FORGOT PASSWORD — Direct Password Reset (No OTP/Email verification)
// ========================================================================
// Topics: Controlled Components, State, Regex Validation, Conditional
//         Rendering, Event Handling, Async/Await, Ajax
// ========================================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, ArrowLeft, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ========================================================================
    // REGEX PATTERNS — Email & Password validation
    // ========================================================================
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validate = () => {
        const errors = {};

        if (!email.trim()) errors.email = 'Email is required';
        else if (!EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email (e.g., name@gmail.com)';

        if (!newPassword) errors.newPassword = 'New password is required';
        else if (!PASSWORD_REGEX.test(newPassword)) errors.newPassword = 'Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char (@$!%*?&)';

        if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
        else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setLoading(true);

        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                email,
                newPassword
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Shared input style
    const inputStyle = (hasError) => ({
        background: 'var(--input-bg)',
        border: hasError ? '1px solid var(--danger)' : '1px solid var(--border)',
        color: 'var(--text)',
        width: '100%',
        padding: '1rem',
        borderRadius: '4px',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit'
    });

    // --- SUCCESS SCREEN ---
    if (success) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
            }} className="login-container">
                <div className="glass-panel" style={{
                    padding: '3rem', width: '100%', maxWidth: '420px',
                    zIndex: 2, textAlign: 'center'
                }}>
                    <div style={{
                        width: '70px', height: '70px', borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.15)', border: '2px solid var(--success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', animation: 'scaleIn 0.4s ease'
                    }}>
                        <CheckCircle size={34} color="var(--success)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: 'var(--text)' }}>
                        Password Changed!
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                    <Link to="/login" className="btn btn-primary" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 2rem', textDecoration: 'none', fontWeight: '700'
                    }}>
                        <ArrowLeft size={16} /> Go to Login
                    </Link>
                </div>
                <style>{`
                    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
                `}</style>
            </div>
        );
    }

    // --- FORM SCREEN ---
    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
        }} className="login-container">
            <div className="glass-panel" style={{
                padding: '3rem', width: '100%', maxWidth: '420px', zIndex: 2,
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'rgba(200, 155, 60, 0.1)', border: '1px solid var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.25rem'
                    }}>
                        <KeyRound size={28} color="var(--primary)" />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem', marginBottom: '0.5rem',
                        letterSpacing: '-0.02em', fontWeight: '800', color: 'var(--text)'
                    }}>Reset Password</h1>
                    <p style={{ opacity: 0.7, fontSize: '0.85rem', lineHeight: '1.5' }}>
                        Enter your email and choose a new password.
                    </p>
                </div>

                {/* Server error */}
                {error && (
                    <div style={{
                        color: 'var(--danger)', marginBottom: '1.5rem', fontSize: '0.85rem',
                        textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)',
                        padding: '0.75rem', border: '1px solid var(--danger)', borderRadius: '4px'
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })); }}
                            placeholder="name@gmail.com"
                            required
                            style={inputStyle(fieldErrors.email)}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = fieldErrors.email ? 'var(--danger)' : 'var(--border)'}
                        />
                        {fieldErrors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.email}</p>}
                    </div>

                    {/* New Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => { setNewPassword(e.target.value); setFieldErrors(p => ({ ...p, newPassword: '' })); }}
                                placeholder="••••••••"
                                required
                                style={{ ...inputStyle(fieldErrors.newPassword), paddingRight: '3rem' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = fieldErrors.newPassword ? 'var(--danger)' : 'var(--border)'}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem'
                            }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldErrors.newPassword && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.newPassword}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })); }}
                                placeholder="••••••••"
                                required
                                style={{ ...inputStyle(fieldErrors.confirmPassword), paddingRight: '3rem' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = fieldErrors.confirmPassword ? 'var(--danger)' : 'var(--border)'}
                            />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem'
                            }}>
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%', padding: '1rem', borderRadius: '4px',
                            fontWeight: '800', letterSpacing: '0.05em',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            marginTop: '0.5rem'
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> RESETTING...</>
                        ) : (
                            'RESET PASSWORD'
                        )}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>
                    <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ArrowLeft size={14} /> Back to Login
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
