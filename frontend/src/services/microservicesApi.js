import api from './api';

export const getSystemHealth = async () => {
    const response = await api.get('/system/health');
    return response.data;
};

export const getEducationProfile = async (masterId) => {
    const response = await api.get(`/proxy/education/profile/${masterId}`);
    return response.data;
};

export const getEducationDocuments = async (masterId) => {
    const response = await api.get(`/proxy/education/documents/${masterId}`);
    return response.data;
};

export const getPublicServiceCerts = async (masterId) => {
    const response = await api.get(`/proxy/public-services/certificates/${masterId}`);
    return response.data;
};

export const applyScholarship = async (masterId, scheme_name, annual_family_income, consent_id) => {
    const response = await api.post('/proxy/education/scholarships', {
        masterId, scheme_name, annual_family_income, consent_id
    });
    return response.data;
};

export const getHealthcareProfile = async (masterId) => {
    const response = await api.get(`/proxy/healthcare/profile/${masterId}`);
    return response.data;
};

export const getAgricultureProfile = async (masterId) => {
    const response = await api.get(`/proxy/agriculture/profile/${masterId}`);
    return response.data;
};

export const getAuditLogs = async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
};

export const getConsentLogs = async () => {
    const response = await api.get('/admin/consent-logs');
    return response.data;
};
