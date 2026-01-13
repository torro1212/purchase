import { useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    Package,
    Building2,
    Wallet,
    PlusCircle,
    Menu,
    X
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import OrdersPage from './pages/OrdersPage';
import NewOrderPage from './pages/NewOrderPage';
import EditOrderPage from './pages/EditOrderPage';
import SuppliersPage from './pages/SuppliersPage';
import ProductsPage from './pages/ProductsPage';
import CompaniesPage from './pages/CompaniesPage';
import BudgetsPage from './pages/BudgetsPage';

export default function App() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="app-layout">
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Mobile Overlay */}
            <div
                className={`sidebar-overlay ${mobileMenuOpen ? 'open' : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <FileText size={32} />
                    <h1>הזמנות רכש</h1>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">ראשי</div>
                        <NavLink
                            to="/"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <LayoutDashboard size={20} />
                            <span>לוח בקרה</span>
                        </NavLink>
                        <NavLink
                            to="/orders"
                            className={({ isActive }) => `nav-link ${isActive && !location.pathname.includes('/new') ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <FileText size={20} />
                            <span>הזמנות</span>
                        </NavLink>
                        <NavLink
                            to="/orders/new"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <PlusCircle size={20} />
                            <span>הזמנה חדשה</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">ניהול נתונים</div>
                        <NavLink
                            to="/suppliers"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <Users size={20} />
                            <span>ספקים</span>
                        </NavLink>
                        <NavLink
                            to="/products"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <Package size={20} />
                            <span>מוצרים</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">הגדרות</div>
                        <NavLink
                            to="/companies"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <Building2 size={20} />
                            <span>חברות</span>
                        </NavLink>
                        <NavLink
                            to="/budgets"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={closeMobileMenu}
                        >
                            <Wallet size={20} />
                            <span>תקציבים</span>
                        </NavLink>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/new" element={<NewOrderPage />} />
                    <Route path="/orders/:id" element={<EditOrderPage />} />
                    <Route path="/suppliers" element={<SuppliersPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/companies" element={<CompaniesPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                </Routes>
            </main>
        </div>
    );
}
