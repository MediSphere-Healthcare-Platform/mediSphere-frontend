import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AtSign, Lock, ArrowRight, Shield } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const loginImage = "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=1400";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate auth
        setTimeout(() => {
            // Check if it's a doctor or patient based on email for demo
            if (formData.email.includes('doctor')) {
                navigate('/doctor');
            } else {
                navigate('/');
            }
            setLoading(false);
        }, 1000);
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
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <div className="input-group">
                                <label><Lock size={16} /> Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="••••••••" 
                                    onChange={handleChange}
                                    required 
                                />
                            </div>

                            <button type="submit" className="login-submit-btn" disabled={loading}>
                                {loading ? "Signing In..." : "Sign In"} <ArrowRight size={18} />
                            </button>
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
