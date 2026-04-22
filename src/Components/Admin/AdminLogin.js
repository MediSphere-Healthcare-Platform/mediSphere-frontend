import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../Login/Login.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // A more professional, secure-looking image for admin login
    const adminLoginImage = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1400";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const authRes = await authApi.post('/login', {
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

            if (role === 'ADMIN') {
                const userData = {
                    token,
                    role,
                    msUserId,
                    email: formData.email,
                    name: 'System Administrator'
                };
                login(userData);
                navigate('/admin/dashboard');
            } else {
                setError('Access denied. This portal is for administrators only.');
            }

        } catch (err) {
            console.error('Admin Login error:', err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError('Invalid admin credentials. Please try again.');
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
        <div className="login-wrapper admin-theme">
            <div className="login-container">
                {/* Left Side: Form */}
                <div className="login-form-side">
                    <div className="login-form-container">
                        <Link to="/login" className="back-link">
                            <ChevronLeft size={16} /> User Login
                        </Link>

                        <div className="login-brand admin-brand">
                            <ShieldCheck className="brand-icon" size={32} />
                            <span>MediSphere <span>Admin</span></span>
                        </div>

                        <div className="login-header">
                            <h1>Security Portal</h1>
                            <p>Authorized access only. Please enter your administrator credentials.</p>
                        </div>

                        <form onSubmit={handleAdminLogin} className="login-form">
                            <div className="input-group">
                                <label><AtSign size={16} /> Admin Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="admin@medisphere.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-group">
                                <label><Lock size={16} /> Security Password</label>
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
                                <div className="login-error admin-error">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button type="submit" className="login-submit-btn admin-submit-btn" disabled={loading}>
                                {loading ? (
                                    <><Loader2 size={18} className="spinning" /> Authenticating...</>
                                ) : (
                                    <>Access Dashboard <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: Image */}
                <div className="login-image-side" style={{ backgroundImage: `url(${adminLoginImage})` }}>
                    <div className="login-image-overlay admin-overlay">
                        <div className="image-content">
                            <h2>Administrative <span>Command Center</span></h2>
                            <p>Managing the core infrastructure and ensuring the highest standards of healthcare delivery.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
