import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const ContactUsPopup = () => {
    const [isOpen, setIsOpen] = useState(false);

    const togglePopup = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={togglePopup}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 9999,
                    transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <MessageCircle size={28} />
            </button>

            {/* Popup Modal */}
            {isOpen && (
                <>
                {/* Backdrop — click outside to close */}
                <div
                    onClick={togglePopup}
                    style={{
                        position: 'fixed', inset: 0,
                        zIndex: 9998,
                    }}
                />

                <div style={{
                    position: 'fixed',
                    bottom: '6rem',
                    right: '2rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                    zIndex: 9999,
                    width: '300px',
                    animation: 'slideUp 0.3s ease'
                }}>
                    <button
                        onClick={togglePopup}
                        style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8'
                                }}               >
                        <X size={20} />
                    </button>
                    <h3 style={{ marginTop: 0, color: '#1e293b', marginBottom: '1rem' }}>Contact Us</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Have a question or need help? Reach out to us at:
                    </p>
                    <a
                        href="https://mail.google.com/mail/?view=cm&to=contact@umangarora.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'var(--primary)',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            display: 'block',
                            background: 'rgba(200, 155, 60, 0.1)',
                            padding: '0.75rem',
                            borderRadius: '4px',
                            textAlign: 'center'
                        }}
                    >
                        contact@umangarora.in
                    </a>
                </div>
                </>
            )}
            
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default ContactUsPopup;
