import {
    collection,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    writeBatch,
    increment,
    getDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
    Supplier,
    Product,
    Company,
    Budget,
    PurchaseOrder,
    OrderItem
} from '../types';

// Import initial data for migration
import suppliersData from '../data/suppliers.json';
import productsData from '../data/products.json';
import companiesData from '../data/companies.json';
import budgetsData from '../data/budgets.json';
import ordersData from '../data/orders.json';

class FirebaseDataService {
    // Helper to calculate totals (same as original)
    calculateOrderTotals(items: OrderItem[], addVat: boolean) {
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const vatRate = 0.18;
        const vatAmount = addVat ? subtotal * vatRate : 0;
        const total = subtotal + vatAmount;
        return { subtotal, vatRate, vatAmount, total };
    }

    // ====== INITIALIZATION & MIGRATION ======
    async initializeData() {
        // Check if data exists, if not migrate
        const suppliersSnap = await getDocs(collection(db, 'suppliers'));
        if (suppliersSnap.empty) {
            console.log('Migrating initial data to Firebase...');
            await this.migrateData();
        }
    }

    private async migrateData() {
        const batch = writeBatch(db);

        // Suppliers
        suppliersData.forEach((s: any) => {
            const ref = doc(db, 'suppliers', s.id.toString());
            batch.set(ref, s);
        });

        // Products
        productsData.forEach((p: any) => {
            const ref = doc(db, 'products', p.id);
            batch.set(ref, p);
        });

        // Companies
        companiesData.forEach((c: any) => {
            const ref = doc(db, 'companies', c.id);
            batch.set(ref, c);
        });

        // Budgets
        budgetsData.forEach((b: any) => {
            const ref = doc(db, 'budgets', b.code.toString());
            batch.set(ref, b);
        });

        // Orders
        ordersData.forEach((o: any) => {
            const ref = doc(db, 'orders', o.id);
            batch.set(ref, o);
        });

        // Initialize counter
        const counterRef = doc(db, 'counters', 'orders');
        batch.set(counterRef, {
            2020: 29,
            2025: 1
        });

        await batch.commit();
        console.log('Migration completed');
    }

    // ====== SUPPLIERS ======
    async getSuppliers(): Promise<Supplier[]> {
        const snapshot = await getDocs(collection(db, 'suppliers'));
        return snapshot.docs.map(doc => ({ id: Number(doc.id), ...doc.data() } as Supplier));
    }

    async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
        // Get generic ID or auto-increment? Original used custom ID logic.
        // We'll query for max ID to maintain compatibility or change to string IDs?
        // Let's stick to number IDs as per type definition for now, but strictly safer to use string IDs in Firestore.
        // For simplicity and speed, let's fetch all (cached) to find max ID or use a counter.
        // Simple approach: fetch all to calculate max ID (not scalable but matches current app scale).
        const suppliers = await this.getSuppliers();
        const maxId = Math.max(...suppliers.map(s => s.id), 0);
        const newId = maxId + 1;

        const newSupplier = { ...supplier, id: newId };
        await setDoc(doc(db, 'suppliers', newId.toString()), newSupplier);
        return newSupplier;
    }

    async updateSupplier(id: number, updates: Partial<Supplier>) {
        await updateDoc(doc(db, 'suppliers', id.toString()), updates);
    }

    async deleteSupplier(id: number) {
        await deleteDoc(doc(db, 'suppliers', id.toString()));
    }

    // ====== PRODUCTS ======
    async getProducts(): Promise<Product[]> {
        const snapshot = await getDocs(collection(db, 'products'));
        return snapshot.docs.map(doc => doc.data() as Product);
    }

    async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
        const newId = `prod-${Date.now()}`;
        const newProduct = { ...product, id: newId };
        await setDoc(doc(db, 'products', newId), newProduct);
        return newProduct;
    }

    async updateProduct(id: string, updates: Partial<Product>) {
        await updateDoc(doc(db, 'products', id), updates);
    }

    async deleteProduct(id: string) {
        await deleteDoc(doc(db, 'products', id));
    }

    // ====== COMPANIES ======
    async getCompanies(): Promise<Company[]> {
        const snapshot = await getDocs(collection(db, 'companies'));
        return snapshot.docs.map(doc => doc.data() as Company);
    }

    async addCompany(company: Omit<Company, 'id'>): Promise<Company> {
        const newId = `comp-${Date.now()}`;
        const newCompany = { ...company, id: newId };
        await setDoc(doc(db, 'companies', newId), newCompany);
        return newCompany;
    }

    async updateCompany(id: string, updates: Partial<Company>) {
        await updateDoc(doc(db, 'companies', id), updates);
    }

    async deleteCompany(id: string) {
        await deleteDoc(doc(db, 'companies', id));
    }

    // ====== BUDGETS ======
    async getBudgets(): Promise<Budget[]> {
        const snapshot = await getDocs(collection(db, 'budgets'));
        return snapshot.docs.map(doc => doc.data() as Budget);
    }

    async addBudget(budget: Budget): Promise<Budget> {
        const ref = doc(db, 'budgets', budget.code.toString());
        const snap = await getDoc(ref);
        if (snap.exists()) {
            throw new Error(`Budget code ${budget.code} already exists`);
        }
        await setDoc(ref, budget);
        return budget;
    }

    async updateBudget(code: number, updates: Partial<Budget>) {
        await updateDoc(doc(db, 'budgets', code.toString()), updates);
    }

    async deleteBudget(code: number) {
        await deleteDoc(doc(db, 'budgets', code.toString()));
    }

    // ====== ORDERS ======
    async getOrders(): Promise<PurchaseOrder[]> {
        const q = query(collection(db, 'orders'), orderBy('date', 'desc')); // Assuming 'date' or createdAt
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => doc.data() as PurchaseOrder);
    }

    async generateOrderNumber(): Promise<string> {
        const year = new Date().getFullYear().toString();
        const counterRef = doc(db, 'counters', 'orders');

        // This increment is atomic
        await updateDoc(counterRef, {
            [year]: increment(1)
        });

        const snap = await getDoc(counterRef);
        const data = snap.data();
        const count = data?.[year] || 1;

        return `${year}-${count}`;
    }

    async createOrder(orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<PurchaseOrder> {
        const now = new Date().toISOString();
        const orderNumber = await this.generateOrderNumber();
        const id = `order-${orderNumber}`;

        const newOrder: PurchaseOrder = {
            ...orderData,
            id,
            orderNumber,
            createdAt: now,
            updatedAt: now
        };

        await setDoc(doc(db, 'orders', id), newOrder);
        return newOrder;
    }

    async updateOrder(id: string, updates: Partial<PurchaseOrder>) {
        await updateDoc(doc(db, 'orders', id), {
            ...updates,
            updatedAt: new Date().toISOString()
        });
    }

    async deleteOrder(id: string) {
        await deleteDoc(doc(db, 'orders', id));
    }
}

export const firebaseService = new FirebaseDataService();
