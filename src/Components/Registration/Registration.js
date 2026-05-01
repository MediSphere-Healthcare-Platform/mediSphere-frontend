import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Lock, Shield,
    ArrowRight, CheckCircle2, Award,
    FileUp, FileText, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { authApi, adminApi } from '../../services/api';
import './Registration.css';

const Registration = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        // Doctor specific
        specialty: 'General Medicine',
        licenseUrl: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [licenceFile, setLicenceFile] = useState(null);

    const regImage = "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) setLicenceFile(file);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (role === 'patient') {
                // POST /api/v1/auth/register/patient
                const res = await authApi.post('/register/patient', {
                    email: formData.email,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone
                });

                if (res.data?.status === 'SUCCESS') {
                    setSuccess('Patient account created successfully! Please log in.');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError(res.data?.message || 'Registration failed. Please try again.');
                }

            } else {
                // For Doctors, registration data goes to Admin Service for approval
                if (!licenceFile) {
                    setError('Please upload your medical licence image.');
                    setLoading(false);
                    return;
                }

                const formPayload = new FormData();
                formPayload.append('email', formData.email);
                formPayload.append('password', formData.password);
                formPayload.append('firstName', formData.firstName);
                formPayload.append('lastName', formData.lastName);
                formPayload.append('specialty', formData.specialty);
                formPayload.append('phone', formData.phone);
                formPayload.append('licenceImage', licenceFile);

                const res = await authApi({
                    method: 'post',
                    url: '/register/doctor',
                    data: formPayload,
                    headers: { 'Content-Type': undefined }
                });

                if (res.data?.status === 'SUCCESS') {
                    setSuccess('Doctor registration submitted for admin approval. You will be notified by email.');
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    setError(res.data?.message || 'Registration failed. Please try again.');
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.request) {
                const serviceName = role === 'patient' ? 'Auth' : 'Admin';
                const port = role === 'patient' ? '8083' : '8089';
                setError(`Could not connect to ${serviceName} service. Please ensure it is running on port ${port}.`);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reg-wrapper">
            <div className="reg-container">
                {/* Left Side: Image */}
                <div className="reg-image-side" style={{ backgroundImage: `url(${regImage})` }}>
                    <div className="reg-image-overlay">
                        <div className="image-content">
                            <h2>Join the <span>MediSphere</span> Community</h2>
                            <p>Access world-class healthcare or provide specialized medical services with our integrated digital platform.</p>

                            <div className="reg-features">
                                <div className="feat-item"><CheckCircle2 size={18} /> Instant Consultations</div>
                                <div className="feat-item"><CheckCircle2 size={18} /> Secure Health Records</div>
                                <div className="feat-item"><CheckCircle2 size={18} /> Global Specialist Network</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="reg-form-side">
                    <div className="reg-form-container">
                        <div className="reg-header">
                            <div className="reg-role-toggle">
                                <button
                                    type="button"
                                    className={role === 'patient' ? 'active' : ''}
                                    onClick={() => setRole('patient')}
                                >
                                    Patient
                                </button>
                                <button
                                    type="button"
                                    className={role === 'doctor' ? 'active' : ''}
                                    onClick={() => setRole('doctor')}
                                >
                                    Doctor
                                </button>
                            </div>
                            <h1>Create Account</h1>
                            <p>Enter your details below to get started with MediSphere.</p>
                        </div>

                        <form onSubmit={handleRegister} className="reg-form">
                            <div className="reg-grid">
                                <div className="input-group">
                                    <label><User size={16} /> First Name</label>
                                    <input name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required disabled={loading} />
                                </div>
                                <div className="input-group">
                                    <label><User size={16} /> Last Name</label>
                                    <input name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required disabled={loading} />
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Mail size={16} /> Email Address</label>
                                <input type="email" name="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} required disabled={loading} />
                            </div>

                            <div className="input-group">
                                <label><Phone size={16} /> Phone Number</label>
                                <input name="phone" placeholder="+94 77 123 4567" value={formData.phone} onChange={handleChange} required disabled={loading} />
                            </div>

                            {role === 'doctor' && (
                                <div className="reg-grid">
                                    <div className="input-group">
                                        <label><Award size={16} /> Specialty</label>
                                        <select name="specialty" value={formData.specialty} onChange={handleChange} disabled={loading}>
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                            <option value="Dermatology">Dermatology</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="Gynecology">Gynecology</option>
                                            <option value="Psychiatry">Psychiatry</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label><FileUp size={16} /> Medical Licence (Image)</label>
                                        <div className="file-upload-wrapper">
                                            <input
                                                type="file"
                                                id="licence-upload"
                                                className="file-upload-input"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                required
                                                disabled={loading}
                                            />
                                            <label htmlFor="licence-upload" className="file-upload-label">
                                                {licenceFile ? (
                                                    <><FileText size={16} /> {licenceFile.name}</>
                                                ) : (
                                                    'Upload Licence Image...'
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="reg-grid">
                                <div className="input-group">
                                    <label><Lock size={16} /> Password</label>
                                    <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required disabled={loading} />
                                </div>
                                <div className="input-group">
                                    <label><Shield size={16} /> Confirm</label>
                                    <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} />
                                </div>
                            </div>

                            {error && (
                                <div className="reg-error" style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '12px 16px', borderRadius: '8px',
                                    background: '#fef2f2', border: '1px solid #fee2e2',
                                    color: '#991b1b', fontSize: '14px'
                                }}>
                                    <AlertCircle size={16} /> <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '12px 16px', borderRadius: '8px',
                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    color: '#166534', fontSize: '14px'
                                }}>
                                    <CheckCircle size={16} /> <span>{success}</span>
                                </div>
                            )}

                            <button type="submit" className="reg-submit-btn" disabled={loading}>
                                {loading ? (
                                    <><Loader2 size={18} className="spinning" /> Creating Account...</>
                                ) : (
                                    <>Register Now <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>

                        <div className="reg-footer">
                            <p>Already have an account? <Link to="/login">Sign In</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;
