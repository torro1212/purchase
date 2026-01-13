import { useState } from 'react';
import { Plus, Edit, Trash2, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Budget } from '../types';

export default function BudgetsPage() {
    const { budgets, addBudget, updateBudget, deleteBudget } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [formData, setFormData] = useState<{
        code: string;
        type: 'expenses' | 'investments';
        name: string;
    }>({
        code: '',
        type: 'expenses',
        name: ''
    });

    const expenseBudgets = budgets.filter(b => b.type === 'expenses');
    const investmentBudgets = budgets.filter(b => b.type === 'investments');

    const openModal = (budget?: Budget) => {
        if (budget) {
            setEditingBudget(budget);
            setFormData({
                code: String(budget.code),
                type: budget.type,
                name: budget.name || ''
            });
        } else {
            setEditingBudget(null);
            setFormData({ code: '', type: 'expenses', name: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBudget(null);
        setFormData({ code: '', type: 'expenses', name: '' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = parseInt(formData.code);
        if (isNaN(code)) {
            alert('נא להזין מספר תקציב תקין');
            return;
        }

        try {
            if (editingBudget) {
                updateBudget(editingBudget.code, {
                    type: formData.type,
                    name: formData.name || undefined
                });
            } else {
                addBudget({
                    code,
                    type: formData.type,
                    name: formData.name || undefined
                });
            }
            closeModal();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'שגיאה בשמירת התקציב');
        }
    };

    const handleDelete = (code: number) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק תקציב זה?')) {
            deleteBudget(code);
        }
    };

    const BudgetCard = ({ budget }: { budget: Budget }) => (
        <div
            style={{
                padding: 'var(--spacing-md)',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontWeight: 600,
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)'
            }}
        >
            <div style={{ fontSize: 'var(--font-size-lg)' }}>{budget.code}</div>
            {budget.name && (
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 400, color: 'var(--color-text-muted)' }}>
                    {budget.name}
                </div>
            )}
            <div className="table-actions" style={{ justifyContent: 'center', marginTop: 'var(--spacing-xs)' }}>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openModal(budget)}
                    title="עריכה"
                >
                    <Edit size={14} />
                </button>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(budget.code)}
                    title="מחיקה"
                    style={{ color: 'var(--color-error)' }}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">תקציבים</h1>
                    <p className="page-subtitle">ניהול קודי התקציב</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus size={20} />
                    הוספת תקציב
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                {/* Expenses */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'var(--color-warning)'
                            }}></span>
                            הוצאות ({expenseBudgets.length})
                        </h2>
                    </div>

                    {expenseBudgets.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                            <Wallet size={48} />
                            <p>אין קודי הוצאות</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: 'var(--spacing-sm)'
                        }}>
                            {expenseBudgets.map(budget => (
                                <BudgetCard key={budget.code} budget={budget} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Investments */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: 'var(--color-success)'
                            }}></span>
                            השקעות ({investmentBudgets.length})
                        </h2>
                    </div>

                    {investmentBudgets.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--spacing-xl)' }}>
                            <Wallet size={48} />
                            <p>אין קודי השקעות</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                            gap: 'var(--spacing-sm)'
                        }}>
                            {investmentBudgets.map(budget => (
                                <BudgetCard key={budget.code} budget={budget} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="card mt-lg">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--spacing-2xl)',
                    padding: 'var(--spacing-lg)'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                            {budgets.length}
                        </div>
                        <div className="text-muted">סה״כ תקציבים</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-warning)' }}>
                            {expenseBudgets.length}
                        </div>
                        <div className="text-muted">הוצאות</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-success)' }}>
                            {investmentBudgets.length}
                        </div>
                        <div className="text-muted">השקעות</div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingBudget ? 'עריכת תקציב' : 'הוספת תקציב חדש'}
                            </h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">מספר תקציב *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        required
                                        disabled={!!editingBudget}
                                        dir="ltr"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">סוג תקציב *</label>
                                    <select
                                        className="form-select"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as 'expenses' | 'investments' })}
                                        required
                                    >
                                        <option value="expenses">הוצאות</option>
                                        <option value="investments">השקעות</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">תיאור (אופציונלי)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="תיאור התקציב"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary">
                                    {editingBudget ? 'שמירת שינויים' : 'הוספת תקציב'}
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
