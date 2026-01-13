import { useState } from 'react';
import { DollarSign, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PricesPage() {
    const { suppliers, products, getPricesForSupplier, setPrice } = useApp();
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
        suppliers.length > 0 ? suppliers[0].id : null
    );
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [hasChanges, setHasChanges] = useState(false);

    const supplierPrices = selectedSupplierId
        ? getPricesForSupplier(selectedSupplierId)
        : [];

    // Build price map for display
    const priceMap: Record<string, number> = {};
    supplierPrices.forEach(sp => {
        priceMap[sp.productId] = sp.price;
    });

    const effectivePrices = { ...priceMap, ...prices };

    const handlePriceChange = (productId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setPrices(prev => ({ ...prev, [productId]: numValue }));
        setHasChanges(true);
    };

    const handleSave = () => {
        if (!selectedSupplierId) return;

        Object.entries(prices).forEach(([productId, price]) => {
            if (price > 0) {
                setPrice(selectedSupplierId, productId, price);
            }
        });

        setPrices({});
        setHasChanges(false);
        alert('המחירון נשמר בהצלחה!');
    };

    const handleSupplierChange = (id: number) => {
        if (hasChanges && !window.confirm('יש שינויים שלא נשמרו. האם להמשיך?')) {
            return;
        }
        setSelectedSupplierId(id);
        setPrices({});
        setHasChanges(false);
    };

    return (
        <div className="animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1 className="page-title">ניהול מחירונים</h1>
                    <p className="page-subtitle">הגדרת מחירים לפי ספק</p>
                </div>
                {hasChanges && (
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save size={20} />
                        שמירת שינויים
                    </button>
                )}
            </header>

            <div className="card">
                {/* Supplier Selection */}
                <div className="form-group" style={{ maxWidth: '400px', marginBottom: 'var(--spacing-xl)' }}>
                    <label className="form-label">בחירת ספק</label>
                    <select
                        className="form-select"
                        value={selectedSupplierId || ''}
                        onChange={(e) => handleSupplierChange(Number(e.target.value))}
                    >
                        <option value="">בחר ספק...</option>
                        {suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.id}>
                                {supplier.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Prices Table */}
                {selectedSupplierId ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>שם מוצר</th>
                                    <th>מק״ט</th>
                                    <th>תיאור</th>
                                    <th style={{ width: '150px' }}>מחיר (₪)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td style={{ fontWeight: 600 }}>{product.name}</td>
                                        <td dir="ltr" style={{ textAlign: 'right' }}>{product.sku}</td>
                                        <td className="text-muted">{product.description}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={effectivePrices[product.id] || ''}
                                                onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                                placeholder="0"
                                                min="0"
                                                step="0.01"
                                                dir="ltr"
                                                style={{ textAlign: 'left' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <DollarSign size={64} />
                        <h3>בחר ספק להצגת המחירון</h3>
                        <p>בחר ספק מהרשימה למעלה כדי לערוך את המחירון שלו</p>
                    </div>
                )}
            </div>
        </div>
    );
}
