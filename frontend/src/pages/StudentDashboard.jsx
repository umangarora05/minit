// ========================================================================
// MODULE 2: React — Fetching & Re-fetching, Async/Await, State, Props
// MODULE 1: JavaScript — Arrays, Objects, DOM, Event Handling, Ajax, JSON
// ========================================================================

import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Search, Check } from 'lucide-react';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null); // Toast notification state

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products when search/category changes
    useEffect(() => {
        let filtered = products;
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategory, products]);

    // ========================================================================
    // ADD TO CART — with toast notification + event dispatch to update Navbar
    // ========================================================================
    const addToCart = (product) => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(x => x.product === product._id);

        // STOCK CHECK: don't allow adding more than available stock
        const currentQtyInCart = existingItem ? existingItem.qty : 0;
        if (currentQtyInCart >= product.stock) {
            setToast(`⚠️ Max stock reached for ${product.name} (${product.stock} available)`);
            setTimeout(() => setToast(null), 2500);
            return;
        }

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({
                product: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));

        // Dispatch custom event so Navbar updates cart count instantly
        window.dispatchEvent(new Event('cartUpdated'));

        // Show toast notification
        setToast(product.name);
        setTimeout(() => setToast(null), 2000);
    };

    const categories = ['All', ...new Set(products.map(p => p.category))];

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingTop: '30px', paddingBottom: '2rem' }}>
            {/* Background decorations removed */}

            {/* ===== TOAST NOTIFICATION — shows when item is added ===== */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '80px', right: '20px',
                    background: 'var(--surface)', border: '1px solid var(--success)',
                    padding: '1rem 1.5rem', borderRadius: '8px', zIndex: 200,
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    animation: 'slideInRight 0.4s ease, fadeOut 0.4s ease 1.6s forwards',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '350px'
                }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.15)', border: '1px solid var(--success)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Check size={16} color="var(--success)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text)' }}>Added to cart!</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{toast}</div>
                    </div>
                </div>
            )}

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                {/* Header — NO duplicate cart icon here */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '600', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                            Available Products
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live Inventory</span>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div style={{
                    display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap',
                    background: 'var(--surface)', backdropFilter: 'blur(5px)',
                    padding: '1.5rem', border: '1px solid var(--border)'
                }}>
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                        <input
                            type="text" placeholder="Search products..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                paddingLeft: '3rem', width: '100%',
                                background: 'var(--input-bg)', border: '1px solid var(--border)',
                                color: 'var(--text)', padding: '0.75rem 0.75rem 0.75rem 3rem',
                                outline: 'none', fontFamily: 'inherit', fontSize: '0.8rem',
                                textTransform: 'uppercase', borderRadius: '4px'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>
                    <select
                        value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            minWidth: '200px', background: 'var(--input-bg)',
                            border: '1px solid var(--border)', color: 'var(--text)',
                            padding: '0.75rem', outline: 'none', fontFamily: 'inherit',
                            fontSize: '0.8rem', textTransform: 'uppercase',
                            cursor: 'pointer', borderRadius: '4px'
                        }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex-center" style={{ padding: '4rem', flexDirection: 'column' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            border: '2px solid var(--border)', borderTopColor: 'var(--text)',
                            borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem'
                        }}></div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>FETCHING DATA...</div>
                    </div>
                )}

                {/* Product Grid */}
                {!loading && (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem'
                    }}>
                        {filteredProducts.map(product => (
                            <div key={product._id} style={{
                                background: 'var(--surface)', backdropFilter: 'blur(10px)',
                                border: '1px solid var(--border)', padding: '0',
                                display: 'flex', flexDirection: 'column',
                                transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>

                                <div style={{
                                    height: '200px', background: 'var(--input-bg)',
                                    borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden'
                                }}>
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px', background: '#fff' }} />
                                    ) : (
                                        <div className="flex-center" style={{ height: '100%', color: 'var(--text-muted)', fontSize: '2rem', background: `repeating-linear-gradient(45deg, #050505, #050505 10px, #0a0a0a 10px, #0a0a0a 20px)` }}>
                                            NO IMG
                                        </div>
                                    )}
                                    <div style={{
                                        position: 'absolute', top: '10px', left: '10px',
                                        background: 'var(--surface)', border: '1px solid var(--border)',
                                        padding: '0.25rem 0.5rem', fontSize: '0.65rem',
                                        color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.1em'
                                    }}>
                                        {product.category}
                                    </div>
                                </div>

                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem', color: 'var(--text)' }}>{product.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', flex: 1, marginBottom: '1.5rem' }}>{product.description}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text)', letterSpacing: '-0.05em' }}>₹{product.price}</span>
                                        {product.stock > 0 ? (
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => addToCart(product)}
                                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem', fontWeight: '700' }}
                                            >
                                                ADD +
                                            </button>
                                        ) : (
                                            <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>OUT OF STOCK</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="flex-center" style={{ padding: '6rem', flexDirection: 'column', border: '1px dashed var(--border)', marginTop: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>⚠️</div>
                        <h3 style={{ letterSpacing: '0.02em', color: 'var(--text)' }}>No Products Found</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your search or category filter.</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default StudentDashboard;
