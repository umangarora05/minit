// ========================================================================
// MODULE 1: HTML5 — Page Structure Elements, Headings, Linking, Images
// MODULE 1: CSS — Inline Styles, Backgrounds, Text Shadows
// ========================================================================
// Topics: HTML5 Page Structure (<header>, <nav>, <main>, <footer>, <section>),
//         Headings (h1), Linking (React Router Link), Images,
//         Inline Styles, Text Shadows, CSS Animations
// ========================================================================

import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const LandingPage = () => {
    return (
        // Main container — acts like a full-page layout
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* ===== BACKGROUND ELEMENTS REMOVED FOR MINIMALISM ===== */}

            {/* ===== HTML5 PAGE STRUCTURE: <nav> ===== */}
            {/* <nav> = semantic HTML5 element for navigation */}
            <nav style={{
                position: 'absolute',   // POSITIONING: absolute (relative to parent)
                top: 0,
                left: 0,
                width: '100%',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                background: 'transparent'
            }}>
                <div style={{ fontWeight: '900', fontSize: '1.5rem', letterSpacing: '-0.05em', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={logo} alt="MINIT Logo" style={{ height: '64px', width: '64px', borderRadius: '50%', objectFit: 'contain' }} />
                    MINIT
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                </div>
            </nav>

            {/* ===== 3D Polygon Background REMOVED ===== */}

            {/* ===== HTML5 PAGE STRUCTURE: <main> ===== */}
            {/* <main> = semantic HTML5 element for the main content of the page */}
            <main style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2rem',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Status badge */}
                <div style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--surface)',
                    marginBottom: '2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    borderRadius: '20px',
                    gap: '0.5rem'
                }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', letterSpacing: '0.02em', fontWeight: '500' }}>
                        For the students, by the students
                    </span>
                </div>

                {/* ===== HTML5 HEADING: <h1> ===== */}
                {/* TEXT SHADOW — adds glow effect behind text */}
                {/* textShadow: 'x-offset y-offset blur-radius color' */}
                <img src={logo} alt="MINIT Logo" style={{ height: '240px', width: '240px', borderRadius: '50%', objectFit: 'contain', marginBottom: '1.5rem', zIndex: 2, position: 'relative', boxShadow: '0 8px 32px rgba(50, 205, 50, 0.2)' }} />
                <h1 style={{
                    fontSize: 'clamp(5rem, 15vw, 12rem)',  // Responsive font size using clamp()
                    lineHeight: '0.8',
                    marginBottom: '1rem',
                    position: 'relative',
                    zIndex: 2,
                    textTransform: 'uppercase',
                    color: 'var(--text)'
                }}>
                    MINIT
                </h1>

                {/* Subtext */}
                <div style={{ marginTop: '2rem', maxWidth: '600px' }}>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Your trusted platform for campus essentials.<br />
                        <span style={{ color: 'var(--text)', fontWeight: '500' }}>Simple. Reliable. Yours.</span>
                    </p>
                </div>

                {/* ===== LINKING (React Router) ===== */}
                {/* <Link to="/login"> = internal link using React Router (no page reload) */}
                <div style={{
                    marginTop: '3rem',
                    display: 'flex',
                    gap: '1rem',
                }}>
                    <Link to="/login" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                        Login
                    </Link>
                </div>
            </main>

            <footer style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                borderTop: '1px solid var(--border)'
            }}>
                <div>
                    &copy; {new Date().getFullYear()} MINIT. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
