import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { dataService } from '../services/dataService';
import type {
    Supplier,
    Product,
    Company,
    Budget,
    PurchaseOrder,
    OrderItem
} from '../types';

interface AppContextType {
    // Data
    suppliers: Supplier[];
    products: Product[];
    companies: Company[];
    budgets: Budget[];
    orders: PurchaseOrder[];

    // Supplier actions
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
    updateSupplier: (id: number, updates: Partial<Supplier>) => void;
    deleteSupplier: (id: number) => void;

    // Product actions
    addProduct: (product: Omit<Product, 'id'>) => Product;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;

    // Company actions
    addCompany: (company: Omit<Company, 'id'>) => Company;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    deleteCompany: (id: string) => void;

    // Budget actions
    addBudget: (budget: Budget) => Budget;
    updateBudget: (code: number, updates: Partial<Budget>) => void;
    deleteBudget: (code: number) => void;

    // Order actions
    createOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => PurchaseOrder;
    updateOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
    deleteOrder: (id: string) => void;

    // Utilities
    calculateOrderTotals: (items: OrderItem[], includesVat: boolean) => {
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        total: number;
    };
    generateOrderNumber: () => string;
    refreshData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [suppliers, setSuppliers] = useState<Supplier[]>(() => dataService.getSuppliers());
    const [products, setProducts] = useState<Product[]>(() => dataService.getProducts());
    const [companies, setCompanies] = useState<Company[]>(() => dataService.getCompanies());
    const [budgets, setBudgets] = useState<Budget[]>(() => dataService.getBudgets());
    const [orders, setOrders] = useState<PurchaseOrder[]>(() => dataService.getOrders());

    const refreshData = useCallback(() => {
        setSuppliers(dataService.getSuppliers());
        setProducts(dataService.getProducts());
        setOrders(dataService.getOrders());
    }, []);

    // Supplier actions
    const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
        const newSupplier = dataService.addSupplier(supplier);
        setSuppliers(dataService.getSuppliers());
        return newSupplier;
    }, []);

    const updateSupplier = useCallback((id: number, updates: Partial<Supplier>) => {
        dataService.updateSupplier(id, updates);
        setSuppliers(dataService.getSuppliers());
    }, []);

    const deleteSupplier = useCallback((id: number) => {
        dataService.deleteSupplier(id);
        setSuppliers(dataService.getSuppliers());
    }, []);

    // Product actions
    const addProduct = useCallback((product: Omit<Product, 'id'>) => {
        const newProduct = dataService.addProduct(product);
        setProducts(dataService.getProducts());
        return newProduct;
    }, []);

    const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
        dataService.updateProduct(id, updates);
        setProducts(dataService.getProducts());
    }, []);

    const deleteProduct = useCallback((id: string) => {
        dataService.deleteProduct(id);
        setProducts(dataService.getProducts());
    }, []);

    // Company actions
    const addCompany = useCallback((company: Omit<Company, 'id'>) => {
        const newCompany = dataService.addCompany(company);
        setCompanies(dataService.getCompanies());
        return newCompany;
    }, []);

    const updateCompany = useCallback((id: string, updates: Partial<Company>) => {
        dataService.updateCompany(id, updates);
        setCompanies(dataService.getCompanies());
    }, []);

    const deleteCompany = useCallback((id: string) => {
        dataService.deleteCompany(id);
        setCompanies(dataService.getCompanies());
    }, []);

    // Budget actions
    const addBudget = useCallback((budget: Budget) => {
        const newBudget = dataService.addBudget(budget);
        setBudgets(dataService.getBudgets());
        return newBudget;
    }, []);

    const updateBudget = useCallback((code: number, updates: Partial<Budget>) => {
        dataService.updateBudget(code, updates);
        setBudgets(dataService.getBudgets());
    }, []);

    const deleteBudget = useCallback((code: number) => {
        dataService.deleteBudget(code);
        setBudgets(dataService.getBudgets());
    }, []);

    // Order actions
    const createOrder = useCallback((order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
        const newOrder = dataService.createOrder(order);
        setOrders(dataService.getOrders());
        return newOrder;
    }, []);

    const updateOrder = useCallback((id: string, updates: Partial<PurchaseOrder>) => {
        dataService.updateOrder(id, updates);
        setOrders(dataService.getOrders());
    }, []);

    const deleteOrder = useCallback((id: string) => {
        dataService.deleteOrder(id);
        setOrders(dataService.getOrders());
    }, []);

    // Utilities
    const calculateOrderTotals = useCallback((items: OrderItem[], includesVat: boolean) => {
        return dataService.calculateOrderTotals(items, includesVat);
    }, []);

    const generateOrderNumber = useCallback(() => {
        return dataService.generateOrderNumber();
    }, []);

    const value: AppContextType = {
        suppliers,
        products,
        companies,
        budgets,
        orders,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addProduct,
        updateProduct,
        deleteProduct,
        addCompany,
        updateCompany,
        deleteCompany,
        addBudget,
        updateBudget,
        deleteBudget,
        createOrder,
        updateOrder,
        deleteOrder,
        calculateOrderTotals,
        generateOrderNumber,
        refreshData
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
