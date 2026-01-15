// ===============================
// מערכת הזמנות רכש - Type Definitions
// ===============================

// מטבע - Currency
export type Currency = 'ILS' | 'USD' | 'EUR';

export const CURRENCY_LABELS: Record<Currency, string> = {
    ILS: '₪ שקל',
    USD: '$ דולר',
    EUR: '€ יורו'
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
    ILS: '₪',
    USD: '$',
    EUR: '€'
};

// ספק - Supplier
export interface Supplier {
    id: number;
    name: string;
    contactPerson: string;
    phone: string;
    email?: string;
}

// מוצר - Product
export interface Product {
    id: string;
    name: string;
    sku: string;
    description: string;
    currency: Currency;
    supplierId: number;
    price: number; // מחיר המוצר
}

// חברה - Company
export interface Company {
    id: string;
    name: string;
    registrationNumber: string;
    paymentTerms: string;
    warrantyOptions: string[];
    location?: string;
}

// תקציב - Budget
export interface Budget {
    code: number;
    type: 'expenses' | 'investments'; // הוצאות / השקעות
    name?: string; // תיאור התקציב (אופציונלי)
    accountName?: string; // שם חשבון
}

// שורת הזמנה - Order Line Item
export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    description: string;
    sku: string;
    quantity: number;
    unitPrice: number;  // Snapshot at order time - מחיר ברגע ההזמנה
    totalPrice: number; // quantity * unitPrice
}

// סטטוס הזמנה - Order Status
export type OrderStatus = 'draft' | 'sent' | 'received' | 'cancelled';
// טיוטה | נשלחה | התקבלה | בוטלה

// הזמנת רכש - Purchase Order
export interface PurchaseOrder {
    id: string;
    orderNumber: string;          // Format: YYYY-NN
    date: string;                 // ISO date string
    supplierId: number;
    supplierName: string;         // Denormalized for display
    supplierContact: string;
    supplierPhone: string;
    companyId: string;
    companyName: string;          // Denormalized for display
    budgetCode: number;
    budgetType: 'expenses' | 'investments';
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;             // Sum of all line items
    vatRate: number;              // Usually 0.18 (18%)
    vatAmount: number;            // subtotal * vatRate
    total: number;                // subtotal + vatAmount
    includesVat: boolean;         // True if prices include VAT
    paymentTerms: string;
    warrantyTerms: string;
    forDescription?: string;      // עבור - description of purpose
    location?: string;            // מיקום
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// App State
export interface AppState {
    suppliers: Supplier[];
    products: Product[];
    companies: Company[];
    budgets: Budget[];
    orders: PurchaseOrder[];
    orderCounter: { [year: number]: number };  // Track order numbers per year
}

// Helper type for order form
export interface OrderFormData {
    supplierId: number | null;
    companyId: string;
    budgetCode: number | null;
    includesVat: boolean;
    paymentTerms: string;
    warrantyTerms: string;
    forDescription: string;
    location: string;
    items: OrderItem[];
    notes: string;
}

// Status labels in Hebrew
export const STATUS_LABELS: Record<OrderStatus, string> = {
    draft: 'טיוטה',
    sent: 'נשלחה',
    received: 'התקבלה',
    cancelled: 'בוטלה'
};

// Status colors
export const STATUS_COLORS: Record<OrderStatus, string> = {
    draft: '#fbbf24',      // Yellow
    sent: '#3b82f6',       // Blue
    received: '#22c55e',   // Green
    cancelled: '#ef4444'   // Red
};
