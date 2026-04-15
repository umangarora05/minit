// ========================================================================
// MODULE 2: React — Controlled Components, Forms, Event Handling
// MODULE 1: JavaScript — Event Handling, Form Processing, Ajax, JSON
// ========================================================================
// Topics: Controlled Components, State, Event Handling, Async/Await,
//         Forms, Ajax (via Axios), JSON, Dialog boxes (alert)
// ========================================================================

import { useState, useContext } from 'react';             // React Hooks
import { useNavigate, Link } from 'react-router-dom';    // React Router
import AuthContext from '../context/AuthContext';
import logo from '../assets/logo.png';

const Login = () => {
    // --- STATE: Each form field has its own state ---
    // This makes it a "CONTROLLED COMPONENT" — React controls the input value
    const [email, setEmail] = useState('');       // email state, starts as empty string
    const [password, setPassword] = useState(''); // password state
    const { login } = useContext(AuthContext);     // Get login function from context
    const navigate = useNavigate();               // For programmatic navigation
    const [error, setError] = useState('');        // Error message state
    const [loading, setLoading] = useState(false); // Loading state
    const [fieldErrors, setFieldErrors] = useState({ email: '' }); // Field-level errors

    // ========================================================================
    // REGEX PATTERNS — Email validation only (no password regex on login)
    // ========================================================================
    // Email regex: must be a valid email format (supports Gmail & other providers)
    const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // --- FIELD-LEVEL VALIDATION ---
    const validateField = (field, value) => {
        let errorMsg = '';
        if (field === 'email') {
            if (!value.trim()) errorMsg = 'Email is required';
            else if (!EMAIL_REGEX.test(value)) errorMsg = 'Enter a valid email (e.g., name@gmail.com)';
        }
        setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
        return errorMsg === '';
    };

    // --- FORM SUBMISSION HANDLER (Event Handling) ---
    // async function — uses async/await for the login API call
    const handleSubmit = async (e) => {
        e.preventDefault();   // Prevent default form submission (page reload)
        setError('');         // Clear previous errors

        // Validate email with regex before submitting
        const isEmailValid = validateField('email', email);
        if (!isEmailValid) return;

        setLoading(true);     // Show loading state
        try {
            await login(email, password);  // Ajax call (inside AuthContext)
            navigate('/dashboard');         // On success → redirect
        } catch (err) {
            // Optional chaining (?.) — safely access nested properties
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false); // Always stop loading (success or error)
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
        }} className="login-container">
            {/* Background decorations removed */}

             <div className="glass-panel" style={{
                padding: '3rem',
                width: '100%',
                maxWidth: '400px',
                zIndex: 2,
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    {/* HTML5 HEADING (h1) */}
                    <h1 style={{
                        fontSize: '2.5rem',
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em',
                        textTransform: 'uppercase',
                        fontWeight: '900',
                        color: 'var(--primary)'
                    }}>MINIT</h1>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', letterSpacing: '0.05em' }}>Sign in to continue</p>
                </div>

                {/* CONDITIONAL RENDERING — show error only if it exists */}
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

                {/* ========== HTML FORM (Module 1 + Module 2) ========== */}
                {/* onSubmit = EVENT HANDLER — fires when form is submitted */}
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
                        {/* CONTROLLED COMPONENT:
                            - value={email} → React controls what's displayed
                            - onChange → updates state when user types
                            - type="email" → HTML5 form input type (validates email format) */}
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) validateField('email', e.target.value); }}
                            onBlur={(e) => { e.target.style.borderColor = fieldErrors.email ? 'var(--danger)' : 'var(--border)'; validateField('email', email); }}
                            placeholder="name@gmail.com"
                            required
                            style={{
                                background: 'var(--input-bg)',
                                border: fieldErrors.email ? '1px solid var(--danger)' : '1px solid var(--border)',
                                color: 'var(--text)',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '4px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = fieldErrors.email ? 'var(--danger)' : 'var(--primary)'}
                        />
                        {fieldErrors.email && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', margin: '0.4rem 0 0', fontWeight: 500 }}>{fieldErrors.email}</p>}
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
                        {/* type="password" → HTML5 input type (hides characters) */}
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                background: 'var(--input-bg)',
                                border: '1px solid var(--border)',
                                color: 'var(--text)',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '4px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }}>Forgot Password?</Link>
                        </div>
                    </div>
                    {/* Submit button — disabled while loading (prevents double submit) */}
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '1rem',
                            borderRadius: '4px',
                            fontWeight: '800',
                            letterSpacing: '0.05em'
                        }}
                        disabled={loading}
                    >
                        {/* Conditional rendering inside JSX */}
                        {loading ? 'LOGGING IN...' : 'LOGIN'}
                    </button>
                </form>

                {/* LINKING — Link component for navigation (like <a> but without page reload) */}
                <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;