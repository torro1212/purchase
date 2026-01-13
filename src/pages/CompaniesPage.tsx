import { useState } from 'react';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Company } from '../types';

const DEFAULT_WARRANTY_OPTIONS = [
    'שנה',
    'שנתיים',
    'שלוש שנים',
    'חמש שנים',
    'שנה באתר',
    'שנתיים באתר',
    'שלוש שנים באתר',
    'חמש שנים באתר'
];

export default function CompaniesPage() {
    const { companies, addCompany, updateCompany, deleteCompany } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        registrationNumber: '',
        paymentTerms: '',
        location: '',
        warrantyOptions: DEFAULT_WARRANTY_OPTIONS
    });

    const openModal = (company?: Company) => {
        if (company) {
            setEditingCompany(company);
            setFormData({
                name: company.name,
                registrationNumber: company.registrationNumber,
                paymentTerms: company.paymentTerms,
                location: company.location || '',
                warrantyOptions: company.warrantyOptions
            });
        } else {
            setEditingCompany(null);
            setFormData({
                name: '',
                registrationNumber: '',
                paymentTerms: 'שוטף + 30',
                location: '',
                warrantyOptions: DEFAULT_WARRANTY_OPTIONS
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCompany(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCompany) {
            updateCompany(editingCompany.id, formData);
        } else {
            addCompany(formData);
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק חברה זו?')) {
            deleteCompany(id);
        }
    };

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">ניהול חברות</h1>
                    <p className="page-subtitle">צפייה ועריכת רשימת החברות בארגון</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={20} />
                    הוספת חברה
                </button>
            </header>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>שם חברה</th>
                                <th>ח.פ</th>
                                <th>תנאי תשלום</th>
                                <th>אפשרויות אחריות</th>
                                <th>מיקום</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted" style={{ padding: '3rem' }}>
                                        <Building2 size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                        <p>אין חברות במערכת</p>
                                        <button
                                            className="btn btn-primary mt-lg"
                                            onClick={() => openModal()}
                                        >
                                            הוסף חברה ראשונה
                                        </button>
                                    </td>
                                </tr>
                            ) : (
                                companies.map(company => (
                                    <tr key={company.id}>
                                        <td style={{ fontWeight: 600 }}>{company.name}</td>
                                        <td dir="ltr" style={{ textAlign: 'right' }}>{company.registrationNumber}</td>
                                        <td>{company.paymentTerms}</td>
                                        <td className="text-muted">
                                            {company.warrantyOptions.slice(0, 3).join(', ')}
                                            {company.warrantyOptions.length > 3 && '...'}
                                        </td>
                                        <td>{company.location || '—'}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => openModal(company)}
                                                    title="עריכה"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleDelete(company.id)}
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
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingCompany ? 'עריכת חברה' : 'הוספת חברה חדשה'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row form-row-2">
                                    <div className="form-group">
                                        <label className="form-label">שם חברה *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            placeholder="לדוגמה: חברה בע״מ"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">ח.פ (מספר רישום) *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.registrationNumber}
                                            onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                                            required
                                            dir="ltr"
                                            placeholder="512345678"
                                        />
                                    </div>
                                </div>

                                <div className="form-row form-row-2">
                                    <div className="form-group">
                                        <label className="form-label">תנאי תשלום *</label>
                                        <select
                                            className="form-select"
                                            value={formData.paymentTerms}
                                            onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                                            required
                                        >
                                            <option value="">בחר...</option>
                                            <option value="מזומן">מזומן</option>
                                            <option value="שוטף + 8">שוטף + 8</option>
                                            <option value="שוטף + 30">שוטף + 30</option>
                                            <option value="שוטף + 38">שוטף + 38</option>
                                            <option value="שוטף + 45">שוטף + 45</option>
                                            <option value="שוטף + 60">שוטף + 60</option>
                                            <option value="שוטף + 68">שוטף + 68</option>
                                            <option value="שוטף + 90">שוטף + 90</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">מיקום</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="לדוגמה: משרדי החברה - תל אביב"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">אפשרויות אחריות</label>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(4, 1fr)',
                                        gap: 'var(--spacing-sm)',
                                        padding: 'var(--spacing-md)',
                                        background: 'var(--color-bg-primary)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)'
                                    }}>
                                        {DEFAULT_WARRANTY_OPTIONS.map(option => (
                                            <label key={option} className="form-checkbox" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.warrantyOptions.includes(option)}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                warrantyOptions: [...formData.warrantyOptions, option]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                warrantyOptions: formData.warrantyOptions.filter(o => o !== option)
                                                            });
                                                        }
                                                    }}
                                                />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">
                                    {editingCompany ? 'שמירת שינויים' : 'הוספת חברה'}
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
