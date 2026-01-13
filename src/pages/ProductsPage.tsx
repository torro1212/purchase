import { useState } from 'react';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Product, Currency } from '../types';
import { CURRENCY_LABELS, CURRENCY_SYMBOLS } from '../types';

export default function ProductsPage() {
    const { products, suppliers, addProduct, updateProduct, deleteProduct } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        description: '',
        currency: 'ILS' as Currency,
        supplierId: 0,
        price: 0
    });

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                sku: product.sku,
                description: product.description,
                currency: product.currency,
                supplierId: product.supplierId,
                price: product.price
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', sku: '', description: '', currency: 'ILS', supplierId: suppliers[0]?.id || 0, price: 0 });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ name: '', sku: '', description: '', currency: 'ILS', supplierId: 0, price: 0 });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.supplierId === 0) {
            alert('נא לבחור ספק');
            return;
        }
        if (editingProduct) {
            updateProduct(editingProduct.id, formData);
        } else {
            addProduct(formData);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
            deleteProduct(id);
        }
    };

    // Helper to get supplier name
    const getSupplierName = (supplierId: number) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier?.name || '—';
    };

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">ניהול מוצרים</h1>
                    <p className="page-subtitle">צפייה ועריכת קטלוג המוצרים</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={20} />
                    הוספת מוצר
                </button>
            </header>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>שם מוצר</th>
                                <th>מק״ט</th>
                                <th>תיאור</th>
                                <th>מטבע</th>
                                <th>מחיר</th>
                                <th>ספק</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted" style={{ padding: '3rem' }}>
                                        <Package size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                        <p>אין מוצרים במערכת</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => (
                                    <tr key={product.id}>
                                        <td style={{ fontWeight: 600 }}>{product.name}</td>
                                        <td dir="ltr" style={{ textAlign: 'right' }}>{product.sku}</td>
                                        <td className="text-muted">{product.description}</td>
                                        <td>{CURRENCY_LABELS[product.currency]}</td>
                                        <td style={{ fontWeight: 600 }}>{CURRENCY_SYMBOLS[product.currency]}{(product.price || 0).toLocaleString()}</td>
                                        <td>{getSupplierName(product.supplierId)}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => openModal(product)}
                                                    title="עריכה"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDelete(product.id)}
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
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingProduct ? 'עריכת מוצר' : 'הוספת מוצר חדש'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">שם מוצר *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">מק״ט</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.sku}
                                        onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">תיאור</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                    <div className="form-group">
                                        <label className="form-label">מטבע *</label>
                                        <select
                                            className="form-select"
                                            value={formData.currency}
                                            onChange={e => setFormData({ ...formData, currency: e.target.value as Currency })}
                                            required
                                        >
                                            <option value="ILS">{CURRENCY_LABELS.ILS}</option>
                                            <option value="USD">{CURRENCY_LABELS.USD}</option>
                                            <option value="EUR">{CURRENCY_LABELS.EUR}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ספק *</label>
                                        <select
                                            className="form-select"
                                            value={formData.supplierId}
                                            onChange={e => setFormData({ ...formData, supplierId: Number(e.target.value) })}
                                            required
                                        >
                                            <option value={0}>בחר ספק...</option>
                                            {suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>
                                                    {supplier.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">מחיר *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        min={0}
                                        step="0.01"
                                        dir="ltr"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'שמירת שינויים' : 'הוספת מוצר'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                                    ביטול
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
