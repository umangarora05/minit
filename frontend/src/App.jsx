// ========================================================================
// MODULE 2: React — React Routers, Conditional Rendering, JSX
// ========================================================================
// Topics: React Router, Conditional Rendering, Props, State, JSX,
//         Authentication & Authorization, useEffect
// ========================================================================

// --- IMPORTS ---
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';           // Reusable React Component
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext'; // Context Provider
import { StudentDashboard, VendorDashboard, DeliveryDashboard, AdminDashboard } from './pages/Dashboards';
import StudentDashboardPage from './pages/StudentDashboard';
import VendorDashboardPage from './pages/VendorDashboard';
import DeliveryDashboardPage from './pages/DeliveryDashboard';
import AdminDashboardPage from './pages/AdminDashboard';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import MyOrders from './pages/MyOrders';
import { useContext, useEffect } from 'react';
import AuthContext from './context/AuthContext';

// ========================================================================
// PRIVATE ROUTE — Conditional Rendering + Authorization
// Shows children only if user is logged in AND has the right role
// Otherwise, redirects using <Navigate>
// ========================================================================
const PrivateRoute = ({ children, roles }) => {
  // useContext — access the shared auth state from AuthContext
  const { user, loading } = useContext(AuthContext);

  // CONDITIONAL RENDERING: show different content based on conditions
  if (loading) return <div>Loading...</div>;       // Show loading while checking auth
  if (!user) return <Navigate to="/login" />;       // Not logged in? → redirect to login
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;                     // Wrong role? → redirect to home
  }
  return children;                                  //   Authorized → show the page
};

// ========================================================================
// DASHBOARD REDIRECT — redirects user to their role-specific dashboard
// This is CONDITIONAL RENDERING based on user.role
// ========================================================================
const DashboardRedirect = () => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;

  // Conditional rendering using if statements
  if (user.role === 'student') return <Navigate to="/student-dashboard" />;
  if (user.role === 'vendor') return <Navigate to="/vendor-dashboard" />;
  if (user.role === 'delivery') return <Navigate to="/delivery-dashboard" />;
  if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
  return <Navigate to="/" />;
};

// ========================================================================
// APP CONTENT — Uses React Router for navigation
// ========================================================================
function AppContent() {
  const location = useLocation(); // React Router hook — gives current URL path

  // Decide whether to show navbar (hide on landing/login/register pages)
  const hideNavbarPaths = ['/', '/login', '/register'];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  // --- useEffect HOOK ---
  // Runs whenever location.pathname changes (dependency array)
  // Toggles theme class on the body element (DOM manipulation)
  useEffect(() => {
    if (location.pathname === '/') {
      document.body.classList.remove('light-theme'); // Dark theme for landing
    } else {
      document.body.classList.add('light-theme');    // Light theme for app pages
    }
  }, [location.pathname]); // dependency array — re-runs when path changes

  // --- JSX: Looks like HTML but is JavaScript ---
  // {} inside JSX = JavaScript expression
  // {condition && <Component />} = short-circuit conditional rendering
  return (
    <>
      {/* Conditional Rendering: show Navbar only on certain pages */}
      {shouldShowNavbar && <Navbar />}

      {/* REACT ROUTER — maps URL paths to React components */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Protected Routes — wrapped in PrivateRoute for authorization */}
        <Route path="/student-dashboard" element={
          <PrivateRoute roles={['student']}>
            <StudentDashboardPage />
          </PrivateRoute>
        } />
        <Route path="/vendor-dashboard" element={
          <PrivateRoute roles={['vendor']}>
            <VendorDashboardPage />
          </PrivateRoute>
        } />
        <Route path="/delivery-dashboard" element={
          <PrivateRoute roles={['delivery']}>
            <DeliveryDashboardPage />
          </PrivateRoute>
        } />
        <Route path="/admin-dashboard" element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboardPage />
          </PrivateRoute>
        } />
        <Route path="/cart" element={
          <PrivateRoute roles={['student']}>
            <Cart />
          </PrivateRoute>
        } />
        <Route path="/payment" element={
          <PrivateRoute roles={['student']}>
            <Payment />
          </PrivateRoute>
        } />
        <Route path="/myorders" element={
          <PrivateRoute roles={['student']}>
            <MyOrders />
          </PrivateRoute>
        } />

        {/* Default route — Landing Page */}
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </>
  );
}

// ========================================================================
// APP — Root Component
// Wraps everything in AuthProvider (Context) and Router
// ========================================================================
function App() {
  return (
    <AuthProvider>       {/* Context Provider — shares auth state with all children */}
      <Router>           {/* React Router — enables client-side navigation */}
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;      // Default export — used by main.jsx
