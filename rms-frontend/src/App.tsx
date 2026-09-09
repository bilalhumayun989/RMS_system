import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { useKitchenStore } from './store/useKitchenStore';
import { useOrderStore } from './store/useOrderStore';
import { useTableStore } from './store/useTableStore';
import { LoginScreen } from './screens/Login/LoginScreen';
import { DashboardScreen } from './screens/Dashboard/DashboardScreen';
import { TablesScreen } from './screens/Tables/TablesScreen';
import { OrderScreen } from './screens/Order/OrderScreen';
import { KitchenScreen } from './screens/Kitchen/KitchenScreen';
import { PaymentScreen } from './screens/Payment/PaymentScreen';
import { BusinessSettingsScreen } from './screens/Settings/BusinessSettingsScreen';
import { ReservationsScreen } from './screens/Reservations/ReservationsScreen';
import { CustomersScreen } from './screens/Customers/CustomersScreen';
import { ServicesScreen } from './screens/Services/ServicesScreen';
import { TableManagementScreen } from './screens/TableManagement/TableManagementScreen';
import { StaffScreen } from './screens/Staff/StaffScreen';
import { ReportsScreen } from './screens/Reports/ReportsScreen';
import { HistoryScreen } from './screens/History/HistoryScreen';
import { SuppliesScreen } from './screens/Supplies/SuppliesScreen';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { Toast } from './components/ui/Toast';
import { DemoBanner } from './components/layout/DemoBanner';

export const App: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, enableDemoMode } = useAppStore();
  const fetchTables = useTableStore((state) => state.fetchTables);
  const fetchMenuItems = useOrderStore((state) => state.fetchMenuItems);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const fetchKitchenOrders = useKitchenStore((state) => state.fetchKitchenOrders);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const href = window.location.href.toLowerCase();
    const isDemoRoute = 
      href.includes('demo') ||
      location.pathname === '/demo' ||
      location.pathname === '/demo/' ||
      location.pathname.endsWith('/demo') ||
      location.pathname.endsWith('/demo/') ||
      location.pathname.includes('/demo') ||
      location.search.includes('demo') ||
      location.hash.includes('demo');

    if (isDemoRoute) {
      enableDemoMode();
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [location, enableDemoMode, navigate]);

  useEffect(() => {
    if (location.pathname === '/login') return;

    fetchTables();
    fetchMenuItems();
    fetchOrders();
    fetchKitchenOrders();
  }, [location.pathname, fetchKitchenOrders, fetchMenuItems, fetchOrders, fetchTables]);

  const getHeaderDetails = () => {
    switch (location.pathname) {
      case '/dashboard':
      case '/':
        return { title: 'Overview Dashboard', breadcrumb: 'Home / Overview' };
      case '/tables':
        return { title: 'Tables Floor Map', breadcrumb: 'POS / Table Layout' };
      case '/reservations':
        return { title: 'Reservations', breadcrumb: 'POS / Reservations' };
      case '/customers':
        return { title: 'Customers', breadcrumb: 'CRM / Customers' };
      case '/table-management':
        return { title: 'Table Management', breadcrumb: 'POS / Tables Setup' };
      case '/staff':
        return { title: 'Staff Management', breadcrumb: 'HR / Staff' };
      case '/supplies':
        return { title: 'Supplies', breadcrumb: 'Inventory / Supplies' };
      case '/history':
        return { title: 'History', breadcrumb: 'Analytics / History' };
      case '/reports':
        return { title: 'Reports', breadcrumb: 'Analytics / Reports' };
      case '/services':
        return { title: 'Services / Menu', breadcrumb: 'POS / Menu Management' };
      case '/order':
        return { title: 'Order Taking POS', breadcrumb: 'POS / New Order' };
      case '/payment':
        return { title: 'Checkout & Bills', breadcrumb: 'POS / Payments' };
      case '/kitchen':
        return { title: 'Kitchen Board', breadcrumb: 'Kitchen / Orders' };
      default:
        return { title: 'RestoPOS', breadcrumb: 'Home' };
    }
  };

  const headerDetails = getHeaderDetails();
  const isLogin = location.pathname === '/login';

  if (isLogin) {
    return (
      <div className="w-full min-h-screen bg-pos-bg text-pos-primary font-sans select-none">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
        <Toast />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-pos-bg text-pos-primary font-sans overflow-hidden select-none">
      {/* Top Demo Banner */}
      <DemoBanner />

      <div className="flex-1 flex min-w-0 h-full overflow-hidden relative">
        {/* Sidebar Nav (Desktop & Tablet) */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={toggleSidebar}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Header Block */}
          <Header
            title={headerDetails.title}
            breadcrumb={headerDetails.breadcrumb}
            onMenuClick={toggleSidebar}
          />

          {/* Dynamic Screen View Container */}
          <main className="flex-1 flex flex-col overflow-hidden relative bg-pos-bg">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/demo" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/tables" element={<TablesScreen />} />
              <Route path="/reservations" element={<ReservationsScreen />} />
              <Route path="/customers" element={<CustomersScreen />} />
              <Route path="/services" element={<ServicesScreen />} />
              <Route path="/order" element={<OrderScreen />} />
              <Route path="/payment" element={<PaymentScreen />} />
              <Route path="/kitchen" element={<KitchenScreen />} />
              <Route path="/settings" element={<BusinessSettingsScreen />} />
              <Route path="/table-management" element={<TableManagementScreen />} />
              <Route path="/staff" element={<StaffScreen />} />
              <Route path="/history" element={<HistoryScreen />} />
              <Route path="/reports" element={<ReportsScreen />} />
              <Route path="/supplies" element={<SuppliesScreen />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          {/* Mobile Navigation Bar */}
          <MobileNav />
        </div>
      </div>

      {/* Global Toast Notification System */}
      <Toast />
    </div>
  );
};

export default App;

