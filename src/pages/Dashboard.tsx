import { FileText, Users, Package, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { STATUS_LABELS } from '../types';

export default function Dashboard() {
    const { orders, suppliers, products, companies } = useApp();

    // Calculate stats
    const totalOrders = orders.length;
    const draftOrders = orders.filter(o => o.status === 'draft').length;
    const sentOrders = orders.filter(o => o.status === 'sent').length;
    const totalSuppliers = suppliers.length;
    const totalProducts = products.length;

    // Recent orders
    const recentOrders = orders.slice(0, 5);

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">לוח בקרה</h1>
                    <p className="page-subtitle">סקירה כללית של מערכת הזמנות הרכש</p>
                </div>
                <Link to="/orders/new" className="btn btn-primary">
                    <ShoppingCart size={20} />
                    הזמנה חדשה
                </Link>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FileText />
                    </div>
                    <div>
                        <div className="stat-value">{totalOrders}</div>
                        <div className="stat-label">סה״כ הזמנות</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <FileText />
                    </div>
                    <div>
                        <div className="stat-value">{draftOrders}</div>
                        <div className="stat-label">טיוטות</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>
                        <FileText />
                    </div>
                    <div>
                        <div className="stat-value">{sentOrders}</div>
                        <div className="stat-label">נשלחו</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                        <Users />
                    </div>
                    <div>
                        <div className="stat-value">{totalSuppliers}</div>
                        <div className="stat-label">ספקים</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }}>
                        <Package />
                    </div>
                    <div>
                        <div className="stat-value">{totalProducts}</div>
                        <div className="stat-label">מוצרים</div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">הזמנות אחרונות</h2>
                    <Link to="/orders" className="btn btn-ghost btn-sm">
                        הצג הכל
                    </Link>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>מספר הזמנה</th>
                                <th>תאריך</th>
                                <th>ספק</th>
                                <th>סטטוס</th>
                                <th>סכום</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                                        אין הזמנות עדיין
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link to={`/orders/${order.id}`} className="text-primary" style={{ color: 'var(--color-accent-primary)', textDecoration: 'none' }}>
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td>{new Date(order.date).toLocaleDateString('he-IL')}</td>
                                        <td>{order.supplierName}</td>
                                        <td>
                                            <span className={`badge badge-${order.status}`}>
                                                {STATUS_LABELS[order.status]}
                                            </span>
                                        </td>
                                        <td>₪{order.total.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">חברות פעילות</h2>
                    </div>
                    <ul style={{ listStyle: 'none' }}>
                        {companies.map(company => (
                            <li key={company.id} style={{
                                padding: 'var(--spacing-md)',
                                borderBottom: '1px solid var(--color-border)',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <span>{company.name}</span>
                                <span className="text-muted">{company.registrationNumber}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">פעולות מהירות</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <Link to="/orders/new" className="btn btn-primary">
                            <ShoppingCart size={20} />
                            יצירת הזמנה חדשה
                        </Link>
                        <Link to="/suppliers" className="btn btn-secondary">
                            <Users size={20} />
                            ניהול ספקים
                        </Link>
                        <Link to="/prices" className="btn btn-secondary">
                            <Package size={20} />
                            עדכון מחירונים
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
