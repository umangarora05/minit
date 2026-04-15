// ========================================================================
// MODULE 1: HTML5 — New HTML5 Form Input Types
// MODULE 2: React — Controlled Components, State
// ========================================================================
// Topics: HTML5 Input Types (text, email, password, select/option),
//         Controlled Components, Event Handling, Async/Await
// ========================================================================

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { UserPlus, Loader } from 'lucide-react';
import logo from '../assets/logo.png';

const Register = () => {
    // --- STATE for each form field (Controlled Components) ---
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');   // default value
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // --- FORM SUBMISSION EVENT HANDLER ---
    const handleSubmit = async (e) => {
        e.preventDefault();          // Prevent default browser form submission
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, role); // Ajax POST to server
            navigate('/dashboard');                        // Redirect on success
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
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

                    {/* INPUT TYPE: password — hides typed characters (HTML5) */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
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
                                fontFamily: 'inherit'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

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
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Submit button with conditional rendering */}
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
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.8 }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
