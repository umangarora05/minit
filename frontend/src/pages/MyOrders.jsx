// ========================================================================
// MODULE 2: React — Async/Await, Fetching, Conditional Rendering
// MODULE 1: JavaScript — Arrays, Objects, JSON
// ========================================================================
// Topics: useEffect for fetching, Async/Await, Array methods (map, sort),
//         Date objects, Conditional Rendering, Template literals
// ========================================================================

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Package, CheckCircle, Truck, Clock, ChefHat } from 'lucide-react';

const MyOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null); // For tracking view

    useEffect(() => {
        let isMounted = true;

        const fetchOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/myorders`, config);

                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                if (isMounted) {
                    setOrders(data);

                    // 🔥 also update selected order in real-time
                    if (selectedOrder) {
                        const updated = data.find(o => o._id === selectedOrder._id);
                        if (updated) setSelectedOrder(updated);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchOrders(); // initial load

        const interval = setInterval(fetchOrders, 3000); // 🔥 poll every 3 sec

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [user, selectedOrder]);

    // Tracking steps with icons
    const trackingSteps = [
        { key: 'pending', label: 'Order Placed', icon: <Package size={20} /> },
        { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle size={20} /> },
        { key: 'preparing', label: 'Preparing', icon: <ChefHat size={20} /> },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck size={20} /> },
        { key: 'delivered', label: 'Delivered', icon: <CheckCircle size={20} /> },
    ];

    // Get the index of current status in tracking steps
    const getStatusIndex = (status) => {
        const idx = trackingSteps.findIndex(s => s.key === status);
        return idx >= 0 ? idx : 0;
    };

    // Payment method label
    const paymentLabel = (method) => {
        const labels = { upi: 'UPI', debit: 'Debit Card', credit: 'Credit Card', cod: 'Cash on Delivery' };
        return labels[method] || method;
    };

    return (
        <div className="container" style={{ paddingTop: '20px' }}>
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={24} color="var(--primary)" /> My Orders
                </h2>

                {/* ===== TRACKING MODAL ===== */}
                {selectedOrder && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, animation: 'fadeInMove 0.3s ease'
                    }} onClick={() => setSelectedOrder(null)}>
                        <div className="glass-panel" style={{
                            padding: '2.5rem', maxWidth: '500px', width: '90%',
                            border: '1px solid var(--border)', animation: 'fadeInMove 0.4s ease'
                        }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0 }}>Order Tracking</h3>
                                <button onClick={() => setSelectedOrder(null)} style={{
                                    background: 'none', border: 'none', color: 'var(--text-muted)',
                                    cursor: 'pointer', fontSize: '1.5rem'
                                }}>✕</button>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                Order #{selectedOrder._id.substring(0, 8)} • {new Date(selectedOrder.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Payment: {paymentLabel(selectedOrder.paymentMethod)}
                                <span style={{
                                    marginLeft: '0.5rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                                    fontSize: '0.75rem', textTransform: 'uppercase',
                                    background: selectedOrder.paymentStatus === 'completed' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 181, 126, 0.15)',
                                    color: selectedOrder.paymentStatus === 'completed' ? 'var(--success)' : 'var(--primary)'
                                }}>
                                    {selectedOrder.paymentStatus || 'pending'}
                                </span>
                            </div>

                            {/* ===== TRACKING PROGRESS BAR ===== */}
                            <div style={{ position: 'relative', paddingLeft: '2rem' }}>
                                {trackingSteps.map((step, idx) => {
                                    const currentIdx = getStatusIndex(selectedOrder.status);
                                    const isCompleted = idx <= currentIdx;
                                    const isCurrent = idx === currentIdx;

                                    return (
                                        <div key={step.key} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: '1rem',
                                            marginBottom: idx < trackingSteps.length - 1 ? '0' : '0',
                                            position: 'relative'
                                        }}>
                                            {/* Vertical line */}
                                            {idx < trackingSteps.length - 1 && (
                                                <div style={{
                                                    position: 'absolute', left: '9px', top: '28px',
                                                    width: '2px', height: '40px',
                                                    background: isCompleted ? 'var(--primary)' : 'var(--border)',
                                                    transition: 'background 0.5s ease'
                                                }}></div>
                                            )}
                                            {/* Step circle */}
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                                background: isCompleted ? 'var(--primary)' : 'var(--surface)',
                                                border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                                                color: isCompleted ? '#000' : 'var(--text-muted)',
                                                transition: 'all 0.5s ease',
                                                boxShadow: isCurrent ? '0 0 12px rgba(200, 155, 60, 0.5)' : 'none'
                                            }}>
                                                {isCompleted && <CheckCircle size={12} />}
                                            </div>
                                            {/* Step label */}
                                            <div style={{ paddingBottom: '2rem' }}>
                                                <div style={{
                                                    fontWeight: isCurrent ? '700' : '400',
                                                    color: isCompleted ? 'var(--text)' : 'var(--text-muted)',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {step.label}
                                                </div>
                                                {isCurrent && (
                                                    <div style={{
                                                        fontSize: '0.75rem', color: 'var(--primary)',
                                                        marginTop: '0.25rem', fontWeight: '600'
                                                    }}>
                                                        ● Current Status
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}
                                style={{ width: '100%', marginTop: '1rem' }}>
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== ORDER LIST ===== */}
                <div>
                    {orders.map(order => (
                        <div key={order._id} className="glass-panel" style={{
                            padding: '1.25rem', marginBottom: '1rem',
                            borderLeft: `4px solid ${order.status === 'delivered' ? 'var(--success)' : 'var(--primary)'}`,
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>Order #{order._id.substring(0, 8)}</strong>
                                <span style={{
                                    textTransform: 'uppercase', fontSize: '0.75rem',
                                    padding: '0.2rem 0.6rem', borderRadius: '4px',
                                    background: order.status === 'delivered' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 181, 126, 0.15)',
                                    color: order.status === 'delivered' ? 'var(--success)' : 'var(--primary)'
                                }}>{order.status.replace('_', ' ')}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                {new Date(order.createdAt).toLocaleDateString()} •
                                Paid via {paymentLabel(order.paymentMethod)}
                            </div>

                            {/* Mini progress bar */}
                            <div style={{ display: 'flex', gap: '3px', margin: '0.75rem 0', height: '4px' }}>
                                {trackingSteps.map((step, idx) => (
                                    <div key={step.key} style={{
                                        flex: 1, borderRadius: '2px',
                                        background: idx <= getStatusIndex(order.status) ? 'var(--primary)' : 'var(--border)',
                                        transition: 'background 0.5s ease'
                                    }}></div>
                                ))}
                            </div>

                            <div style={{ marginTop: '0.75rem' }}>
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{item.qty}x {item.name}</span>
                                        <span>₹{item.price * item.qty}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong>₹{order.totalPrice}</strong>
                                {/* Track Order button */}
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedOrder(order)}
                                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                >
                                    <Truck size={14} style={{ marginRight: '0.5rem' }} /> Track Order
                                </button>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
                            <Clock size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                            <h3>No orders yet</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Start shopping to see your orders here!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
