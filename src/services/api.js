import axios from 'axios';

// API Gateway Base URL (kept as fallback)
const GATEWAY_BASE_URL = 'http://localhost:8080/api/';

// Direct Microservice URLs (bypassing gateway due to local discovery issues)
const APPOINTMENT_DIRECT_URL = 'http://localhost:8081/api/v1/';
const PAYMENT_DIRECT_URL = 'http://localhost:8082/api/v1/';
const AUTH_DIRECT_URL = 'http://localhost:8083/api/v1/auth/';
const PATIENT_DIRECT_URL = 'http://localhost:8084/patient/api/v1/';
const DOCTOR_DIRECT_URL = 'http://localhost:8085/doctor/api/v1/';
const TELEMEDICINE_DIRECT_URL = 'http://localhost:8086/';
const SYMPTOM_DIRECT_URL = 'http://localhost:8088/';
const ADMIN_DIRECT_URL = 'http://localhost:8089/api/v1/admin/';

// Instance for Patient Service
export const patientApi = axios.create({
    baseURL: PATIENT_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Patient Service (Legacy Direct alias)
export const directPatientApi = axios.create({
    baseURL: PATIENT_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Doctor Service
export const doctorApi = axios.create({
    baseURL: DOCTOR_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Doctor Service (Legacy Direct alias)
export const directDoctorApi = axios.create({
    baseURL: DOCTOR_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Auth Service
export const authApi = axios.create({
    baseURL: AUTH_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Admin Service
export const adminApi = axios.create({
    baseURL: ADMIN_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Telemedicine Service
export const telemedicineApi = axios.create({
    baseURL: TELEMEDICINE_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Payment Service
export const paymentApi = axios.create({
    baseURL: PAYMENT_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Appointment Service
export const appointmentApi = axios.create({
    baseURL: APPOINTMENT_DIRECT_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for AI Symptom Check Service
export const symptomApi = axios.create({
    baseURL: SYMPTOM_DIRECT_URL,
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
