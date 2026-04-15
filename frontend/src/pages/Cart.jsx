// ========================================================================
// MODULE 2: React — Props, State, Event Handling, Async/Await
// MODULE 1: JavaScript — Arrays, Objects, Event Handling, Ajax, JSON
// ========================================================================
// Topics: State management, Event handlers, Array methods (map, filter,
//         reduce), JSON parse/stringify, Async/Await, Dialog boxes (alert)
// ========================================================================

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const { user } = useContext(AuthContext);
    const [cartItems, setCartItems] = useState([]); // STATE: array of cart item objects
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // --- Load cart from localStorage on mount ---
    useEffect(() => {
        // JSON.parse() = converts JSON string → JavaScript object/array
        const items = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(items);
    }, []);

    // --- ARRAY METHOD: reduce() — calculates total price ---
    // reduce(callback, initialValue) — accumulates a result from an array
    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    // --- UPDATE quantity (Event Handler) ---
    const updateQuantity = (productId, delta) => {
        // ARRAY METHOD: map() — creates new array with modified item
        const newCart = cartItems.map(item => {
            if (item.product === productId) {
                const newQty = Math.max(1, item.qty + delta); // Math.max ensures min qty = 1
                return { ...item, qty: newQty }; // SPREAD OPERATOR — copy item with new qty
            }
            return item;
        });
        setCartItems(newCart);
        // JSON.stringify() = converts JavaScript object → JSON string
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    // --- PROCEED TO PAYMENT ---
    // Instead of placing order directly, navigate to Payment page
    // Pass cart data via React Router state (no URL params needed)
    const proceedToPayment = () => {
        if (cartItems.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        navigate('/payment', {
            state: { cartItems, totalPrice }  // Pass data to Payment page
        });
    };

    // --- REMOVE item from cart ---
    const removeFromCart = (id) => {
        // ARRAY METHOD: filter() — keeps items that DON'T match the id
        const newCart = cartItems.filter(x => x.product !== id);
        setCartItems(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    return (
        <div className="container" style={{ paddingTop: '80px' }}>
            {/* Background decorations removed */}
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', border: '1px solid var(--border)' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', backgroundColor:'rgba(255, 255, 255, 0.96)' }}>
                    <ShoppingBag size={28} /> Shopping Cart
                </h2>

                {/* CONDITIONAL RENDERING: empty cart vs items */}
                {cartItems.length === 0 ? (
                    <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
                        <h3>Your cart is empty</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Add some products to get started!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/student-dashboard')}>
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            {/* ARRAY: map() renders each cart item */}
                            {cartItems.map(item => (
                                <div key={item.product} className="glass-panel" style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '1.5rem', marginBottom: '1rem',
                                    border: '1px solid var(--border)', background: 'rgba(188, 250, 154, 0.94)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                                        <div style={{
                                            width: '80px', height: '80px', background: '#1a1614',
                                            borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)', color:'white',
                                        }}>
                                            {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem', color: 'var(--text)' }}>{item.name}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>₹{item.price} each</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', color:'white' }}>
                                        {/* Quantity controls — EVENT HANDLING with onClick */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', borderRadius: '0.5rem', padding: '0.25rem', border: '1px solid var(--border)' }}>
                                            <button className="btn btn-secondary" onClick={() => updateQuantity(item.product, -1)} style={{ padding: '0.5rem', minWidth: 'auto', color: 'var(--text)' }}>
                                                <Minus size={16} />
                                            </button>
                                            <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>{item.qty}</span>
                                            <button className="btn btn-secondary" onClick={() => updateQuantity(item.product, 1)} style={{ padding: '0.5rem', minWidth: 'auto', color: 'var(--text)' }}>
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', minWidth: '80px', textAlign: 'right', color: 'var(--text)' }}>
                                            ₹{item.price * item.qty}
                                        </span>
                                        <button className="btn btn-secondary" onClick={() => removeFromCart(item.product)} style={{ color: 'var(--danger)', padding: '0.5rem' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(212, 181, 126, 0.05)', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Subtotal ({cartItems.reduce((sum, item) => sum + item.qty, 0)} items)</span>
                                <span>₹{totalPrice}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Delivery Fee</span>
                                <span style={{ color: 'var(--success)' }}>FREE</span>
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ margin: 0 }}>Total</h3>
                                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.5rem' }}>₹{totalPrice}</h3>
                            </div>
                            <button className="btn btn-primary" onClick={proceedToPayment}
                                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.1rem' }}>
                                Proceed to Payment →
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;
