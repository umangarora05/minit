import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { CheckCircle, Truck, MapPin } from 'lucide-react';

const DeliveryDashboard = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loadingId, setLoadingId] = useState(null); // track button loading
    const [actionType, setActionType] = useState(null); // 'accept' or 'deliver'
    const [toastMessage, setToastMessage] = useState('');

    const fetchOrders = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, config);

            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    // POLLING
    useEffect(() => {
        fetchOrders();

        const interval = setInterval(() => {
            fetchOrders();
        }, 3000); // every 3 sec

        return () => clearInterval(interval);
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // EVENT-DRIVEN /accept route
    const handleAccept = async (id) => {
        try {
            setLoadingId(id);
            setActionType('accept');
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.post(`${import.meta.env.VITE_API_URL}/delivery/${id}/accept`, {}, config);
            
            // Optimistic update
            setOrders(orders.map(o => o._id === id ? { ...o, status: 'preparing' } : o));
            fetchOrders();
        } catch (error) {
            alert('Error accepting delivery. Make sure backend is running.');
        } finally {
            setLoadingId(null);
            setActionType(null);
        }
    };

    // EVENT-DRIVEN /start route
    const handleStart = async (id) => {
        try {
            setLoadingId(id);
            setActionType('start');
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.post(`${import.meta.env.VITE_API_URL}/delivery/${id}/start`, {}, config);
            
            // Optimistic update
            setOrders(orders.map(o => o._id === id ? { ...o, status: 'out_for_delivery' } : o));
            fetchOrders();
        } catch (error) {
            alert('Error starting delivery');
        } finally {
            setLoadingId(null);
            setActionType(null);
        }
    };

    // EVENT-DRIVEN /deliver route
    const handleDeliver = async (id) => {
        try {
            setLoadingId(id);
            setActionType('deliver');
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            await axios.post(`${import.meta.env.VITE_API_URL}/delivery/${id}/deliver`, {}, config);
            
            // Optimistic update
            setOrders(orders.map(o => o._id === id ? { ...o, status: 'delivered' } : o));
            showToast('Delivery Successful for Antigravity Order!');
            fetchOrders();
        } catch (error) {
            alert('Error marking as delivered');
        } finally {
            setLoadingId(null);
            setActionType(null);
        }
    };

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--success)',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(50, 205, 50, 0.4)',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    animation: 'popIn 0.3s ease'
                }}>
                    <CheckCircle size={20} />
                    {toastMessage}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck className="text-primary"/> Delivery Dashboard
                </h2>

                <div>
                    {orders.map(order => (
                        <div
                            key={order._id}
                            className="glass-panel"
                            style={{
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                borderTop: `4px solid ${
                                    order.status === 'delivered' ? 'var(--success)' : 
                                    order.status === 'out_for_delivery' ? 'var(--warning)' : 
                                    'var(--primary)'
                                }`,
                                transition: 'all 0.3s ease',
                                opacity: loadingId === order._id ? 0.6 : 1
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '1rem',
                                alignItems: 'center'
                            }}>
                                <strong style={{ fontSize: '1.1rem' }}>Order #{order._id.substring(0, 8)}</strong>

                                <span style={{
                                    textTransform: 'uppercase',
                                    fontSize: '0.8rem',
                                    padding: '0.4rem 0.8rem',
                                    background: order.status === 'delivered' ? 'rgba(50, 205, 50, 0.85)' : 
                                                order.status === 'out_for_delivery' ? 'rgba(210, 153, 34, 0.1)' : 
                                                'rgba(50, 205, 50, 0.1)',
                                    color: order.status === 'delivered' ? 'var(--success)' :
                                           order.status === 'out_for_delivery' ? 'var(--warning)' : 
                                           'var(--primary)',
                                    borderRadius: '20px',
                                    fontWeight: 'bold'
                                }}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <p style={{ margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                <MapPin size={16} /> Customer: <strong>{order.user?.name || 'Unknown'}</strong>
                            </p>

                            <div style={{
                                margin: '1.5rem 0',
                                padding: '1rem',
                                background: 'var(--background)',
                                borderRadius: '8px',
                                maxHeight: '150px',
                                overflowY: 'auto'
                            }}>
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} style={{
                                        fontSize: '0.9rem',
                                        color: 'var(--text)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '0.5rem',
                                        borderBottom: idx !== order.orderItems.length - 1 ? '1px solid var(--border)' : 'none',
                                        paddingBottom: idx !== order.orderItems.length - 1 ? '0.5rem' : '0'
                                    }}>
                                        <span>{item.name}</span>
                                        <span style={{ fontWeight: 600 }}>x{item.qty}</span>
                                    </div>
                                ))}
                            </div>

                            {/* UI STATE BUTTONS */}
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                {(order.status === 'confirmed' || order.status === 'pending') && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAccept(order._id)}
                                        disabled={loadingId === order._id}
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                                    >
                                        <Truck size={18} style={{ marginRight: '0.5rem' }} />
                                        {loadingId === order._id && actionType === 'accept'
                                            ? 'Accepting...'
                                            : 'Accept Delivery'}
                                    </button>
                                )}

                                {order.status === 'preparing' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleStart(order._id)}
                                        disabled={loadingId === order._id}
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(173, 255, 66, 0.97)', color: 'var(--text)' }}
                                    >
                                        <MapPin size={18} style={{ marginRight: '0.5rem' }} />
                                        {loadingId === order._id && actionType === 'start'
                                            ? 'Starting...'
                                            : 'Start Delivery'}
                                    </button>
                                )}

                                {order.status === 'out_for_delivery' && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleDeliver(order._id)}
                                        disabled={loadingId === order._id}
                                        style={{ width: '100%', background: 'var(--success)', color: '#fff', display: 'flex', justifyContent: 'center' }}
                                    >
                                        <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
                                        {loadingId === order._id && actionType === 'deliver'
                                            ? 'Updating...'
                                            : 'Mark as Delivered'}
                                    </button>
                                )}

                                {order.status === 'delivered' && (
                                    <div style={{
                                        width: '100%',
                                        textAlign: 'center',
                                        color: 'var(--success)',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        padding: '0.75rem',
                                        background: 'rgba(81, 247, 81, 0.8)',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(50, 205, 50, 0.2)'
                                    }}>
                                          Delivery Complete
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            No active deliveries found.
                        </p>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: translate(-50%, -20px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default DeliveryDashboard;