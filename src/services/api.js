import axios from 'axios';

// Patient Service Base URL
const PATIENT_BASE_URL = 'http://127.0.0.1:8084/patient/api/v1';

// Doctor Service Base URL
const DOCTOR_BASE_URL = 'http://127.0.0.1:8085/doctor/api/v1';

// Auth Service Base URL
const AUTH_BASE_URL = 'http://127.0.0.1:8083/api/v1/auth';

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
    baseURL: 'http://127.0.0.1:8089/api/v1/admin',
    headers: { 'Content-Type': 'application/json' }
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

// Exporting patientApi as default to maintain backward compatibility
export default patientApi;
