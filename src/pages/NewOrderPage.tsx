import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ShoppingCart, Building2, FileText, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { OrderItem } from '../types';
import { CURRENCY_SYMBOLS } from '../types';

export default function NewOrderPage() {
    const navigate = useNavigate();
    const {
        suppliers,
        products,
        companies,
        budgets,
        createOrder,
        calculateOrderTotals
    } = useApp();

    // Form state
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [companyId, setCompanyId] = useState('');
    const [budgetCode, setBudgetCode] = useState<number | null>(null);
    const [budgetType, setBudgetType] = useState<'expenses' | 'investments'>('expenses');
    const [includesVat, setIncludesVat] = useState(false);
    const [paymentTerms, setPaymentTerms] = useState('');
    const [warrantyTerms, setWarrantyTerms] = useState('');
    const [forDescription, setForDescription] = useState('');
    const [location, setLocation] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [notes, setNotes] = useState('');

    // Get supplier info and prices
    const selectedSupplier = suppliers.find(s => s.id === supplierId);

    // Filter products by selected supplier
    const supplierProducts = useMemo(() => {
        return supplierId ? products.filter(p => p.supplierId === supplierId) : [];
    }, [supplierId, products]);

    // Get selected company info
    const selectedCompany = companies.find(c => c.id === companyId);

    // Update payment/warranty when company changes
    useEffect(() => {
        if (selectedCompany) {
            setPaymentTerms(selectedCompany.paymentTerms);
            if (selectedCompany.warrantyOptions.length > 0) {
                setWarrantyTerms(selectedCompany.warrantyOptions[0]);
            }
            if (selectedCompany.location) {
                setLocation(selectedCompany.location);
            }
        }
    }, [selectedCompany]);

    // Filter budgets by type
    const filteredBudgets = budgets.filter(b => b.type === budgetType);

    // Calculate totals
    const totals = useMemo(() => {
        return calculateOrderTotals(items, includesVat);
    }, [items, includesVat, calculateOrderTotals]);

    // Add empty item row
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

    // Update item
    const updateItem = (id: string, updates: Partial<OrderItem>) => {
        setItems(items.map(item => {
            if (item.id !== id) return item;

            const updated = { ...item, ...updates };

            // If product changed, update product info and price
            if (updates.productId && updates.productId !== item.productId) {
                const product = products.find(p => p.id === updates.productId);
                if (product) {
                    updated.productName = product.name;
                    updated.description = product.description;
                    updated.sku = product.sku;
                    updated.unitPrice = product.price;
                }
            }

            // Recalculate total
            updated.totalPrice = updated.quantity * updated.unitPrice;

            return updated;
        }));
    };

    // Remove item
    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Handle save
    const handleSave = (status: 'draft' | 'sent') => {
        if (!supplierId || !companyId || !budgetCode || items.length === 0) {
            alert('נא למלא את כל השדות הנדרשים ולהוסיף לפחות פריט אחד');
            return;
        }

        const order = {
            date: new Date().toISOString().split('T')[0],
            supplierId,
            supplierName: selectedSupplier?.name || '',
            supplierContact: selectedSupplier?.contactPerson || '',
            supplierPhone: selectedSupplier?.phone || '',
            companyId,
            companyName: selectedCompany?.name || '',
            budgetCode,
            budgetType,
            status,
            items,
            subtotal: totals.subtotal,
            vatRate: totals.vatRate,
            vatAmount: totals.vatAmount,
            total: totals.total,
            includesVat,
            paymentTerms,
            warrantyTerms,
            forDescription,
            location,
            notes
        };

        const newOrder = createOrder(order);
        navigate(`/orders/${newOrder.id}`);
    };

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">הזמנה חדשה</h1>
                    <p className="page-subtitle">יצירת הזמנת רכש חדשה</p>
                </div>
                <div className="flex gap-md">
                    <button
                        className="btn btn-secondary"
                        onClick={() => handleSave('draft')}
                        disabled={items.length === 0}
                    >
                        <Save size={20} />
                        שמור טיוטה
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={() => handleSave('sent')}
                        disabled={items.length === 0}
                    >
                        <FileText size={20} />
                        שמור ושלח
                    </button>
                </div>
            </header>

            <div className="order-form">
                {/* Supplier Section */}
                <div className="order-section">
                    <h3 className="order-section-title">
                        <ShoppingCart size={20} />
                        פרטי ספק
                    </h3>

                    <div className="form-row form-row-2">
                        <div className="form-group">
                            <label className="form-label">בחירת ספק *</label>
                            <select
                                className="form-select"
                                value={supplierId || ''}
                                onChange={(e) => {
                                    setSupplierId(Number(e.target.value));
                                    setItems([]); // Clear items when supplier changes
                                }}
                                required
                            >
                                <option value="">בחר ספק...</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedSupplier && (
                            <div className="form-group">
                                <label className="form-label">פרטי קשר</label>
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div><strong>איש קשר:</strong> {selectedSupplier.contactPerson}</div>
                                    <div dir="ltr" style={{ textAlign: 'right' }}>
                                        <strong style={{ direction: 'rtl' }}>טלפון:</strong> {selectedSupplier.phone}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Company & Budget Section */}
                <div className="order-section">
                    <h3 className="order-section-title">
                        <Building2 size={20} />
                        חברה ותקציב
                    </h3>

                    <div className="form-row form-row-2">
                        <div className="form-group">
                            <label className="form-label">חשבונית עבור *</label>
                            <select
                                className="form-select"
                                value={companyId}
                                onChange={(e) => setCompanyId(e.target.value)}
                                required
                            >
                                <option value="">בחר חברה...</option>
                                {companies.map(company => (
                                    <option key={company.id} value={company.id}>
                                        {company.name} - {company.registrationNumber}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">עבור</label>
                            <input
                                type="text"
                                className="form-input"
                                value={forDescription}
                                onChange={(e) => setForDescription(e.target.value)}
                                placeholder="תיאור ייעוד ההזמנה"
                            />
                        </div>
                    </div>

                    <div className="form-row form-row-3">
                        <div className="form-group">
                            <label className="form-label">סוג תקציב *</label>
                            <select
                                className="form-select"
                                value={budgetType}
                                onChange={(e) => {
                                    setBudgetType(e.target.value as 'expenses' | 'investments');
                                    setBudgetCode(null);
                                }}
                            >
                                <option value="expenses">הוצאות</option>
                                <option value="investments">השקעות</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">מספר תקציב *</label>
                            <select
                                className="form-select"
                                value={budgetCode || ''}
                                onChange={(e) => setBudgetCode(Number(e.target.value))}
                                required
                            >
                                <option value="">בחר תקציב...</option>
                                {filteredBudgets.map(budget => (
                                    <option key={budget.code} value={budget.code}>
                                        {budget.code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">מיקום</label>
                            <input
                                type="text"
                                className="form-input"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row form-row-2">
                        <div className="form-group">
                            <label className="form-label">תנאי תשלום</label>
                            <select
                                className="form-select"
                                value={paymentTerms}
                                onChange={(e) => setPaymentTerms(e.target.value)}
                            >
                                <option value="">בחר...</option>
                                <option value="שוטף + 8">שוטף + 8</option>
                                <option value="שוטף + 38">שוטף + 38</option>
                                <option value="שוטף + 68">שוטף + 68</option>
                                <option value="מזומן">מזומן</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">אחריות</label>
                            <select
                                className="form-select"
                                value={warrantyTerms}
                                onChange={(e) => setWarrantyTerms(e.target.value)}
                            >
                                <option value="">בחר...</option>
                                {selectedCompany?.warrantyOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                                {!selectedCompany && (
                                    <>
                                        <option value="שנה">שנה</option>
                                        <option value="שנתיים">שנתיים</option>
                                        <option value="שלוש שנים">שלוש שנים</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="order-section">
                    <h3 className="order-section-title">
                        <Package size={20} />
                        פריטים
                    </h3>

                    {!supplierId ? (
                        <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                            <ShoppingCart size={48} />
                            <p>בחר ספק כדי להוסיף פריטים להזמנה</p>
                        </div>
                    ) : (
                        <>
                            {items.length > 0 && (
                                <div className="order-items">
                                    {/* Headers */}
                                    <div className="order-item-row" style={{
                                        background: 'var(--color-bg-tertiary)',
                                        fontWeight: 600,
                                        fontSize: 'var(--font-size-sm)'
                                    }}>
                                        <div>מוצר</div>
                                        <div>כמות</div>
                                        <div>מחיר ליחידה</div>
                                        <div>סה״כ</div>
                                        <div></div>
                                    </div>

                                    {items.map(item => (
                                        <div key={item.id} className="order-item-row">
                                            <select
                                                className="form-select"
                                                value={item.productId}
                                                onChange={(e) => updateItem(item.id, { productId: e.target.value })}
                                            >
                                                <option value="">בחר מוצר...</option>
                                                {supplierProducts.map(product => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.name} ({CURRENCY_SYMBOLS[product.currency]}{product.price.toLocaleString()})
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                type="number"
                                                className="form-input"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(item.id, {
                                                    quantity: parseInt(e.target.value) || 0
                                                })}
                                                min="1"
                                                dir="ltr"
                                            />

                                            <input
                                                type="number"
                                                className="form-input"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(item.id, {
                                                    unitPrice: parseFloat(e.target.value) || 0
                                                })}
                                                min="0"
                                                step="0.01"
                                                dir="ltr"
                                            />

                                            <div style={{
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: 'var(--color-success)'
                                            }}>
                                                ₪{item.totalPrice.toLocaleString()}
                                            </div>

                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => removeItem(item.id)}
                                                style={{ color: 'var(--color-error)' }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button className="btn btn-secondary mt-lg" onClick={addItem}>
                                <Plus size={20} />
                                הוספת פריט
                            </button>
                        </>
                    )}

                    {/* Order Summary */}
                    {items.length > 0 && (
                        <div className="order-summary">
                            <div className="order-summary-row">
                                <span>סכום ביניים:</span>
                                <span>₪{totals.subtotal.toLocaleString()}</span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-sm) 0'
                            }}>
                                <label className="form-checkbox" style={{ color: 'white' }}>
                                    <input
                                        type="checkbox"
                                        checked={includesVat}
                                        onChange={(e) => setIncludesVat(e.target.checked)}
                                    />
                                    <span>הוסף מע״מ (18%)</span>
                                </label>
                            </div>

                            {includesVat && (
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
                    )}
                </div>

                {/* Notes */}
                <div className="order-section">
                    <h3 className="order-section-title">
                        <FileText size={20} />
                        הערות
                    </h3>
                    <textarea
                        className="form-textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="הערות נוספות להזמנה..."
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
}
