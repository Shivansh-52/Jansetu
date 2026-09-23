import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import BackButton from './components/BackButton';
import ParthAIChat from './components/ParthAIChat';
import CookieBanner from './components/CookieBanner';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GovernanceDashboard from './pages/GovernanceDashboard';
import DeptOfficerDashboard from './pages/DeptOfficerDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import AssetPassport from './pages/AssetPassport';
import OfficialAuth from './pages/OfficialAuth';
import Services from './pages/ServicesDirectory';
import About from './pages/About';
import PublicTracking from './pages/PublicTracking';
import RegisterComplaint from './pages/RegisterComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import DomainHealthcare from './pages/DomainHealthcare';
import DomainAgriculture from './pages/DomainAgriculture';
import DomainPublicServices from './pages/DomainPublicServices';
import DomainEducation from './pages/DomainEducation';
import DocumentVault from './pages/DocumentVault';
import ConsentCenter from './pages/ConsentCenter';
import Dashboard from './pages/Dashboard';
import ScholarshipApplication from './pages/ScholarshipApplication';
import EducationLoanApplication from './pages/EducationLoanApplication';
import HealthcareApplication from './pages/HealthcareApplication';
import AgricultureApplication from './pages/AgricultureApplication';
import ApplicationTracking from './pages/ApplicationTracking';
import InteroperabilityMonitor from './pages/InteroperabilityMonitor';
import SecurityCenter from './pages/SecurityCenter';
import DataTransformation from './pages/DataTransformation';
import DataPermissions from './pages/DataPermissions';
import MyCertificates from './pages/MyCertificates';
import InteroperabilityDashboard from './pages/InteroperabilityDashboard';

import DatabaseMonitor from './pages/DatabaseMonitor';
import MyGovernmentData from './pages/MyGovernmentData';
import Departments from './pages/Departments';
import CertificatesHub from './pages/CertificatesHub';
import AgriculturePortal from './pages/AgriculturePortal';
import HealthcarePortal from './pages/HealthcarePortal';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const userStr = sessionStorage.getItem('user');

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(userStr);
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Citizen or Guest Route
const CitizenOrGuestRoute = ({ children }) => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return children;

    try {
        const user = JSON.parse(userStr);
        if (user.role !== 'citizen') {
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        return children;
    }

    return children;
};

// Redirects authenticated users away from public pages to their dashboard
const RedirectIfAuthenticated = ({ children }) => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return children;

    try {
        const user = JSON.parse(userStr);
        const routes = {
            citizen: '/user-dashboard',
            worker: '/worker-dashboard',
            dept_officer: '/dept-officer-dashboard',
            admin: '/admin-dashboard',
            governance: '/governance-dashboard',
            contractor: '/contractor-dashboard',
        };
        const target = routes[user.role];
        if (target) {
            return <Navigate to={target} replace />;
        }
    } catch {
        return children;
    }

    return children;
};

// Layout component to wrap pages with common elements
const Layout = () => {
    return (
        <>
            <Navbar />
            <BackButton />
            <ParthAIChat />
            <CookieBanner />
            <Outlet />
        </>
    );
};

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: (
                        <Home />
                ),
            },
            {
                path: "/login",
                element: (
                    <RedirectIfAuthenticated>
                        <Login />
                    </RedirectIfAuthenticated>
                ),
            },
            {
                path: "/register",
                element: (
                    <RedirectIfAuthenticated>
                        <Register />
                    </RedirectIfAuthenticated>
                ),
            },
            {
                path: "/services",
                element: (
                        <Services />
                ),
            },
            {
                path: "/departments",
                element: <Departments />,
            },
            {
                path: "/certificates-hub",
                element: <CertificatesHub />,
            },
            {
                path: "/agriculture-portal",
                element: <AgriculturePortal />,
            },
            {
                path: "/healthcare",
                element: <HealthcarePortal />,
            },
            {
                path: "/about",
                element: (
                        <About />
                ),
            },
            {
                path: "/track",
                element: <PublicTracking />,
            },
            {
                path: "/asset-passport",
                element: <AssetPassport />,
            },
            {
                path: "/register-complaint",
                element: (
                    <CitizenOrGuestRoute>
                        <RegisterComplaint />
                    </CitizenOrGuestRoute>
                ),
            },
            {
                path: "/official-auth",
                element: <OfficialAuth />,
            },
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path: "/certificates",
                element: <MyCertificates />,
            },
            {
                path: "/education",
                element: <DomainEducation />,
            },
            {
                path: "/agriculture",
                element: <DomainAgriculture />,
            },
            {
                path: "/education/scholarship",
                element: <ScholarshipApplication />,
            },
            {
                path: "/education/loan",
                element: <EducationLoanApplication />,
            },
            {
                path: "/healthcare/apply",
                element: <HealthcareApplication />,
            },
            {
                path: "/agriculture/apply",
                element: <AgricultureApplication />,
            },
            {
                path: "/tracking/:id",
                element: <ApplicationTracking />,
            },
            {
                path: "/interoperability",
                element: <InteroperabilityMonitor />,
            },
            {
                path: "/interoperability-demo",
                element: <InteroperabilityDashboard />,
            },
            {
                path: "/security",
                element: <SecurityCenter />,
            },
            {
                path: "/transformations",
                element: <DataTransformation />,
            },
            {
                path: "/permissions",
                element: <DataPermissions />,
            },
            {
                path: "/database-monitor",
                element: <DatabaseMonitor />,
            },
            {
                path: "/my-government-data",
                element: <MyGovernmentData />,
            },
            {
                path: "/user-dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <UserDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/domain-education",
                element: <DomainEducation />,
            },
            {
                path: "/domain-healthcare",
                element: <DomainHealthcare />,
            },
            {
                path: "/domain-agriculture",
                element: <DomainAgriculture />,
            },
            {
                path: "/domain-public-services",
                element: <DomainPublicServices />,
            },
            {
                path: "/document-vault",
                element: (
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <DocumentVault />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/consent-center",
                element: (
                    <ProtectedRoute allowedRoles={['citizen']}>
                        <ConsentCenter />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/complaint/:id",
                element: <ComplaintDetails />,
            },
            {
                path: "/worker-dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['worker']}>
                        <WorkerDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/contractor-dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['contractor', 'admin', 'governance']}>
                        <ContractorDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/dept-officer-dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['dept_officer']}>
                        <DeptOfficerDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/admin-dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/governance-dashboard",
                element: (
                    <ProtectedRoute allowedRoles={['governance', 'admin']}>
                        <GovernanceDashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);

const App = () => {
    return <RouterProvider router={router} />;
};

export default App;

