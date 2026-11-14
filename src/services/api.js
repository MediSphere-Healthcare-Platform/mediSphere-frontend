import axios from 'axios';

// ==========================================
// Centralized API Gateway Configuration
// Primary routing: API Gateway (Port 8080)
// With automatic fallback to direct services if Gateway is not running
// ==========================================
const GATEWAY_BASE_URL = 'http://127.0.0.1:8080';

// Service direct URLs for fallback
const DIRECT_PATIENT_URL = 'http://127.0.0.1:8084/patient/api/v1/';
const DIRECT_DOCTOR_URL = 'http://127.0.0.1:8085/doctor/api/v1/';
const DIRECT_AUTH_URL = 'http://127.0.0.1:8083/api/v1/auth/';
const DIRECT_ADMIN_URL = 'http://127.0.0.1:8089/api/v1/admin/';
const DIRECT_PAYMENT_URL = 'http://127.0.0.1:8082/api/v1/payment/';
const DIRECT_APPOINTMENT_URL = 'http://127.0.0.1:8081/api/v1/appointments/';
const DIRECT_TELEMEDICINE_URL = 'http://127.0.0.1:8086/api/sessions/';

// Service Base URLs via Gateway
const PATIENT_BASE_URL = `${GATEWAY_BASE_URL}/api/patients/`;
const DOCTOR_BASE_URL = `${GATEWAY_BASE_URL}/api/doctors/`;
const AUTH_BASE_URL = `${GATEWAY_BASE_URL}/api/auth/`;
const ADMIN_BASE_URL = `${GATEWAY_BASE_URL}/api/admin/`;
const PAYMENT_BASE_URL = `${GATEWAY_BASE_URL}/api/payment/`;
const APPOINTMENT_BASE_URL = `${GATEWAY_BASE_URL}/api/appointments/`;
const TELEMEDICINE_BASE_URL = `${GATEWAY_BASE_URL}/api/sessions/`;

// Instance for Patient Service (via Gateway)
export const patientApi = axios.create({
    baseURL: PATIENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Doctor Service (via Gateway)
export const doctorApi = axios.create({
    baseURL: DOCTOR_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Auth Service (via Gateway)
export const authApi = axios.create({
    baseURL: AUTH_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Admin Service (via Gateway)
export const adminApi = axios.create({
    baseURL: ADMIN_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Payment Service (via Gateway)
export const paymentApi = axios.create({
    baseURL: PAYMENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Appointment Service (via Gateway)
export const appointmentApi = axios.create({
    baseURL: APPOINTMENT_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Instance for Telemedicine Session Service (via Gateway)
export const telemedicineApi = axios.create({
    baseURL: TELEMEDICINE_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// URL Normalizer: removes accidental repeated prefixes
paymentApi.interceptors.request.use((config) => {
    if (config.url) {
        config.url = config.url.replace(/^payment\//, '');
    }
    return config;
});

appointmentApi.interceptors.request.use((config) => {
    if (config.url) {
        config.url = config.url.replace(/^appointments\//, '');
    }
    return config;
});

// Helper for generic interceptors (Auth header injection + Resilient Fallback)
const addInterceptors = (instance, name, fallbackBaseUrl) => {
    // Inject JWT token into Authorization header for all calls
    instance.interceptors.request.use(
        (config) => {
            try {
                const stored = sessionStorage.getItem('medisphere_user');
                if (stored) {
                    const user = JSON.parse(stored);
                    if (user && user.token) {
                        config.headers['Authorization'] = `Bearer ${user.token}`;
                    }
                }
            } catch (err) {
                // Ignore parse errors if session data is malformed
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor with automatic direct fallback
    instance.interceptors.response.use(
        (response) => {
            console.log(`[${name} Success] ${response.config.method.toUpperCase()} ${response.config.url}:`, response.data);
            return response;
        },
        async (error) => {
            const config = error.config;
            // If request to Gateway failed (network error, connection refused, or 404/502/503/504)
            // and we have a fallback direct service URL that hasn't been tried yet:
            const isGatewayFailure = !error.response || [404, 502, 503, 504].includes(error.response.status);
            if (fallbackBaseUrl && !config._retried && isGatewayFailure) {
                config._retried = true;
                config.baseURL = fallbackBaseUrl;
                console.warn(`[${name}] Gateway route failed/unreachable. Retrying directly on: ${fallbackBaseUrl}${config.url}`);
                return axios(config);
            }

            if (error.response) {
                console.error(`[${name} Error] ${error.config.method.toUpperCase()} ${error.config.url}:`, {
                    status: error.response.status,
                    data: error.response.data
                });
            } else if (error.request) {
                console.error(`[${name} Error] No response received. Ensure service or API Gateway is running.`);
            } else {
                console.error(`[${name} Error] Request setup failed:`, error.message);
            }
            return Promise.reject(error);
        }
    );
};

// Register interceptors on all clients with fallback targets
addInterceptors(patientApi, 'PatientService', DIRECT_PATIENT_URL);
addInterceptors(doctorApi, 'DoctorService', DIRECT_DOCTOR_URL);
addInterceptors(authApi, 'AuthService', DIRECT_AUTH_URL);
addInterceptors(adminApi, 'AdminService', DIRECT_ADMIN_URL);
addInterceptors(paymentApi, 'PaymentService', DIRECT_PAYMENT_URL);
addInterceptors(appointmentApi, 'AppointmentService', DIRECT_APPOINTMENT_URL);
addInterceptors(telemedicineApi, 'TelemedicineService', DIRECT_TELEMEDICINE_URL);

// Export patientApi as default for backward compatibility
export default patientApi;
