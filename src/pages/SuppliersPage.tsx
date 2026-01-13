import { useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Supplier } from '../types';

export default function SuppliersPage() {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        phone: '',
        email: ''
    });

    const openModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                contactPerson: supplier.contactPerson,
                phone: supplier.phone,
                email: supplier.email || ''
            });
        } else {
            setEditingSupplier(null);
            setFormData({ name: '', contactPerson: '', phone: '', email: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSupplier(null);
        setFormData({ name: '', contactPerson: '', phone: '', email: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSupplier) {
            updateSupplier(editingSupplier.id, formData);
        } else {
            addSupplier(formData);
        }
        closeModal();
    };

    const handleDelete = (id: number) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק ספק זה?')) {
            deleteSupplier(id);
        }
    };

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">ניהול ספקים</h1>
                    <p className="page-subtitle">צפייה ועריכת רשימת הספקים</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={20} />
                    הוספת ספק
                </button>
            </header>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>מספר ספק</th>
                                <th>שם ספק</th>
                                <th>איש קשר</th>
                                <th>טלפון</th>
                                <th>אימייל</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted" style={{ padding: '3rem' }}>
                                        <Users size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                        <p>אין ספקים במערכת</p>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map(supplier => (
                                    <tr key={supplier.id}>
                                        <td style={{ fontWeight: 600 }}>{supplier.id}</td>
                                        <td>{supplier.name}</td>
                                        <td>{supplier.contactPerson}</td>
                                        <td dir="ltr" style={{ textAlign: 'right' }}>{supplier.phone}</td>
                                        <td>{supplier.email || '—'}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => openModal(supplier)}
                                                    title="עריכה"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDelete(supplier.id)}
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
                                {editingSupplier ? 'עריכת ספק' : 'הוספת ספק חדש'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">שם ספק *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">איש קשר *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.contactPerson}
                                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">טלפון *</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        dir="ltr"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">אימייל</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">
                                    {editingSupplier ? 'שמירת שינויים' : 'הוספת ספק'}
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
