import axios from 'axios';

// Patient Service Base URL
const PATIENT_BASE_URL = 'http://127.0.0.1:8084/patient/api/v1/';

// Doctor Service Base URL
const DOCTOR_BASE_URL = 'http://127.0.0.1:8085/doctor/api/v1/';

// Auth Service Base URL
const AUTH_BASE_URL = 'http://127.0.0.1:8083/api/v1/auth/';

// Telemedicine Service Base URL
const TELEMEDICINE_BASE_URL = 'http://127.0.0.1:8086/api/';

// Payment Service Base URL
const PAYMENT_BASE_URL = 'http://127.0.0.1:8082/api/v1/';

// Appointment Service Base URL
const APPOINTMENT_BASE_URL = 'http://127.0.0.1:8081/api/v1/';

// Instance for Patient Service
export const patientApi = axios.create({
    baseURL: PATIENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Doctor Service
export const doctorApi = axios.create({
    baseURL: DOCTOR_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Auth Service
export const authApi = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Admin Service
export const adminApi = axios.create({
    baseURL: 'http://127.0.0.1:8089/api/v1/admin/',
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Telemedicine Service
export const telemedicineApi = axios.create({
    baseURL: TELEMEDICINE_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Payment Service
export const paymentApi = axios.create({
    baseURL: PAYMENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Appointment Service
export const appointmentApi = axios.create({
    baseURL: APPOINTMENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for AI Symptom Check Service
export const symptomApi = axios.create({
    baseURL: 'http://127.0.0.1:8088/api/',
    headers: { 'Content-Type': 'application/json' }
});

// Add Authorization interceptor for Symptom API
symptomApi.interceptors.request.use((config) => {
    try {
        const stored = sessionStorage.getItem('medisphere_user');
        if (stored) {
            const user = JSON.parse(stored);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
    } catch (e) {
        console.error("Failed to parse auth token", e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add Authorization interceptor specifically for Telemedicine
telemedicineApi.interceptors.request.use((config) => {
    try {
        const stored = sessionStorage.getItem('medisphere_user');
        if (stored) {
            const user = JSON.parse(stored);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
    } catch (e) {
        console.error("Failed to parse auth token", e);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Helper for generic interceptors
const addInterceptors = (instance, name) => {
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
addInterceptors(doctorApi, 'DoctorAPI');
addInterceptors(authApi, 'AuthAPI');
addInterceptors(adminApi, 'AdminAPI');
addInterceptors(telemedicineApi, 'TelemedicineAPI');
addInterceptors(symptomApi, 'SymptomAPI');
addInterceptors(paymentApi, 'PaymentAPI');
addInterceptors(appointmentApi, 'AppointmentAPI');

// Exporting patientApi as default to maintain backward compatibility
export default patientApi;
