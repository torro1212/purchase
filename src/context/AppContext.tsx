import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { firebaseService } from '../services/firebaseDataService';
import { useAuth } from './AuthContext';
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

    isLoading: boolean;
    error: string | null;

    // Supplier actions
    addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<Supplier>;
    updateSupplier: (id: number, updates: Partial<Supplier>) => Promise<void>;
    deleteSupplier: (id: number) => Promise<void>;

    // Product actions
    addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;

    // Company actions
    addCompany: (company: Omit<Company, 'id'>) => Promise<Company>;
    updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
    deleteCompany: (id: string) => Promise<void>;

    // Budget actions
    addBudget: (budget: Budget) => Promise<Budget>;
    updateBudget: (code: number, updates: Partial<Budget>) => Promise<void>;
    deleteBudget: (code: number) => Promise<void>;

    // Order actions
    createOrder: (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'> & { orderNumber?: string }) => Promise<PurchaseOrder>;
    updateOrder: (id: string, updates: Partial<PurchaseOrder>) => Promise<void>;
    deleteOrder: (id: string) => Promise<void>;

    // Utilities
    calculateOrderTotals: (items: OrderItem[], includesVat: boolean) => {
        subtotal: number;
        vatRate: number;
        vatAmount: number;
        total: number;
    };
    refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);

    const fetchData = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            await firebaseService.initializeData();

            // One-time refresh for new products data - v4
            const PRODUCTS_VERSION = 'products_v4_2026';
            if (localStorage.getItem('products_version') !== PRODUCTS_VERSION) {
                console.log('Refreshing products and suppliers in Firebase...');
                await firebaseService.refreshProductsAndSuppliers();
                localStorage.setItem('products_version', PRODUCTS_VERSION);
            }

            // One-time refresh for new budgets data - v4
            const BUDGETS_VERSION = 'budgets_v4_2026';
            if (localStorage.getItem('budgets_version') !== BUDGETS_VERSION) {
                console.log('Refreshing budgets in Firebase...');
                await firebaseService.refreshBudgets();
                localStorage.setItem('budgets_version', BUDGETS_VERSION);
            }

            // One-time refresh for orders data - v3
            const ORDERS_VERSION = 'orders_v3_2026';
            if (localStorage.getItem('orders_version') !== ORDERS_VERSION) {
                console.log('Refreshing orders in Firebase...');
                await firebaseService.refreshOrders();
                localStorage.setItem('orders_version', ORDERS_VERSION);
            }

            const [
                suppliersData,
                productsData,
                companiesData,
                budgetsData,
                ordersData
            ] = await Promise.all([
                firebaseService.getSuppliers(),
                firebaseService.getProducts(),
                firebaseService.getCompanies(),
                firebaseService.getBudgets(),
                firebaseService.getOrders()
            ]);

            setSuppliers(suppliersData);
            setProducts(productsData);
            setCompanies(companiesData);
            setBudgets(budgetsData);
            setOrders(ordersData);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Supplier actions
    const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id'>) => {
        const newSupplier = await firebaseService.addSupplier(supplier);
        await fetchData(); // Refresh local state
        return newSupplier;
    }, [fetchData]);

    const updateSupplier = useCallback(async (id: number, updates: Partial<Supplier>) => {
        await firebaseService.updateSupplier(id, updates);
        await fetchData();
    }, [fetchData]);

    const deleteSupplier = useCallback(async (id: number) => {
        await firebaseService.deleteSupplier(id);
        await fetchData();
    }, [fetchData]);

    // Product actions
    const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
        const newProduct = await firebaseService.addProduct(product);
        await fetchData();
        return newProduct;
    }, [fetchData]);

    const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
        await firebaseService.updateProduct(id, updates);
        await fetchData();
    }, [fetchData]);

    const deleteProduct = useCallback(async (id: string) => {
        await firebaseService.deleteProduct(id);
        await fetchData();
    }, [fetchData]);

    // Company actions
    const addCompany = useCallback(async (company: Omit<Company, 'id'>) => {
        const newCompany = await firebaseService.addCompany(company);
        await fetchData();
        return newCompany;
    }, [fetchData]);

    const updateCompany = useCallback(async (id: string, updates: Partial<Company>) => {
        await firebaseService.updateCompany(id, updates);
        await fetchData();
    }, [fetchData]);

    const deleteCompany = useCallback(async (id: string) => {
        await firebaseService.deleteCompany(id);
        await fetchData();
    }, [fetchData]);

    // Budget actions
    const addBudget = useCallback(async (budget: Budget) => {
        const newBudget = await firebaseService.addBudget(budget);
        await fetchData();
        return newBudget;
    }, [fetchData]);

    const updateBudget = useCallback(async (code: number, updates: Partial<Budget>) => {
        await firebaseService.updateBudget(code, updates);
        await fetchData();
    }, [fetchData]);

    const deleteBudget = useCallback(async (code: number) => {
        await firebaseService.deleteBudget(code);
        await fetchData();
    }, [fetchData]);

    // Order actions
    const createOrder = useCallback(async (order: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt'> & { orderNumber?: string }) => {
        const newOrder = await firebaseService.createOrder(order);
        await fetchData();
        return newOrder;
    }, [fetchData]);

    const updateOrder = useCallback(async (id: string, updates: Partial<PurchaseOrder>) => {
        await firebaseService.updateOrder(id, updates);
        await fetchData();
    }, [fetchData]);

    const deleteOrder = useCallback(async (id: string) => {
        await firebaseService.deleteOrder(id);
        await fetchData();
    }, [fetchData]);

    // Utilities
    const calculateOrderTotals = useCallback((items: OrderItem[], includesVat: boolean) => {
        return firebaseService.calculateOrderTotals(items, includesVat);
    }, []);

    const value: AppContextType = {
        suppliers,
        products,
        companies,
        budgets,
        orders,
        isLoading,
        error,
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
        refreshData: fetchData
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
