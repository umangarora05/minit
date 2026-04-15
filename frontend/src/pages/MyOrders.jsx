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

    // Cancel an order
    const handleCancelOrder = async (orderId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, { status: 'cancelled' }, config);

            // Re-fetch to update UI instantly
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/myorders`, config);
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(data);

            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(data.find(o => o._id === orderId));
            }
        } catch (error) {
            console.error(error);
            alert('Failed to cancel the order. Please try again later.');
        }
    };

    return (
        <>
            <div className="container" style={{ paddingTop: '20px' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={24} color="var(--primary)" /> My Orders
                    </h2>

                {/* ===== ORDER LIST ===== */}
                <div>
                    {orders.map(order => (
                        <div key={order._id} className="glass-panel" style={{
                            padding: '1.5rem', marginBottom: '1.25rem',
                            borderLeft: `5px solid ${order.status === 'cancelled' ? '#ef4444' :
                                    order.status === 'pending' ? '#eab308' :
                                        order.status === 'delivered' ? 'var(--success)' :
                                            order.status === 'out_for_delivery' ? 'var(--warning)' :
                                                '#3b82f6'
                                }`,
                            transition: 'all 0.3s ease',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <strong>Order #{order._id.substring(0, 8)}</strong>
                                <span style={{
                                    textTransform: 'uppercase', fontSize: '0.7rem',
                                    padding: '0.35rem 0.8rem', borderRadius: '20px',
                                    fontWeight: '700', letterSpacing: '0.05em',
                                    border: `1px solid ${order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.4)' :
                                            order.status === 'pending' ? 'rgba(234, 179, 8, 0.4)' :
                                                order.status === 'delivered' ? 'rgba(34, 197, 94, 0.4)' :
                                                    order.status === 'out_for_delivery' ? 'rgba(210, 153, 34, 0.4)' :
                                                        'rgba(59, 130, 246, 0.4)'
                                        }`,
                                    background: order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.08)' :
                                        order.status === 'pending' ? 'rgba(234, 179, 8, 0.08)' :
                                            order.status === 'delivered' ? 'rgba(34, 197, 94, 0.08)' :
                                                order.status === 'out_for_delivery' ? 'rgba(210, 153, 34, 0.08)' :
                                                    'rgba(59, 130, 246, 0.08)',
                                    color: order.status === 'cancelled' ? '#ef4444' :
                                        order.status === 'pending' ? '#d97706' :
                                            order.status === 'delivered' ? 'var(--success)' :
                                                order.status === 'out_for_delivery' ? 'var(--warning)' :
                                                    '#3b82f6'
                                }}>{order.status.replace('_', ' ')}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                <span style={{ margin: '0 0.5rem' }}>•</span>
                                <span>Paid via <strong>{paymentLabel(order.paymentMethod)}</strong></span>
                            </div>

                            {/* Mini progress bar */}
                            <div style={{ display: 'flex', gap: '4px', margin: '0.5rem 0 1.25rem', height: '6px' }}>
                                {trackingSteps.map((step, idx) => (
                                    <div key={step.key} style={{
                                        flex: 1, borderRadius: '3px',
                                        background: idx <= getStatusIndex(order.status) ? (order.status === 'cancelled' ? '#ef4444' : 'var(--primary)') : 'var(--border)',
                                        opacity: idx <= getStatusIndex(order.status) ? 1 : 0.4,
                                        transition: 'all 0.5s ease'
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
                            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Total</span>
                                    <strong style={{ fontSize: '1.2rem', color: 'var(--text)' }}>₹{order.totalPrice}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    {/* Cancel Order button */}
                                    {!['cancelled', 'out_for_delivery', 'delivered'].includes(order.status) && (
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                                    handleCancelOrder(order._id);
                                                }
                                            }}
                                            style={{
                                                padding: '0.5rem 1.25rem',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: '#ef4444',
                                                background: 'transparent',
                                                border: '1px solid var(--border)',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    {/* Track Order button */}
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setSelectedOrder(order)}
                                        style={{
                                            padding: '0.5rem 1.25rem',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: 'var(--surface)',
                                            transition: 'all 0.2s ease',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--primary)'; }}
                                    >
                                        <Truck size={16} /> <span style={{ transform: 'translateY(1px)' }}>Track Order</span>
                                    </button>
                                </div>
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
        
        {/* ===== TRACKING MODAL ===== */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, animation: 'fadeInMove 0.3s ease'
                }} onClick={() => setSelectedOrder(null)}>
                    <div className="glass-panel" style={{
                        padding: '2.5rem', maxWidth: '500px', width: '90%',
                        border: '1px solid var(--border)', animation: 'fadeInMove 0.4s ease'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Order Tracking</h3>
                            <button onClick={() => setSelectedOrder(null)} style={{
                                background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: '1.2rem', width: '32px', height: '32px',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }} onMouseOver={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)' }}
                               onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                                ✕
                            </button>
                        </div>

                        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px dashed var(--border)', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.75rem', fontWeight: '600' }}>
                                Order #{selectedOrder._id.substring(0, 8)} <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '0.5rem' }}>• {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                <span>Payment: <strong style={{ color: 'var(--text)' }}>{paymentLabel(selectedOrder.paymentMethod)}</strong></span>
                                <span style={{
                                    marginLeft: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px',
                                    fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em',
                                    border: `1px solid ${selectedOrder.paymentStatus === 'completed' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(234, 179, 8, 0.4)'}`,
                                    background: selectedOrder.paymentStatus === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                    color: selectedOrder.paymentStatus === 'completed' ? 'var(--success)' : '#d97706'
                                }}>
                                    {selectedOrder.paymentStatus || 'pending'}
                                </span>
                            </div>
                        </div>

                        {/* ===== TRACKING PROGRESS BAR ===== */}
                        {selectedOrder.status === 'cancelled' ? (
                            <div style={{
                                padding: '2rem', textAlign: 'center',
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px', color: '#ef4444'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❌</div>
                                <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Order Canceled</h4>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                    This order has been canceled and will not be delivered.
                                </p>
                            </div>
                        ) : (
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
                                                    position: 'absolute', left: '11px', top: '28px',
                                                    width: '2px', height: 'calc(100% - 14px)',
                                                    background: isCompleted ? 'var(--primary)' : 'var(--border)',
                                                    opacity: isCompleted ? 1 : 0.3,
                                                    transition: 'background 0.5s ease'
                                                }}></div>
                                            )}
                                            {/* Step circle */}
                                            <div style={{
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                                background: isCompleted ? 'var(--primary)' : 'var(--surface)',
                                                border: `2px solid ${isCompleted ? 'var(--primary)' : 'rgba(140, 149, 159, 0.3)'}`,
                                                color: isCompleted ? '#000' : 'var(--text-muted)',
                                                transition: 'all 0.5s ease',
                                                boxShadow: isCurrent ? '0 0 16px rgba(50, 205, 50, 0.4)' : 'none'
                                            }}>
                                                {isCompleted && <CheckCircle size={14} />}
                                            </div>
                                            {/* Step label */}
                                            <div style={{ paddingBottom: '2.5rem' }}>
                                                <div style={{
                                                    fontWeight: isCurrent ? '700' : '500',
                                                    color: isCompleted ? 'var(--text)' : 'var(--text-muted)',
                                                    fontSize: '0.95rem',
                                                    transform: 'translateY(2px)'
                                                }}>
                                                    {step.label}
                                                </div>
                                                {isCurrent && (
                                                    <div style={{
                                                        fontSize: '0.75rem', color: 'var(--primary)',
                                                        marginTop: '0.35rem', fontWeight: '700',
                                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                                    }}>
                                                        ● Current Status
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}
                            style={{ 
                                width: '100%', marginTop: '1.5rem', padding: '0.75rem', 
                                fontWeight: '600', borderRadius: '8px', 
                                background: 'var(--surface)', transition: 'all 0.2s', border: '1px solid var(--border)'
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff' }}
                            onMouseOut={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--primary)' }}
                        >
                            Close Tracking
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default MyOrders;
