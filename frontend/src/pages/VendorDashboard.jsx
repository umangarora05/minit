import { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Plus, Edit, Trash, X, TrendingUp, Package, DollarSign, ShoppingBag, BarChart3, List } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const VendorDashboard = () => {
    const { user } = useContext(AuthContext);

    const [products, setProducts] = useState([]);
    const [salesData, setSalesData] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

    const [loadingSales, setLoadingSales] = useState(true);
    const [loadingAction, setLoadingAction] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        description: '',
        stock: '',
        image: ''
    });

    const config = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    // ================= FETCH =================

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
            const myProducts = data.filter(p => p.vendor === user._id);
            setProducts(myProducts);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSales = async () => {
        try {
            setLoadingSales(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/vendor-sales`, config);
            setSalesData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSales(false);
        }
    };

    // ================= POLLING =================

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (!isMounted) return;

            await Promise.all([
                fetchProducts(),
                fetchSales()
            ]);
        };

        loadData();

        const interval = setInterval(loadData, 5000); // Polling for fast updates

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [user]);

    // ================= MOCK CHART DATA =================
    
    // Generate a visual trend from the aggregates
    // Real chart data from salesData
    const revenueChartData = useMemo(() => {
        if (!salesData || !salesData.salesByDate) return [];
        
        // Convert salesByDate object to sorted array
        return Object.entries(salesData.salesByDate)
            .map(([date, revenue]) => ({
                name: date,
                revenue: revenue
            }))
            .sort((a, b) => {
                const [d1, m1, y1] = a.name.split('/');
                const [d2, m2, y2] = b.name.split('/');
                return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
            });
    }, [salesData]);

    const productSalesData = useMemo(() => {
        if (!salesData || !salesData.salesByProduct) return [];
        
        return Object.entries(salesData.salesByProduct).map(([name, data]) => ({
            name,
            sales: data.qty
        })).sort((a, b) => b.sales - a.sales).slice(0, 5); // Top 5 products
    }, [salesData]);

    // ================= FORM =================

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoadingAction('form');

            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingId}`, formData, config);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, config);
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', price: '', category: '', description: '', stock: '', image: '' });

            await Promise.all([fetchProducts(), fetchSales()]);

        } catch {
            alert('Error saving product');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name || '',
            price: product.price || '',
            category: product.category || '',
            description: product.description || '',
            stock: product.stock || '',
            image: product.image || ''
        });
        setEditingId(product._id);
        setShowForm(true);
        setActiveTab('products');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            setLoadingAction(id);

            await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, config);

            await Promise.all([fetchProducts(), fetchSales()]);

        } catch {
            alert('Error deleting product');
        } finally {
            setLoadingAction(null);
        }
    };

    // ================= COMPONENTS =================

    const StatCard = ({ icon, label, value, trendClass = "text-success" }) => (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1, minWidth: '200px' }}>
            <div style={{ padding: '1rem', background: 'rgba(50, 205, 50, 0.1)', borderRadius: '12px', color: 'var(--primary)' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>{label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text)' }}>{value}</div>
            </div>
        </div>
    );

    // ================= UI =================

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <BarChart3 className="text-primary" /> Vendor Dashboard
                </h2>
                
                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <button 
                        onClick={() => setActiveTab('dashboard')} 
                        style={{ 
                            padding: '0.5rem 1.5rem', 
                            background: activeTab === 'dashboard' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'dashboard' ? '#fff' : 'var(--text)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('products')} 
                        style={{ 
                            padding: '0.5rem 1.5rem', 
                            background: activeTab === 'products' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'products' ? '#fff' : 'var(--text)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        Inventory
                    </button>
                </div>
            </div>

            {/* ================= DASHBOARD ================= */}
            {activeTab === 'dashboard' && (
                <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {loadingSales ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading analytics...</div>
                    ) : (
                        <>
                            {/* STATS ROW */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                <StatCard icon={<DollarSign size={28} />} label="Total Revenue" value={`₹${salesData?.totalRevenue?.toLocaleString() || 0}`} />
                                <StatCard icon={<ShoppingBag size={28} />} label="Items Sold" value={salesData?.totalItemsSold || 0} />
                                <StatCard icon={<Package size={28} />} label="Active Products" value={salesData?.totalProducts || 0} />
                                <StatCard icon={<TrendingUp size={28} />} label="Total Orders" value={salesData?.totalOrders || 0} />
                            </div>

                            {/* CHARTS ROW */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                {/* LINE CHART */}
                                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>Revenue Trend (7 Days)</h3>
                                    <div style={{ height: '300px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={revenueChartData}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} tickFormatter={(value) => `₹${value}`} />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                                                    itemStyle={{ color: 'var(--primary)' }}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* BAR CHART */}
                                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-muted)' }}>Top Selling Products</h3>
                                    <div style={{ height: '300px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={productSalesData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                                <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)'}} />
                                                <RechartsTooltip 
                                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }}
                                                />
                                                <Bar dataKey="sales" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ================= PRODUCTS INVENTORY ================= */}
            {activeTab === 'products' && (
                <div className="page-transition glass-panel" style={{ padding: '2rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <List className="text-primary" size={20} /> Product Inventory
                            </h3>
                            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Manage your products and stock levels</p>
                        </div>
                        <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({name:'', price:'', category:'', description:'', stock:'', image:''}) }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={18} /> Add Product
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '1rem', fontWeight: 600 }}>Product</th>
                                    <th style={{ padding: '1rem', fontWeight: 600 }}>Category</th>
                                    <th style={{ padding: '1rem', fontWeight: 600 }}>Stock</th>
                                    <th style={{ padding: '1rem', fontWeight: 600 }}>Price</th>
                                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No products found. Add your first product!
                                        </td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product._id} style={{ 
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background 0.2s',
                                            opacity: loadingAction === product._id ? 0.5 : 1
                                        }} className="dashboard-table-row">
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--background)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <Package size={20} className="text-muted" />
                                                        )}
                                                    </div>
                                                    <span style={{ fontWeight: 500 }}>{product.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{product.category || '-'}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ 
                                                    padding: '0.25rem 0.75rem', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.85rem',
                                                    background: product.stock > 10 ? 'rgba(50, 205, 50, 0.1)' : 'rgba(248, 81, 73, 0.1)',
                                                    color: product.stock > 10 ? 'var(--success)' : 'var(--danger)'
                                                }}>
                                                    {product.stock || 0} in stock
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>₹{product.price}</td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        onClick={() => handleEdit(product)}
                                                        className="btn"
                                                        style={{ padding: '0.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(product._id)}
                                                        disabled={loadingAction === product._id}
                                                        className="btn"
                                                        style={{ padding: '0.5rem', background: 'rgba(248, 81, 73, 0.1)', color: 'var(--danger)', border: '1px solid transparent' }}
                                                        title="Delete"
                                                    >
                                                        <Trash size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ================= MODAL: ADD / EDIT PRODUCT ================= */}
            {showForm && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
                }}>
                    <div className="glass-panel page-transition" style={{ 
                        width: '100%', maxWidth: '500px', padding: '2rem', 
                        position: 'relative', background: 'var(--surface)',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <button 
                            onClick={() => setShowForm(false)} 
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {editingId ? <Edit size={20} className="text-primary"/> : <Plus size={20} className="text-primary"/>} 
                            {editingId ? 'Edit Product' : 'Add New Product'}
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Product Name *</label>
                                <input 
                                    name="name" value={formData.name} onChange={handleChange} required 
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Price (₹) *</label>
                                    <input 
                                        name="price" type="number" value={formData.price} onChange={handleChange} required 
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Stock Quantity *</label>
                                    <input 
                                        name="stock" type="number" value={formData.stock} onChange={handleChange} required 
                                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Category</label>
                                <input 
                                    name="category" value={formData.category} onChange={handleChange} 
                                    placeholder="e.g. Electronics, Clothing"
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Image URL</label>
                                <input 
                                    name="image" value={formData.image} onChange={handleChange} 
                                    placeholder="https://..."
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)' }}
                                />
                                {formData.image && (
                                    <div style={{ marginTop: '0.5rem', borderRadius: '8px', overflow: 'hidden', height: '100px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
                                        <img src={formData.image} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="color:var(--text-muted);font-size:0.8rem">Invalid Image URL</span>'; }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Description</label>
                                <textarea 
                                    name="description" value={formData.description} onChange={handleChange} rows={3}
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text)', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loadingAction === 'form'} style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
                                    {loadingAction === 'form' ? 'Saving...' : (editingId ? 'Update Product' : 'Save Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Some minimal inline CSS for the table hover effect */}
            <style>{`
                .dashboard-table-row:hover {
                    background-color: var(--surface);
                }
            `}</style>
        </div>
    );
};

export default VendorDashboard;