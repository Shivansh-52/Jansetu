import axios from 'axios';

// Normalize VITE_API_URL so it always points accurately to the /api endpoint
const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();

export const API_URL = (() => {
    if (!envApiUrl || envApiUrl === '/api') return '/api';
    const cleanUrl = envApiUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
})();

// Deduce the base URL for images and static assets from API_URL
export const BASE_URL = (() => {
    if (!envApiUrl || envApiUrl === '/api') return '';
    const cleanUrl = envApiUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api') ? cleanUrl.slice(0, -4) : cleanUrl;
})();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// context is used to enforce role-wise login on backend:
// e.g. 'public' for citizen/worker/local authority portal,
//       'admin_portal' for administration-only portal.
export const loginUser = async (email, password, context) => {
    const payload = { email, password };
    if (context) {
        payload.context = context;
    }
    const response = await api.post('/auth/login', payload);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const registerUser = async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const submitComplaint = async (formData) => {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Attempt request with automatic retry for server cold starts (502 / 503 / network drop)
    const makeRequest = () => axios.post(`${API_URL}/complaint/submit`, formData, {
        headers,
        timeout: 45000
    });

    try {
        const response = await makeRequest();
        return response.data;
    } catch (err) {
        // If server was sleeping or restarting (502/503/timeout), retry once after 2.5s
        if (!err.response || err.response.status === 502 || err.response.status === 503 || err.code === 'ECONNABORTED') {
            await new Promise(r => setTimeout(r, 2500));
            const retryResponse = await makeRequest();
            return retryResponse.data;
        }
        throw err;
    }
};

export const getUserComplaints = async (userId) => {
    const response = await api.get(`/complaint/user/${userId}`);
    return response.data;
};

export const getAssignedTasks = async (department) => {
    const response = await api.get(`/worker/assigned?department=${department}`);
    return response.data;
};

export const uploadWorkerWork = async (formData) => {
    // Debug: Ensure FormData has content
    // console.log("Uploading FormData...");

    // Create a fresh request to avoid 'Content-Type: application/json' default from 'api' instance
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/worker/upload-work`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            // Do NOT set Content-Type. Let browser set 'multipart/form-data; boundary=...'
        }
    });
    return response.data;
};

export const submitFeedback = async (data) => {
    const response = await api.post('/complaint/feedback', data);
    return response.data;
};

export const getAdminStats = async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
};

export const getAllComplaints = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/all${query ? '?' + query : ''}`);
    return response.data;
};

// Governance API
export const getGovernanceAnalytics = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/analytics${query}`);
    return response.data;
};

export const getDeptPerformance = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/department-performance${query}`);
    return response.data;
};

export const getComplaintTrends = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/trends${query}`);
    return response.data;
};

export const getAIMetrics = async (district = '') => {
    const query = district ? `?district=${encodeURIComponent(district)}` : '';
    const response = await api.get(`/governance/ai-metrics${query}`);
    return response.data;
};

export const getComplaintDetails = async (id) => {
    const response = await api.get(`/complaint/${id}`);
    return response.data;
};

export const getComplaintsByEmail = async (email) => {
    const response = await api.get(`/complaint/by-email/${encodeURIComponent(email)}`);
    return response.data;
};

// ============ DEPT OFFICER API ============
export const getDeptOfficerDashboard = async (department) => {
    const response = await api.get(`/dept-officer/dashboard?department=${department}`);
    return response.data;
};

export const getDeptComplaints = async (department) => {
    const response = await api.get(`/dept-officer/complaints?department=${department}`);
    return response.data;
};

export const getDeptWorkers = async (department) => {
    const response = await api.get(`/dept-officer/workers?department=${department}`);
    return response.data;
};

export const assignComplaint = async (complaintId, workerId, officerId, deadline) => {
    const response = await api.post('/dept-officer/assign', {
        complaint_id: complaintId, worker_id: workerId, officer_id: officerId, deadline
    });
    return response.data;
};

export const reassignComplaint = async (complaintId, workerId, officerId) => {
    const response = await api.post('/dept-officer/reassign', {
        complaint_id: complaintId, worker_id: workerId, officer_id: officerId
    });
    return response.data;
};

// ============ WORKER API (UPDATED) ============
export const getWorkerAssignedTasks = async (workerId) => {
    const response = await api.get(`/worker/assigned?worker_id=${workerId}`);
    return response.data;
};

export const acceptTask = async (complaintId, workerId) => {
    const response = await api.post('/worker/accept', {
        complaint_id: complaintId, worker_id: workerId
    });
    return response.data;
};

// ============ ADMIN INTERVENTION API ============
export const getEscalatedComplaints = async () => {
    const response = await api.get('/admin/escalated');
    return response.data;
};

export const getDeptOfficers = async () => {
    const response = await api.get('/admin/dept-officers');
    return response.data;
};

export const overrideComplaintStatus = async (complaintId, status, note) => {
    const response = await api.post('/admin/override-status', {
        complaint_id: complaintId, status, note
    });
    return response.data;
};

export const adminReassign = async (complaintId, department, workerId, note) => {
    const response = await api.post('/admin/reassign', {
        complaint_id: complaintId, department, worker_id: workerId, note
    });
    return response.data;
};

export default api;
export const getNotifications = async (userId) => {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await api.post(`/notifications/read/${id}`);
    return response.data;
};

// ============ REOPEN / APPEAL API ============
export const reopenComplaint = async (complaintId, reason) => {
    const response = await api.post('/complaint/reopen', {
        complaint_id: complaintId, reason
    });
    return response.data;
};

// Smart assignment is now automatic on complaint submission (backend)
// No frontend API call needed for smart-assign

// ============ ADMIN ACCESS CODE API ============
export const verifyAdminAccessCode = async (accessCode) => {
    const response = await api.post('/admin/verify-access-code', {
        access_code: accessCode
    });
    return response.data;
};

// ============ UP DISTRICTS API ============
export const getUPDistricts = async () => {
    const response = await api.get('/admin/up-districts');
    return response.data;
};

// ============ ⭐ 4. CITIZEN RESOLUTION CONFIRMATION ============
export const citizenConfirmResolution = async ({ complaint_id, decision, feedback, rating, channel }) => {
    const response = await api.post('/complaint/citizen-confirm', {
        complaint_id, decision, feedback, rating, channel
    });
    return response.data;
};

// ============ ⭐ 4. GOVERNMENT FIELD INSPECTION (TIER 1) ============
export const govtFieldInspect = async ({ complaint_id, verdict, remarks, qc_score }) => {
    const response = await api.post('/dept-officer/inspect', {
        complaint_id, verdict, remarks, qc_score
    });
    return response.data;
};

// ============ ⭐ 1. MASTER COMPLAINT DETAILS ============
export const getMasterComplaintDetails = async (masterRefId) => {
    const response = await api.get(`/complaint/master/${masterRefId}`);
    return response.data;
};

// ============ ⭐ 3. CONTRACTOR PORTAL API ============
export const getContractorDashboard = async (contractorId = '') => {
    const query = contractorId ? `?contractor_id=${encodeURIComponent(contractorId)}` : '';
    const response = await api.get(`/contractor/dashboard${query}`);
    return response.data;
};

export const uploadContractorRepair = async (formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/contractor/upload-repair`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.data;
};

