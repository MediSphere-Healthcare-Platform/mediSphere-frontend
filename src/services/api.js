import axios from 'axios';

// API Gateway Base URL
const GATEWAY_BASE_URL = 'http://127.0.0.1:8080/api/';

// Patient Service Base URL (Mapped through gateway)
const PATIENT_BASE_URL = `${GATEWAY_BASE_URL}patients/`;

// Patient Service Direct URL (bypasses gateway - used for authenticated patient calls)
const PATIENT_DIRECT_URL = 'http://localhost:8084/patient/api/v1/';

// Doctor Service Base URL (Mapped through gateway)
const DOCTOR_BASE_URL = `${GATEWAY_BASE_URL}doctors/`;

// Doctor Service Direct URL (bypasses gateway)
const DOCTOR_DIRECT_URL = 'http://localhost:8085/doctor/api/v1/';

// Auth Service Base URL (Directly bypassing gateway due to routing restrictions)
const AUTH_BASE_URL = 'http://localhost:8083/api/v1/auth/';

// Admin Service Base URL (Mapped through gateway)
const ADMIN_BASE_URL = `${GATEWAY_BASE_URL}admin/`;

// Other services use the general Gateway API prefix
const GENERAL_API_URL = GATEWAY_BASE_URL;

// Instance for Patient Service (via gateway - legacy)
export const patientApi = axios.create({
    baseURL: PATIENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Patient Service (DIRECT - bypasses gateway for authenticated calls)
export const directPatientApi = axios.create({
    baseURL: PATIENT_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Doctor Service (via gateway - legacy)
export const doctorApi = axios.create({
    baseURL: DOCTOR_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Doctor Service (DIRECT - bypasses gateway)
export const directDoctorApi = axios.create({
    baseURL: DOCTOR_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Auth Service
export const authApi = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Admin Service
export const adminApi = axios.create({
    baseURL: ADMIN_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Telemedicine Service
export const telemedicineApi = axios.create({
    baseURL: GENERAL_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Payment Service
export const paymentApi = axios.create({
    baseURL: GENERAL_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Appointment Service
export const appointmentApi = axios.create({
    baseURL: GENERAL_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for AI Symptom Check Service
export const symptomApi = axios.create({
    baseURL: GENERAL_API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Reusable Authorization interceptor is now part of addInterceptors

// Helper for generic interceptors
const addInterceptors = (instance, name) => {
    instance.interceptors.request.use((config) => {
        try {
            const stored = sessionStorage.getItem('medisphere_user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (e) {
            console.error(`[${name} Error] Failed to parse auth token`, e);
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    instance.interceptors.response.use(
        (response) => {
            console.log(`[${name} Success] ${response.config.method.toUpperCase()} ${response.config.url}:`, response.data);
            return response;
        },
        (error) => {
            if (error.response) {
                console.error(`[${name} Error] ${error.config.method.toUpperCase()} ${error.config.url}:`, {
                    status: error.response.status,
                    data: error.response.data
                });
            } else if (error.request) {
                console.error(`[${name} Error] No response received. Ensure the service is running.`);
            } else {
                console.error(`[${name} Error] Request setup failed:`, error.message);
            }
            return Promise.reject(error);
        }
    );
};

addInterceptors(patientApi, 'PatientAPI');
addInterceptors(directPatientApi, 'DirectPatientAPI');
addInterceptors(doctorApi, 'DoctorAPI');
addInterceptors(directDoctorApi, 'DirectDoctorAPI');
addInterceptors(authApi, 'AuthAPI');
addInterceptors(adminApi, 'AdminAPI');
addInterceptors(telemedicineApi, 'TelemedicineAPI');
addInterceptors(symptomApi, 'SymptomAPI');
addInterceptors(paymentApi, 'PaymentAPI');
addInterceptors(appointmentApi, 'AppointmentAPI');

// Exporting patientApi as default to maintain backward compatibility
export default patientApi;
