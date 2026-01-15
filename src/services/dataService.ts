// ===============================
// מערכת הזמנות רכש - Data Service
// ===============================

import type {
    Supplier,
    Product,
    Company,
    Budget,
    PurchaseOrder,
    OrderItem,
    AppState
} from '../types';

// Import initial data
import suppliersData from '../data/suppliers.json';
import productsData from '../data/products.json';
import companiesData from '../data/companies.json';
import budgetsData from '../data/budgets.json';
import ordersData from '../data/orders.json';

const STORAGE_KEY = 'purchase_orders_system';

// Force refresh data - remove after loading once
const DATA_VERSION = 'v2_products_update';
if (localStorage.getItem('data_version') !== DATA_VERSION) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem('data_version', DATA_VERSION);
}

// Initialize state from localStorage or defaults
function getInitialState(): AppState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            console.error('Failed to parse stored data, using defaults');
        }
    }

    return {
        suppliers: suppliersData as Supplier[],
        products: productsData as Product[],
        companies: companiesData as Company[],
        budgets: budgetsData as Budget[],
        orders: ordersData as PurchaseOrder[],
        orderCounter: { 2020: 29, 2025: 1 } // Track existing orders
    };
}

// Persist state to localStorage
function saveState(state: AppState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Data service singleton
class DataService {
    private state: AppState;

    constructor() {
        this.state = getInitialState();
    }

    // ====== SUPPLIERS ======
    getSuppliers(): Supplier[] {
        return [...this.state.suppliers];
    }

    getSupplierById(id: number): Supplier | undefined {
        return this.state.suppliers.find(s => s.id === id);
    }

    addSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
        const maxId = Math.max(...this.state.suppliers.map(s => s.id), 0);
        const newSupplier: Supplier = { ...supplier, id: maxId + 1 };
        this.state.suppliers.push(newSupplier);
        saveState(this.state);
        return newSupplier;
    }

    updateSupplier(id: number, updates: Partial<Supplier>): Supplier | undefined {
        const index = this.state.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            this.state.suppliers[index] = { ...this.state.suppliers[index], ...updates };
            saveState(this.state);
            return this.state.suppliers[index];
        }
        return undefined;
    }

    deleteSupplier(id: number): boolean {
        const index = this.state.suppliers.findIndex(s => s.id === id);
        if (index !== -1) {
            this.state.suppliers.splice(index, 1);
            saveState(this.state);
            return true;
        }
        return false;
    }

    // ====== PRODUCTS ======
    getProducts(): Product[] {
        return [...this.state.products];
    }

    getProductById(id: string): Product | undefined {
        return this.state.products.find(p => p.id === id);
    }

    addProduct(product: Omit<Product, 'id'>): Product {
        const newId = `prod-${Date.now()}`;
        const newProduct: Product = { ...product, id: newId };
        this.state.products.push(newProduct);
        saveState(this.state);
        return newProduct;
    }

    updateProduct(id: string, updates: Partial<Product>): Product | undefined {
        const index = this.state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.state.products[index] = { ...this.state.products[index], ...updates };
            saveState(this.state);
            return this.state.products[index];
        }
        return undefined;
    }

    deleteProduct(id: string): boolean {
        const index = this.state.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.state.products.splice(index, 1);
            saveState(this.state);
            return true;
        }
        return false;
    }

    // ====== COMPANIES ======
    getCompanies(): Company[] {
        return [...this.state.companies];
    }

    getCompanyById(id: string): Company | undefined {
        return this.state.companies.find(c => c.id === id);
    }

    addCompany(company: Omit<Company, 'id'>): Company {
        const newId = `comp-${Date.now()}`;
        const newCompany: Company = { ...company, id: newId };
        this.state.companies.push(newCompany);
        saveState(this.state);
        return newCompany;
    }

    updateCompany(id: string, updates: Partial<Company>): Company | undefined {
        const index = this.state.companies.findIndex(c => c.id === id);
        if (index !== -1) {
            this.state.companies[index] = { ...this.state.companies[index], ...updates };
            saveState(this.state);
            return this.state.companies[index];
        }
        return undefined;
    }

    deleteCompany(id: string): boolean {
        const index = this.state.companies.findIndex(c => c.id === id);
        if (index !== -1) {
            this.state.companies.splice(index, 1);
            saveState(this.state);
            return true;
        }
        return false;
    }

    // ====== BUDGETS ======
    getBudgets(): Budget[] {
        return [...this.state.budgets];
    }

    getBudgetsByType(type: 'expenses' | 'investments'): Budget[] {
        return this.state.budgets.filter(b => b.type === type);
    }

    getBudgetByCode(code: number): Budget | undefined {
        return this.state.budgets.find(b => b.code === code);
    }

    addBudget(budget: Budget): Budget {
        // Check if budget code already exists
        const exists = this.state.budgets.some(b => b.code === budget.code);
        if (exists) {
            throw new Error(`Budget code ${budget.code} already exists`);
        }
        this.state.budgets.push(budget);
        saveState(this.state);
        return budget;
    }

    updateBudget(code: number, updates: Partial<Budget>): Budget | undefined {
        const index = this.state.budgets.findIndex(b => b.code === code);
        if (index !== -1) {
            this.state.budgets[index] = { ...this.state.budgets[index], ...updates };
            saveState(this.state);
            return this.state.budgets[index];
        }
        return undefined;
    }

    deleteBudget(code: number): boolean {
        const index = this.state.budgets.findIndex(b => b.code === code);
        if (index !== -1) {
            this.state.budgets.splice(index, 1);
            saveState(this.state);
            return true;
        }
        return false;
    }

    // ====== ORDERS ======
    getOrders(): PurchaseOrder[] {
        return [...this.state.orders].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    }

    getOrderById(id: string): PurchaseOrder | undefined {
        return this.state.orders.find(o => o.id === id);
    }

    getOrdersBySupplier(supplierId: number): PurchaseOrder[] {
        return this.state.orders.filter(o => o.supplierId === supplierId);
    }

    generateOrderNumber(): string {
        const year = new Date().getFullYear();
        const counter = (this.state.orderCounter[year] || 0) + 1;
        this.state.orderCounter[year] = counter;
        saveState(this.state);
        return `${year}-${counter}`;
    }

    createOrder(orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): PurchaseOrder {
        const now = new Date().toISOString();
        const orderNumber = this.generateOrderNumber();
        const newOrder: PurchaseOrder = {
            ...orderData,
            id: `order-${orderNumber}`,
            orderNumber,
            createdAt: now,
            updatedAt: now
        };
        this.state.orders.push(newOrder);
        saveState(this.state);
        return newOrder;
    }

    updateOrder(id: string, updates: Partial<PurchaseOrder>): PurchaseOrder | undefined {
        const index = this.state.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.state.orders[index] = {
                ...this.state.orders[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            saveState(this.state);
            return this.state.orders[index];
        }
        return undefined;
    }

    deleteOrder(id: string): boolean {
        const index = this.state.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.state.orders.splice(index, 1);
            saveState(this.state);
            return true;
        }
        return false;
    }

    // ====== CALCULATIONS ======
    calculateOrderTotals(items: OrderItem[], addVat: boolean): {
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        total: number;
    } {
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const vatRate = 0.18; // 18% VAT
        const vatAmount = addVat ? subtotal * vatRate : 0;
        const total = subtotal + vatAmount;

        return { subtotal, vatRate, vatAmount, total };
    }

    // ====== RESET ======
    resetToDefaults(): void {
        localStorage.removeItem(STORAGE_KEY);
        this.state = getInitialState();
    }
}

// Export singleton instance
export const dataService = new DataService();
