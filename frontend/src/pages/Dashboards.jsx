// ========================================================================
// MODULE 2: React — Simple Components (Placeholder Dashboards)
// ========================================================================
// These are simple components used as fallback/placeholder views
// They demonstrate basic JSX and component exports
// ========================================================================

// Simple functional components — each returns JSX
const StudentDashboard = () => {
    return <div className="container"><h1>Student Dashboard</h1><p>Welcome to MINIT! Start shopping.</p></div>;
};

const VendorDashboard = () => {
    return <div className="container"><h1>Vendor Dashboard</h1><p>Manage your products and orders.</p></div>;
};

const DeliveryDashboard = () => {
    return <div className="container"><h1>Delivery Dashboard</h1><p>View assigned deliveries.</p></div>;
};

const AdminDashboard = () => {
    return <div className="container"><h1>Admin Dashboard</h1><p>System Overview.</p></div>;
};

// Named exports — multiple components from one file
export { StudentDashboard, VendorDashboard, DeliveryDashboard, AdminDashboard };
