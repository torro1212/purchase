import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Eye, Trash2, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_LABELS, type OrderStatus } from '../types';
import * as XLSX from 'xlsx';

export default function OrdersPage() {
    const { orders, suppliers, deleteOrder } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
    const [supplierFilter, setSupplierFilter] = useState<number | ''>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                if (
                    !order.orderNumber.toLowerCase().includes(searchLower) &&
                    !order.supplierName.toLowerCase().includes(searchLower)
                ) {
                    return false;
                }
            }

            // Status filter
            if (statusFilter && order.status !== statusFilter) {
                return false;
            }

            // Supplier filter
            if (supplierFilter && order.supplierId !== supplierFilter) {
                return false;
            }

            // Date range filter
            if (dateFrom) {
                const orderDate = new Date(order.date);
                const fromDate = new Date(dateFrom);
                if (orderDate < fromDate) return false;
            }

            if (dateTo) {
                const orderDate = new Date(order.date);
                const toDate = new Date(dateTo);
                if (orderDate > toDate) return false;
            }

            return true;
        });
    }, [orders, searchTerm, statusFilter, supplierFilter, dateFrom, dateTo]);

    const handleDelete = (id: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
            deleteOrder(id);
        }
    };

    const exportToExcel = () => {
        const data = filteredOrders.map(order => ({
            'מספר הזמנה': order.orderNumber,
            'תאריך': new Date(order.date).toLocaleDateString('he-IL'),
            'ספק': order.supplierName,
            'חברה': order.companyName,
            'סטטוס': STATUS_LABELS[order.status],
            'סכום לפני מע"מ': order.subtotal,
            'מע"מ': order.vatAmount,
            'סה"כ': order.total,
            'תנאי תשלום': order.paymentTerms,
            'אחריות': order.warrantyTerms,
            'הערות': order.notes || ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'הזמנות');
        XLSX.writeFile(wb, `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">הזמנות רכש</h1>
                    <p className="page-subtitle">צפייה וניהול כל הזמנות הרכש</p>
                </div>
                <div className="flex gap-md">
                    <button
                        className="btn btn-secondary"
                        onClick={exportToExcel}
                        disabled={filteredOrders.length === 0}
                    >
                        <Download size={20} />
                        ייצוא לאקסל
                    </button>
                    <Link to="/orders/new" className="btn btn-primary">
                        <Plus size={20} />
                        הזמנה חדשה
                    </Link>
                </div>
            </header>

            {/* Filters */}
            <div className="card mb-lg">
                <div className="filter-bar">
                    <div className="search-input" style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="חיפוש לפי מספר הזמנה או ספק..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingRight: '40px' }}
                        />
                    </div>

                    <select
                        className="form-select filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
                    >
                        <option value="">כל הסטטוסים</option>
                        <option value="draft">טיוטה</option>
                        <option value="sent">נשלחה</option>
                        <option value="received">התקבלה</option>
                        <option value="cancelled">בוטלה</option>
                    </select>

                    <select
                        className="form-select filter-select"
                        value={supplierFilter}
                        onChange={(e) => setSupplierFilter(e.target.value ? Number(e.target.value) : '')}
                    >
                        <option value="">כל הספקים</option>
                        {suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        className="form-input"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="מתאריך"
                        style={{ width: '150px' }}
                    />

                    <input
                        type="date"
                        className="form-input"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="עד תאריך"
                        style={{ width: '150px' }}
                    />
                </div>
            </div>

            {/* Orders Table */}
            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>מספר הזמנה</th>
                                <th>תאריך</th>
                                <th>ספק</th>
                                <th>חברה</th>
                                <th>סטטוס</th>
                                <th>סכום</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted" style={{ padding: '3rem' }}>
                                        <Filter size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                        <p>לא נמצאו הזמנות התואמות לחיפוש</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link
                                                to={`/orders/${order.id}`}
                                                style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', fontWeight: 600 }}
                                            >
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td>{new Date(order.date).toLocaleDateString('he-IL')}</td>
                                        <td>{order.supplierName || '—'}</td>
                                        <td>{order.companyName || '—'}</td>
                                        <td>
                                            <span className={`badge badge-${order.status}`}>
                                                {STATUS_LABELS[order.status]}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>₪{order.total.toLocaleString()}</td>
                                        <td>
                                            <div className="table-actions">
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="btn btn-ghost btn-sm"
                                                    title="צפייה"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDelete(order.id)}
                                                    title="מחיקה"
                                                    style={{ color: 'var(--color-error)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{
                    padding: 'var(--spacing-md)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)'
                }}>
                    <span>מציג {filteredOrders.length} מתוך {orders.length} הזמנות</span>
                </div>
            </div>
        </div>
    );
}
