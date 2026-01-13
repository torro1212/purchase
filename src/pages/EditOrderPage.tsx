import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, ArrowRight, Printer, Edit, Trash2, ShoppingCart, Building2, FileText, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STATUS_LABELS, type OrderItem, type OrderStatus } from '../types';

export default function EditOrderPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const printRef = useRef<HTMLDivElement>(null);
    const {
        orders,
        suppliers,
        products,
        companies,
        budgets,
        updateOrder,
        deleteOrder,
        calculateOrderTotals
    } = useApp();

    // Find the order
    const order = orders.find(o => o.id === id);

    // Local state for editing
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState<OrderStatus>('draft');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [forDescription, setForDescription] = useState('');
    const [location, setLocation] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('');
    const [warrantyTerms, setWarrantyTerms] = useState('');
    const [includesVat, setIncludesVat] = useState(false);
    const [notes, setNotes] = useState('');

    // Load order data
    useEffect(() => {
        if (order) {
            setStatus(order.status);
            setItems(order.items);
            setForDescription(order.forDescription || '');
            setLocation(order.location || '');
            setPaymentTerms(order.paymentTerms);
            setWarrantyTerms(order.warrantyTerms);
            setIncludesVat(order.includesVat);
            setNotes(order.notes || '');
        }
    }, [order]);

    // Filter products by order's supplier
    const supplierProducts = useMemo(() => {
        if (!order) return [];
        return products.filter(p => p.supplierId === order.supplierId);
    }, [order, products]);

    // Calculate totals
    const totals = useMemo(() => {
        return calculateOrderTotals(items, includesVat);
    }, [items, includesVat, calculateOrderTotals]);

    // Update item
    const updateItem = (itemId: string, updates: Partial<OrderItem>) => {
        setItems(items.map(item => {
            if (item.id !== itemId) return item;

            const updated = { ...item, ...updates };

            if (updates.productId && updates.productId !== item.productId) {
                const product = products.find(p => p.id === updates.productId);
                if (product) {
                    updated.productName = product.name;
                    updated.description = product.description;
                    updated.sku = product.sku;
                    updated.unitPrice = product.price;
                }
            }

            updated.totalPrice = updated.quantity * updated.unitPrice;
            return updated;
        }));
    };

    // Add item
    const addItem = () => {
        const newItem: OrderItem = {
            id: `item-${Date.now()}`,
            productId: '',
            productName: '',
            description: '',
            sku: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0
        };
        setItems([...items, newItem]);
    };

    // Remove item
    const removeItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    // Save changes
    const handleSave = () => {
        if (!order) return;

        updateOrder(order.id, {
            status,
            items,
            forDescription,
            location,
            paymentTerms,
            warrantyTerms,
            includesVat,
            notes,
            subtotal: totals.subtotal,
            vatAmount: totals.vatAmount,
            total: totals.total
        });

        setIsEditing(false);
    };

    // Delete order
    const handleDelete = () => {
        if (!order) return;
        if (window.confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
            deleteOrder(order.id);
            navigate('/orders');
        }
    };

    // Print
    const handlePrint = () => {
        window.print();
    };

    if (!order) {
        return (
            <div className="animate-fadeIn">
                <div className="empty-state" style={{ padding: '4rem' }}>
                    <FileText size={64} />
                    <h3>הזמנה לא נמצאה</h3>
                    <Link to="/orders" className="btn btn-primary mt-lg">
                        חזרה לרשימת ההזמנות
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Screen View */}
            <div className="no-print">
                <header className="page-header">
                    <div>
                        <Link to="/orders" className="btn btn-ghost btn-sm mb-md">
                            <ArrowRight size={16} />
                            חזרה להזמנות
                        </Link>
                        <h1 className="page-title">הזמנה {order.orderNumber}</h1>
                        <p className="page-subtitle">
                            <span className={`badge badge-${order.status}`} style={{ marginLeft: 'var(--spacing-sm)' }}>
                                {STATUS_LABELS[order.status]}
                            </span>
                            {new Date(order.date).toLocaleDateString('he-IL')}
                        </p>
                    </div>
                    <div className="flex gap-md">
                        {isEditing ? (
                            <>
                                <button className="btn btn-primary" onClick={handleSave}>
                                    <Save size={20} />
                                    שמור שינויים
                                </button>
                                <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                    ביטול
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn-secondary" onClick={handlePrint}>
                                    <Printer size={20} />
                                    הדפסה
                                </button>
                                <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                                    <Edit size={20} />
                                    עריכה
                                </button>
                                <button className="btn btn-danger" onClick={handleDelete}>
                                    <Trash2 size={20} />
                                    מחיקה
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="order-form">
                    {/* Status (Editable) */}
                    {isEditing && (
                        <div className="order-section">
                            <h3 className="order-section-title">סטטוס</h3>
                            <select
                                className="form-select"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                                style={{ maxWidth: '200px' }}
                            >
                                <option value="draft">טיוטה</option>
                                <option value="sent">נשלחה</option>
                                <option value="received">התקבלה</option>
                                <option value="cancelled">בוטלה</option>
                            </select>
                        </div>
                    )}

                    {/* Supplier Section */}
                    <div className="order-section">
                        <h3 className="order-section-title">
                            <ShoppingCart size={20} />
                            פרטי ספק
                        </h3>
                        <div className="form-row form-row-3">
                            <div>
                                <div className="form-label">שם ספק</div>
                                <div style={{ fontWeight: 600 }}>{order.supplierName}</div>
                            </div>
                            <div>
                                <div className="form-label">איש קשר</div>
                                <div>{order.supplierContact || '—'}</div>
                            </div>
                            <div>
                                <div className="form-label">טלפון</div>
                                <div dir="ltr" style={{ textAlign: 'right' }}>{order.supplierPhone || '—'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Company & Budget Section */}
                    <div className="order-section">
                        <h3 className="order-section-title">
                            <Building2 size={20} />
                            חברה ותקציב
                        </h3>
                        <div className="form-row form-row-3">
                            <div>
                                <div className="form-label">חשבונית עבור</div>
                                <div style={{ fontWeight: 600 }}>{order.companyName || '—'}</div>
                            </div>
                            <div>
                                <div className="form-label">מספר תקציב</div>
                                <div>{order.budgetCode || '—'}</div>
                            </div>
                            <div>
                                <div className="form-label">סוג תקציב</div>
                                <div>{order.budgetType === 'investments' ? 'השקעות' : 'הוצאות'}</div>
                            </div>
                        </div>

                        <div className="form-row form-row-3 mt-lg">
                            <div>
                                <div className="form-label">עבור</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={forDescription}
                                        onChange={(e) => setForDescription(e.target.value)}
                                    />
                                ) : (
                                    <div>{order.forDescription || '—'}</div>
                                )}
                            </div>
                            <div>
                                <div className="form-label">תנאי תשלום</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={paymentTerms}
                                        onChange={(e) => setPaymentTerms(e.target.value)}
                                    />
                                ) : (
                                    <div>{order.paymentTerms || '—'}</div>
                                )}
                            </div>
                            <div>
                                <div className="form-label">אחריות</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={warrantyTerms}
                                        onChange={(e) => setWarrantyTerms(e.target.value)}
                                    />
                                ) : (
                                    <div>{order.warrantyTerms || '—'}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="order-section">
                        <h3 className="order-section-title">
                            <Package size={20} />
                            פריטים
                        </h3>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>תיאור מוצר</th>
                                        <th>מק״ט</th>
                                        <th>כמות</th>
                                        <th>מחיר ליחידה</th>
                                        <th>סה״כ</th>
                                        {isEditing && <th></th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={isEditing ? 6 : 5} className="text-center text-muted" style={{ padding: '2rem' }}>
                                                אין פריטים בהזמנה
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    {isEditing ? (
                                                        <select
                                                            className="form-select"
                                                            value={item.productId}
                                                            onChange={(e) => updateItem(item.id, { productId: e.target.value })}
                                                        >
                                                            <option value="">בחר מוצר...</option>
                                                            {supplierProducts.map(product => (
                                                                <option key={product.id} value={product.id}>
                                                                    {product.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{item.productName}</div>
                                                            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                                {item.description}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td dir="ltr" style={{ textAlign: 'right' }}>{item.sku}</td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
                                                            min="1"
                                                            style={{ width: '80px' }}
                                                            dir="ltr"
                                                        />
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </td>
                                                <td>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={item.unitPrice}
                                                            onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                                            min="0"
                                                            style={{ width: '100px' }}
                                                            dir="ltr"
                                                        />
                                                    ) : (
                                                        `₪${item.unitPrice.toLocaleString()}`
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                                    ₪{item.totalPrice.toLocaleString()}
                                                </td>
                                                {isEditing && (
                                                    <td>
                                                        <button
                                                            className="btn btn-ghost btn-sm"
                                                            onClick={() => removeItem(item.id)}
                                                            style={{ color: 'var(--color-error)' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {isEditing && (
                            <button className="btn btn-secondary mt-lg" onClick={addItem}>
                                + הוספת פריט
                            </button>
                        )}

                        {/* Summary */}
                        <div className="order-summary">
                            <div className="order-summary-row">
                                <span>סכום ביניים:</span>
                                <span>₪{totals.subtotal.toLocaleString()}</span>
                            </div>

                            {isEditing && (
                                <div style={{ padding: 'var(--spacing-sm) 0' }}>
                                    <label className="form-checkbox" style={{ color: 'white' }}>
                                        <input
                                            type="checkbox"
                                            checked={!includesVat}
                                            onChange={(e) => setIncludesVat(!e.target.checked)}
                                        />
                                        <span>לא כולל מע״מ (18%)</span>
                                    </label>
                                </div>
                            )}

                            {!includesVat && (
                                <div className="order-summary-row">
                                    <span>מע״מ (18%):</span>
                                    <span>₪{totals.vatAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="order-summary-row total">
                                <span>סה״כ לתשלום:</span>
                                <span>₪{totals.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="order-section">
                        <h3 className="order-section-title">
                            <FileText size={20} />
                            הערות
                        </h3>
                        {isEditing ? (
                            <textarea
                                className="form-textarea"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        ) : (
                            <div className="text-muted">{order.notes || 'אין הערות'}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Print View */}
            <div ref={printRef} className="print-order" style={{ display: 'none' }}>
                <style>{`
          @media print {
            .print-order { display: block !important; }
          }
        `}</style>

                <div className="print-order-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <img src="/logo.png" alt="Logo" style={{ maxWidth: '300px', marginBottom: '10px' }} />
                    <h1 style={{ margin: 0 }}>טופס הזמנת רכש</h1>
                    <p>רחוב: יוני נתניהו 1, אור יהודה, 6037601</p>
                    <p>טלפון 03-6754200 | פקס 153-35386394</p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <p><strong>מספר הזמנה:</strong> {order.orderNumber}</p>
                        <p><strong>תאריך הזמנה:</strong> {new Date(order.date).toLocaleDateString('he-IL')}</p>
                    </div>
                    <div>
                        <p><strong>שם ספק:</strong> {order.supplierName}</p>
                        <p><strong>איש קשר:</strong> {order.supplierContact}</p>
                        <p><strong>טלפון:</strong> {order.supplierPhone}</p>
                    </div>
                </div>

                <table className="print-order-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #333', padding: '8px' }}>תיאור מוצר</th>
                            <th style={{ border: '1px solid #333', padding: '8px' }}>פירוט</th>
                            <th style={{ border: '1px solid #333', padding: '8px' }}>מק״ט</th>
                            <th style={{ border: '1px solid #333', padding: '8px' }}>כמות</th>
                            <th style={{ border: '1px solid #333', padding: '8px' }}>מחיר</th>
                            <th style={{ border: '1px solid #333', padding: '8px' }}>סה״כ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td style={{ border: '1px solid #333', padding: '8px' }}>{item.productName}</td>
                                <td style={{ border: '1px solid #333', padding: '8px' }}>{item.description}</td>
                                <td style={{ border: '1px solid #333', padding: '8px' }}>{item.sku}</td>
                                <td style={{ border: '1px solid #333', padding: '8px' }}>{item.quantity}</td>
                                <td style={{ border: '1px solid #333', padding: '8px' }}>₪{item.unitPrice.toLocaleString()}</td>
                                <td style={{ border: '1px solid #333', padding: '8px' }}>₪{item.totalPrice.toLocaleString()}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={5} style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>
                                <strong>סה״כ לפני מע״מ</strong>
                            </td>
                            <td style={{ border: '1px solid #333', padding: '8px' }}>
                                <strong>₪{totals.subtotal.toLocaleString()}</strong>
                            </td>
                        </tr>
                        {includesVat && (
                            <tr>
                                <td colSpan={5} style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>
                                    <strong>מע״מ (18%)</strong>
                                </td>
                                <td style={{ border: '1px solid #333', padding: '8px' }}>
                                    <strong>₪{totals.vatAmount.toLocaleString()}</strong>
                                </td>
                            </tr>
                        )}
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <td colSpan={5} style={{ border: '1px solid #333', padding: '8px', textAlign: 'left' }}>
                                <strong>סה״כ לתשלום</strong>
                            </td>
                            <td style={{ border: '1px solid #333', padding: '8px' }}>
                                <strong>₪{totals.total.toLocaleString()}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginBottom: '20px' }}>
                    <p><strong>עבור:</strong> {order.forDescription}</p>
                    <p><strong>חשבונית עבור:</strong> {order.companyName}</p>
                    <p><strong>תנאי תשלום:</strong> {order.paymentTerms}</p>
                    <p><strong>אחריות:</strong> {order.warrantyTerms}</p>
                    {order.location && <p><strong>מיקום אספקת משלוח:</strong> {order.location}</p>}
                    <p><strong>מע״מ:</strong> {includesVat ? 'יתווסף 18%' : 'לא כולל'}</p>
                </div>

                <div style={{ marginTop: '50px' }}>
                    <p><strong>תאריך:</strong> _____________________</p>
                    <div style={{ marginTop: '30px' }}></div>
                    <p><strong>חתימה:</strong> _____________________</p>
                </div>
            </div>
        </div>
    );
}