// ============ ⭐ 3. DIGITAL ASSET PASSPORT API ============
export const getAssetsList = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/asset/list${query ? '?' + query : ''}`);
    return response.data;
};

export const getAssetPassport = async (assetId) => {
    const response = await api.get(`/asset/${assetId}`);
    return response.data;
};

// ============ ⭐ 5. ZONE INTELLIGENCE & CIVIC HOTSPOT API ============
export const getZoneIntelligence = async (district = 'Lucknow', zone = '', ward = '') => {
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (zone) params.append('zone', zone);
    if (ward) params.append('ward', ward);
    const response = await api.get(`/governance/zone-intelligence?${params.toString()}`);
    return response.data;
};

// ============ ⭐ 2. DUAL GOVERNANCE STATS ============
export const getDualGovernanceStats = async () => {
    const response = await api.get('/governance/dual-governance');
    return response.data;
};

// ============ 🎮 CIVIC MITRA GAMIFICATION ============
export const getCitizenGamification = async (userId) => {
    const response = await api.get(`/complaint/gamification/profile/${userId}`);
    return response.data;
};

export const getGamificationLeaderboard = async () => {
    const response = await api.get('/complaint/gamification/leaderboard');
    return response.data;
};

// ============ ⭐ 6. EDUCATION INTEROPERABILITY DOMAIN ============
export const getEducationDocuments = async (masterId) => {
    const response = await api.get(`/education/documents?master_id=${masterId}`);
    return response.data;
};

export const grantEducationConsent = async (masterId, purpose, requestingDept) => {
    const response = await api.post('/education/consent', {
        master_id: masterId,
        purpose,
        requesting_dept: requestingDept
    });
    return response.data;
};

export const getConsentHistory = async (masterId) => {
    const response = await api.get(`/education/consent/history?master_id=${masterId}`);
    return response.data;
};

export const applyEducationService = async (masterId, service) => {
    const response = await api.post('/education/apply', {
        master_id: masterId,
        service
    });
    return response.data;
};

// ============ ⭐ 7. GOVERNMENT CERTIFICATES MODULE ============
export const getGovCertificates = async (citizenId) => {
    const response = await api.get(`/gov/certificates/${citizenId}`);
    return response.data;
};

export const requestCertificateCorrection = async (payload) => {
    const response = await api.post('/gov/certificates/correction', payload);
    return response.data;
};

export const shareCertificateData = async (payload) => {
    const response = await api.post('/gov/certificates/consent', payload);
    return response.data;
};

export const getCertificateAuditLogs = async (citizenId) => {
    const response = await api.get(`/gov/certificates/audit/${citizenId}`);
    return response.data;
};
