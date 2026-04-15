// ========================================================================
// PAYMENT TERMINAL — Dummy Payment Page
// ========================================================================
// Topics: Controlled Components, State, Conditional Rendering,
//         Event Handling, Async/Await, CSS Animations, Inline Styles
// ========================================================================

import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { CreditCard, Smartphone, Banknote, Truck, Lock, CheckCircle, Loader } from 'lucide-react';

const Payment = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Get cart data passed from Cart page via React Router state
    const { cartItems, totalPrice } = location.state || {};

    // --- STATE ---
    const [selectedMethod, setSelectedMethod] = useState(null);  // Which payment method is selected
    const [processing, setProcessing] = useState(false);          // Payment processing animation
    const [success, setSuccess] = useState(false);                // Payment success state
    const [formData, setFormData] = useState({                    // Payment form fields
        upiId: '', cardNumber: '', expiry: '', cvv: '', cardName: ''
    });

    // Redirect if no cart data
    useEffect(() => {
        if (!cartItems || cartItems.length === 0) navigate('/cart');
    }, [cartItems, navigate]);

    // Payment method options
    const paymentMethods = [
        { id: 'upi', label: 'UPI', icon: <Smartphone size={24} />, desc: 'Pay via Google Pay, PhonePe, Paytm' },
        { id: 'debit', label: 'Debit Card', icon: <CreditCard size={24} />, desc: 'Visa, Mastercard, Rupay' },
        { id: 'credit', label: 'Credit Card', icon: <CreditCard size={24} />, desc: 'All major cards accepted' },
        { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={24} />, desc: 'Pay when you receive' },
    ];

    // --- PROCESS PAYMENT (dummy) ---
    const handlePayment = async () => {
        if (!selectedMethod) return;
        setProcessing(true);

        // Simulate payment processing delay (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // POST order with payment method
            await axios.post(`${import.meta.env.VITE_API_URL}/orders`, {
                orderItems: cartItems,
                totalPrice,
                paymentMethod: selectedMethod
            }, config);

            setProcessing(false);
            setSuccess(true);
            localStorage.removeItem('cart');

            // Auto-redirect after 2 seconds
            setTimeout(() => navigate('/myorders'), 2000);
        } catch (error) {
            setProcessing(false);
            alert('Payment failed: ' + (error.response?.data?.message || error.message));
        }
    };

    // --- SUCCESS SCREEN ---
    if (success) {
        return (
            <div className="container" style={{ paddingTop: '80px', minHeight: '100vh' }}>
                <div className="glass-panel" style={{
                    maxWidth: '500px', margin: '0 auto', padding: '4rem 3rem',
                    textAlign: 'center', animation: 'fadeInMove 0.5s ease'
                }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.15)', border: '2px solid var(--success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem', animation: 'scaleIn 0.5s ease'
                    }}>
                        <CheckCircle size={40} color="var(--success)" />
                    </div>
                    <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Payment Successful!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        ₹{totalPrice} paid via {selectedMethod?.toUpperCase()}
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Redirecting to your orders...</p>
                </div>
                <style>{`
                    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
                `}</style>
            </div>
        );
    }

    // --- PROCESSING SCREEN ---
    if (processing) {
        return (
            <div className="container" style={{ paddingTop: '80px', minHeight: '100vh' }}>
                <div className="glass-panel" style={{
                    maxWidth: '500px', margin: '0 auto', padding: '4rem 3rem', textAlign: 'center'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <Loader size={48} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Processing Payment...</h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {selectedMethod === 'cod' ? 'Confirming your order...' : 'Securely processing ₹' + totalPrice}
                    </p>
                    <div style={{
                        marginTop: '2rem', height: '4px', background: 'var(--border)',
                        borderRadius: '2px', overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%', background: 'var(--primary)',
                            animation: 'progressBar 2s ease-in-out', borderRadius: '2px'
                        }}></div>
                    </div>
                </div>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes progressBar { from { width: 0%; } to { width: 100%; } }
                `}</style>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '2rem', minHeight: '100vh' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={22} color="var(--primary)" /> Secure Checkout
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Total: <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₹{totalPrice}</strong>
                    {' '}• {cartItems?.length} item(s)
                </p>

                {/* ===== PAYMENT METHOD SELECTION ===== */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Choose Payment Method
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        {paymentMethods.map(method => (
                            <div
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className="glass-panel"
                                style={{
                                    padding: '1.25rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedMethod === method.id
                                        ? '2px solid var(--primary)'
                                        : '1px solid var(--border)',
                                    background: selectedMethod === method.id
                                        ? 'rgba(200, 155, 60, 0.08)'
                                        : 'var(--surface)',
                                    transform: selectedMethod === method.id ? 'scale(1.02)' : 'scale(1)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <div style={{ color: selectedMethod === method.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                                        {method.icon}
                                    </div>
                                    <strong style={{ color: selectedMethod === method.id ? 'var(--primary)' : 'var(--text)' }}>
                                        {method.label}
                                    </strong>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{method.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ===== PAYMENT FORM (shown only when method is selected) ===== */}
                {selectedMethod && selectedMethod !== 'cod' && (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeInMove 0.3s ease' }}>
                        <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            {selectedMethod === 'upi' ? 'Enter UPI ID' : 'Card Details'}
                        </h3>

                        {selectedMethod === 'upi' ? (
                            <input
                                type="text"
                                placeholder="yourname@upi"
                                value={formData.upiId}
                                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: 'var(--input-bg)', border: '1px solid var(--border)',
                                    color: 'var(--text)', borderRadius: '4px', fontFamily: 'inherit',
                                    fontSize: '1rem', outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input placeholder="Cardholder Name" value={formData.cardName}
                                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                                    style={{ padding: '0.9rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', fontFamily: 'inherit', outline: 'none', width: '100%' }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                <input placeholder="Card Number (e.g. 4111 1111 1111 1111)" value={formData.cardNumber}
                                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                                    style={{ padding: '0.9rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', fontFamily: 'inherit', outline: 'none', width: '100%' }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input placeholder="MM/YY" value={formData.expiry}
                                        onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                                        style={{ padding: '0.9rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', fontFamily: 'inherit', outline: 'none', width: '100%' }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                    <input placeholder="CVV" type="password" value={formData.cvv}
                                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                                        style={{ padding: '0.9rem', background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', fontFamily: 'inherit', outline: 'none', width: '100%' }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* COD info */}
                {selectedMethod === 'cod' && (
                    <div className="glass-panel" style={{
                        padding: '1.5rem', marginBottom: '2rem',
                        background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)',
                        animation: 'fadeInMove 0.3s ease'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Truck size={24} color="var(--success)" />
                            <div>
                                <strong style={{ color: 'var(--success)' }}>Cash on Delivery</strong>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                                    Pay ₹{totalPrice} in cash when your order arrives. No advance payment needed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Summary */}
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Order Summary
                    </h3>
                    {cartItems?.map(item => (
                        <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                            <span>{item.qty}x {item.name}</span>
                            <span>₹{item.price * item.qty}</span>
                        </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                        <strong>Total</strong>
                        <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₹{totalPrice}</strong>
                    </div>
                </div>

                {/* Pay Button */}
                <button
                    className="btn btn-primary"
                    onClick={handlePayment}
                    disabled={!selectedMethod}
                    style={{
                        width: '100%', padding: '1.1rem', fontSize: '1rem',
                        opacity: selectedMethod ? 1 : 0.5,
                        cursor: selectedMethod ? 'pointer' : 'not-allowed'
                    }}
                >
                    {selectedMethod === 'cod' ? 'CONFIRM ORDER' : `PAY ₹${totalPrice}`}
                </button>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    🔒 This is a demo payment terminal. No real money is charged.
                </p>
            </div>
        </div>
    );
};

export default Payment;
