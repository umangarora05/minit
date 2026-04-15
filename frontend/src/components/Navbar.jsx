// ========================================================================
// MODULE 2: React — Reusable React Component
// ========================================================================
// Topics: Reusable Components, Props, Conditional Rendering,
//         useContext, Event Handling, Inline Styles, Linking (React Router)
// ========================================================================

import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { ShoppingCart } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Cart count state — reads from localStorage
    const [cartCount, setCartCount] = useState(0);

    // Update cart count on mount and whenever localStorage changes
    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((sum, item) => sum + item.qty, 0);
        setCartCount(total);
    };

    useEffect(() => {
        updateCartCount();
        // Listen for custom 'cartUpdated' event (fired from StudentDashboard)
        window.addEventListener('cartUpdated', updateCartCount);
        // Also poll every second as fallback
        const interval = setInterval(updateCartCount, 1000);
        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-nav" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '1.25rem 0',
            borderBottom: '1px solid var(--border)',
            transition: 'all 0.3s ease'
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* BRANDING */}
                <Link to="/" className="brand-link" style={{
                    fontSize: '1.5rem', 
                    fontWeight: '900', 
                    color: 'var(--text)',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    letterSpacing: '-0.04em', 
                    textTransform: 'uppercase',
                    textDecoration: 'none'
                }}>
                    <img 
                        src={logo} 
                        alt="MINIT Logo" 
                        style={{
                            height: '64px',
                            width: '64px',
                            objectFit: 'contain',
                            borderRadius: '50%'
                        }}
                    />
                    <span>MIN<span style={{ color: 'var(--primary)' }}>IT</span></span>
                </Link>

                {/* NAVIGATION */}
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {user.role === 'student' && (
                                <Link to="/student-dashboard" className="nav-item">DASHBOARD</Link>
                            )}
                            {user.role === 'vendor' && (
                                <Link to="/vendor-dashboard" className="nav-item">DASHBOARD</Link>
                            )}
                            {user.role === 'delivery' && (
                                <Link to="/delivery-dashboard" className="nav-item">DASHBOARD</Link>
                            )}

                            {user.role === 'student' && (
                                <>
                                    <Link to="/myorders" className="nav-item">ORDERS</Link>

                                    {/* Cart icon with count badge */}
                                    <Link to="/cart" className="cart-link" style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text)', position: 'relative',
                                        background: 'var(--background)',
                                        padding: '0.6rem',
                                        borderRadius: '50%',
                                        border: '1px solid var(--border)',
                                        transition: 'all 0.2s ease'
                                    }}>
                                        <ShoppingCart size={20} />
                                        {cartCount > 0 && (
                                            <span style={{
                                                position: 'absolute', top: '-6px', right: '-6px',
                                                background: 'var(--primary)', color: '#fff', borderRadius: '50%',
                                                width: '20px', height: '20px', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.75rem', fontWeight: 'bold',
                                                boxShadow: '0 4px 8px rgba(50, 205, 50, 0.4)',
                                                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                            }}>
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            )}
                            <button onClick={handleLogout} className="btn-logout" style={{
                                padding: '0.5rem 1.25rem', 
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                borderRadius: '8px',
                                border: '2px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}>
                                LOGOUT
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-item" style={{ color: 'var(--text)' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontWeight: '600', borderRadius: '8px' }}>Register</Link>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .glass-nav {
                    background: var(--surface);
                }
                
                @supports (backdrop-filter: blur(12px)) {
                    .glass-nav {
                        background: rgba(22, 27, 34, 0.8);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                    }
                    body.light-theme .glass-nav {
                        background: rgba(255, 255, 255, 0.8);
                    }
                }

                .brand-link:hover div {
                    transform: rotate(90deg);
                    transition: transform 0.3s ease;
                }
                .brand-link div {
                    transition: transform 0.3s ease;
                }

                .nav-item {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                    font-weight: 600;
                    text-decoration: none;
                    letter-spacing: 0.05em;
                    position: relative;
                    padding: 0.5rem 0;
                    transition: color 0.2s ease;
                }

                .nav-item:hover {
                    color: var(--primary);
                }

                .nav-item::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 0;
                    height: 2px;
                    background: var(--primary);
                    transition: width 0.3s ease;
                    border-radius: 2px;
                }

                .nav-item:hover::after {
                    width: 100%;
                }

                .cart-link:hover {
                    border-color: var(--primary);
                    color: var(--primary) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(50, 205, 50, 0.15);
                }

                .btn-logout:hover {
                    border-color: var(--primary);
                    color: var(--primary);
                    background: rgba(50, 205, 50, 0.05);
                }

                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
