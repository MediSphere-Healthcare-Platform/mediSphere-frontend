import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Lock, ArrowRight, Shield, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const loginImage = "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=1400";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Step 1: Call auth service
            const authRes = await authApi.post('login', {
                email: formData.email,
                password: formData.password
            });

            const { status, data } = authRes.data;

            if (status !== 'SUCCESS' || !data) {
                setError('Login failed. Please check your credentials.');
                setLoading(false);
                return;
            }

            const { token, role, msUserId } = data;

            if (role === 'DOCTOR') {
                // For doctors: msUserId IS the doctorId (UD#### format)
                // Optionally try to fetch real name from doctor service directly (non-blocking)
                let doctorName = `Dr. (ID: ${msUserId})`;
                try {
                    const drRes = await axios.get(`http://localhost:8085/doctor/api/v1/getDoctorById/${msUserId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const drData = drRes.data?.data;
                    if (drData?.firstName) {
                        doctorName = `Dr. ${drData.firstName} ${drData.lastName || ''}`.trim();
                    }
                } catch (e) {
                    // Non-critical: doctor service unavailable, continue with placeholder name
                    console.warn('[Login] Could not fetch doctor name, using placeholder:', e.message);
                }

                const userData = {
                    token,
                    role,
                    msUserId,
                    doctorId: msUserId,
                    email: formData.email,
                    name: doctorName
                };
                login(userData);
                navigate(`/doctor/dashboard/${msUserId}`);

            } else if (role === 'PATIENT') {
                // For patients: msUserId = UP#### but API uses patientId = P###
                // Resolve msUserId → patientId via getAllPatientForAdmin
                try {
                    // Call patient service directly (bypassing gateway to avoid token validation issues)
                    const patientsRes = await axios.get('http://localhost:8084/patient/api/v1/getAllPatientForAdmin', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const patients = patientsRes.data?.data || [];
                    const matchedPatient = patients.find(p => p.msUserId === msUserId);

                    if (!matchedPatient) {
                        setError('Patient profile not found. Please contact support.');
                        setLoading(false);
                        return;
                    }

                    const patientId = matchedPatient.patientId;
                    const userData = {
                        token,
                        role,
                        msUserId,
                        patientId,
                        email: formData.email,
                        name: `${matchedPatient.firstName || ''} ${matchedPatient.lastName || ''}`.trim()
                    };
                    login(userData);
                    navigate(`/dashboard/${patientId}`);

                } catch (pErr) {
                    console.error('Failed to resolve patientId:', pErr);
                    setError('Could not load patient profile. Make sure the patient service is running.');
                }

            } else {
                setError(`Unknown role: ${role}. Access denied.`);
            }

        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (err.request) {
                setError('Could not connect to auth service. Make sure it is running on port 8083.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                {/* Left Side: Form */}
                <div className="login-form-side">
                    <div className="login-form-container">
                        <div className="login-brand">
                            <Shield className="brand-icon" size={32} />
                            <span>MediSphere</span>
                        </div>

                        <div className="login-header">
                            <h1>Welcome Back</h1>
                            <p>Enter your credentials to access your healthcare portal.</p>
                        </div>

                        <form onSubmit={handleLogin} className="login-form">
                            <div className="input-group">
                                <label><AtSign size={16} /> Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label><Lock size={16} /> Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="login-error" style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '12px 16px', borderRadius: '8px',
                                    background: '#fef2f2', border: '1px solid #fee2e2',
                                    color: '#991b1b', fontSize: '14px', marginBottom: '8px'
                                }}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                {loading ? (
                                    <><Loader2 size={18} className="spinning" /> Signing In...</>
                                ) : (
                                    <>Sign In <ArrowRight size={18} /></>
                                )}
                            </button>

                            <div className="admin-login-link">
                                <Link to="/admin/login">Log in admin</Link>
                            </div>
                        </form>

                        <div className="login-footer">
                            <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="login-image-side" style={{ backgroundImage: `url(${loginImage})` }}>
                    <div className="login-image-overlay">
                        <div className="image-content">
                            <h2>Excellence in <span>Digital Care</span></h2>
                            <p>Providing seamless connectivity between medical professionals and patients worldwide.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
