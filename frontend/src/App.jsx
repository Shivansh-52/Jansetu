import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const App = () => {
    return (
        <Router>
            <Navbar />
            <BackButton />
            <ParthAIChat />
            <CookieBanner />
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={
                        <RedirectIfAuthenticated>
                            <Home />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route
                    path="/login"
                    element={
                        <RedirectIfAuthenticated>
                            <Login />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <RedirectIfAuthenticated>
                            <Register />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route
                    path="/services"
                    element={
                        <RedirectIfAuthenticated>
                            <Services />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route path="/departments" element={<Departments />} />
                <Route path="/certificates-hub" element={<CertificatesHub />} />
                <Route path="/agriculture-portal" element={<AgriculturePortal />} />
                <Route path="/healthcare" element={<HealthcarePortal />} />
                <Route
                    path="/about"
                    element={
                        <RedirectIfAuthenticated>
                            <About />
                        </RedirectIfAuthenticated>
                    }
                />
                <Route path="/track" element={<PublicTracking />} />
                <Route path="/asset-passport" element={<AssetPassport />} />
                <Route 
                    path="/register-complaint" 
                    element={
                        <CitizenOrGuestRoute>
                            <RegisterComplaint />
                        </CitizenOrGuestRoute>
                    } 
                />
                <Route path="/up2" element={<OfficialAuth />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/certificates" element={<MyCertificates />} />
                <Route path="/education" element={<DomainEducation />} />
                <Route path="/agriculture" element={<DomainAgriculture />} />
                <Route path="/education/scholarship" element={<ScholarshipApplication />} />
                <Route path="/education/loan" element={<EducationLoanApplication />} />
                <Route path="/healthcare/apply" element={<HealthcareApplication />} />
                <Route path="/agriculture/apply" element={<AgricultureApplication />} />
                <Route path="/tracking/:id" element={<ApplicationTracking />} />
                <Route path="/interoperability" element={<InteroperabilityMonitor />} />
                <Route path="/interoperability-demo" element={<InteroperabilityDashboard />} />
                <Route path="/security" element={<SecurityCenter />} />
                <Route path="/transformations" element={<DataTransformation />} />
                <Route path="/permissions" element={<DataPermissions />} />
                
                <Route path="/database-monitor" element={<DatabaseMonitor />} />
                <Route path="/my-government-data" element={<MyGovernmentData />} />
                
                {/* Citizen Dashboard & Domains */}
                <Route
                    path="/user-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <UserDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/domain-education"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <DomainEducation />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/domain-healthcare"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <DomainHealthcare />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/domain-agriculture"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <DomainAgriculture />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/domain-public-services"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <DomainPublicServices />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/document-vault"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <DocumentVault />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/consent-center"
                    element={
                        <ProtectedRoute allowedRoles={['citizen']}>
                            <ConsentCenter />
                        </ProtectedRoute>
                    }
                />

                {/* Complaint Details */}
                <Route
                    path="/complaint/:id"
                    element={<ComplaintDetails />}
                />

                {/* Worker Dashboard */}
                <Route
                    path="/worker-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['worker']}>
                            <WorkerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Contractor Dashboard */}
                <Route
                    path="/contractor-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['contractor', 'admin', 'governance']}>
                            <ContractorDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Dept Officer Dashboard */}
                <Route
                    path="/dept-officer-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['dept_officer']}>
                            <DeptOfficerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard */}
                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Governance Dashboard */}
                <Route
                    path="/governance-dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['governance', 'admin']}>
                            <GovernanceDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;

