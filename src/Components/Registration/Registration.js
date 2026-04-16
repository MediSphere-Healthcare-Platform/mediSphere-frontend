import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    User, Mail, Phone, Lock, Shield, 
    ArrowRight, CheckCircle2, Award, Briefcase,
    FileUp, FileText
} from 'lucide-react';
import './Registration.css';

const Registration = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('patient');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        password: '',
        confirmPassword: '',
        // Doctor specific
        specialty: 'General Medicine',
        drLicence: '',
        drContactNo: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [licenceFile, setLicenceFile] = useState(null);

    const regImage = "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&q=80&w=1200";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLicenceFile(file);
            setFormData({ ...formData, drLicence: file.name });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        setError('');

        try {
            if (role === 'patient') {
                await axios.post('http://localhost:8080/patient/api/v1/createPatient', {
                    patient: formData,
                    profileImage: null
                });
            } else {
                await axios.post('http://localhost:8080/doctor/api/v1/createDoctor', formData);
            }
            alert('Registration Successful!');
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
            console.error(err);
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
                                    className={role === 'patient' ? 'active' : ''} 
                                    onClick={() => setRole('patient')}
                                >
                                    Patient
                                </button>
                                <button 
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
                                    <input name="firstName" placeholder="John" onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label><User size={16} /> Last Name</label>
                                    <input name="lastName" placeholder="Doe" onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label><Mail size={16} /> Email Address</label>
                                <input type="email" name="email" placeholder="john.doe@example.com" onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <label><Phone size={16} /> Phone Number</label>
                                <input name="contactNumber" placeholder="+94 77 123 4567" onChange={handleChange} required />
                            </div>

                            {role === 'doctor' && (
                                <div className="reg-grid">
                                    <div className="input-group">
                                        <label><Award size={16} /> Specialty</label>
                                        <select name="specialty" onChange={handleChange}>
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label><FileUp size={16} /> Add Licence (PDF/Image)</label>
                                        <div className="file-upload-wrapper">
                                            <input 
                                                type="file" 
                                                id="licence-upload"
                                                className="file-upload-input"
                                                accept=".pdf,image/*"
                                                onChange={handleFileChange}
                                                required 
                                            />
                                            <label htmlFor="licence-upload" className="file-upload-label">
                                                {licenceFile ? (
                                                    <><FileText size={16} /> {licenceFile.name}</>
                                                ) : (
                                                    "Choose File..."
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="reg-grid">
                                <div className="input-group">
                                    <label><Lock size={16} /> Password</label>
                                    <input type="password" name="password" placeholder="••••••••" onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label><Shield size={16} /> Confirm</label>
                                    <input type="password" name="confirmPassword" placeholder="••••••••" onChange={handleChange} required />
                                </div>
                            </div>

                            {error && <div className="reg-error">{error}</div>}

                            <button type="submit" className="reg-submit-btn" disabled={loading}>
                                {loading ? "Creating Account..." : "Register Now"} <ArrowRight size={18} />
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
