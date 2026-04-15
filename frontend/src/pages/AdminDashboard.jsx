import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
    Users, Package, Store, RefreshCw, TrendingUp, 
    ChevronDown, ChevronUp, ExternalLink, Calendar
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ 
        users: 0, products: 0, vendors: 0, 
        recentUsers: [], recentProducts: [], recentVendors: [],
        chartData: []
    });
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    // State for toggling details
    const [showDetails, setShowDetails] = useState({
        users: false,
        products: false,
        vendors: false
    });

    const fetchStats = async (showPulse = false) => {
        if (showPulse) setIsRefreshing(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`, config);
            
            setStats(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
            if (showPulse) setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(), 10000); // Polling every 10s for these detailed stats
        return () => clearInterval(interval);
    }, []);

    const toggleDetails = (type) => {
        setShowDetails(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const StatCard = ({ title, value, icon: Icon, color, type, details }) => {
        const isOpen = showDetails[type];
        
        return (
            <div className="glass-panel page-transition" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{ 
                            padding: '0.75rem', 
                            borderRadius: '12px', 
                            background: `rgba(${color}, 0.1)`,
                            color: `rgb(${color})`
                        }}>
                            <Icon size={24} />
                        </div>
                        <button 
                            onClick={() => toggleDetails(type)}
                            style={{ 
                                background: 'transparent', 
                                border: 'none', 
                                color: 'var(--text-muted)', 
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                    
                    <div>
                        <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                            {loading ? '...' : value.toLocaleString()}
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</p>
                    </div>
                </div>

                {/* Details Section */}
                {isOpen && (
                    <div style={{ 
                        borderTop: '1px solid var(--border)', 
                        padding: '1rem 1.5rem', 
                        background: 'rgba(0,0,0,0.1)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>
                            Recently Added
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {details && details.length > 0 ? details.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem' }}>{item.name || item.title}</span>
                                    <ExternalLink size={12} color="var(--text-muted)" />
                                </div>
                            )) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent activity</p>}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, var(--text), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Admin Analytics
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Deep insights into your platform's growth and activity.
                    </p>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
                        Syncing: {lastUpdated.toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <StatCard 
                    title="Total Users" 
                    value={stats.users} 
                    icon={Users} 
                    color="50, 205, 50"
                    type="users"
                    details={stats.recentUsers}
                />
                <StatCard 
                    title="Active Products" 
                    value={stats.products} 
                    icon={Package} 
                    color="236, 72, 153"
                    type="products"
                    details={stats.recentProducts}
                />
                <StatCard 
                    title="Verified Vendors" 
                    value={stats.vendors} 
                    icon={Store} 
                    color="79, 70, 229"
                    type="vendors"
                    details={stats.recentVendors}
                />
            </div>

            {/* Analytics Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Growth Chart */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp color="var(--primary)" size={20} />
                            User Growth
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>
                            Last 7 Days
                        </div>
                    </div>
                    
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--primary)' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="users" 
                                    stroke="var(--primary)" 
                                    fillOpacity={1} 
                                    fill="url(#colorUsers)" 
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Log */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar color="var(--primary)" size={20} />
                        Recent Platform Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recentUsers && stats.recentUsers.map((u, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ minWidth: '40px', height: '40px', background: 'rgba(50, 205, 50, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    {u.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.9rem', margin: 0 }}>New user registered: <strong>{u.name}</strong></p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{u.role || 'Member'}</p>
                                </div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Just now</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 2s linear infinite; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
