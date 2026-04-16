import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Mail, Phone, Calendar, MapPin, Edit2, Save, X, Camera, 
    Shield, Activity, Heart, Info, ChevronRight, CheckCircle 
} from 'lucide-react';
import './PatientProfile_paprofile.css';

const PatientProfile_paprofile = ({ patientId = "P001" }) => {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('personal');

    // Decorative image URLs
    const headerBg = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200";
    const healthStatImg = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400";

    useEffect(() => {
        fetchProfile();
    }, [patientId]);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/patient/api/v1/getPatientById/${patientId}`);
            setProfile(response.data.data);
            setFormData(response.data.data);
        } catch (err) {
            setError('Failed to load profile. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:8080/patient/api/v1/updatePatientDetails/${patientId}`, formData);
            setProfile(formData);
            setEditMode(false);
            // In a real app, use a toast notification here
        } catch (err) {
            setError('Update failed. Ensure all fields are valid.');
            console.error(err);
        }
    };

    if (loading) return (
        <div className="loadingContainer_paprofile">
            <div className="spinner_paprofile"></div>
            <p>Gathering your health profile...</p>
        </div>
    );

    return (
        <div className="wrapper_paprofile">
            {/* Hero Section */}
            <div className="hero_paprofile" style={{ backgroundImage: `url(${headerBg})` }}>
                <div className="heroContent_paprofile">
                    <h1>Patient <span>Personal Profile</span></h1>
                    <p>Manage your identity, secure your medical data, and keep your health records updated for better clinical outcomes.</p>
                </div>
                <div className="heroOverlay_paprofile"></div>
            </div>

            <div className="mainContainer_paprofile">
                {/* Left Sidebar - Profile Summary */}
                <div className="sidebar_paprofile">
                    <div className="avatarWrapper_paprofile">
                        <img 
                            src={profile?.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200'} 
                            alt="Profile" 
                            className="mainAvatar_paprofile"
                        />
                        <button className="changePhotoBtn_paprofile" title="Change Photo">
                            <Camera size={16} />
                        </button>
                    </div>
                    
                    <div className="sidebarInfo_paprofile">
                        <h1>{profile?.firstName} {profile?.lastName}</h1>
                        <p className="patientId_paprofile">#{patientId}</p>
                        <div className="statusBadge_paprofile">Active Patient</div>
                    </div>

                    <div className="navMenu_paprofile">
                        <button 
                            className={`menuItem_paprofile ${activeSection === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveSection('personal')}
                        >
                            <User size={18} /> Personal Info
                        </button>
                        <button 
                            className={`menuItem_paprofile ${activeSection === 'health' ? 'active' : ''}`}
                            onClick={() => setActiveSection('health')}
                        >
                            <Activity size={18} /> Health Stats
                        </button>
                        <button 
                            className={`menuItem_paprofile ${activeSection === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveSection('security')}
                        >
                            <Shield size={18} /> Security
                        </button>
                    </div>

                    <div className="sidebarCard_paprofile">
                        <img src={healthStatImg} alt="Health" className="cardImg_paprofile" />
                        <div className="cardIn_paprofile">
                            <h4>Monitor Health</h4>
                            <p>Stay updated with our new vitals tracker coming soon.</p>
                        </div>
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="contentArea_paprofile">
                    <div className="contentHeader_paprofile">
                        <div className="contentTitle_paprofile">
                            <h2>{activeSection === 'personal' ? 'Personal Details' : activeSection === 'health' ? 'Health Summary' : 'Security Settings'}</h2>
                            <p>Manage and protect your profile information.</p>
                        </div>
                        <div className="actionBtns_paprofile">
                            {!editMode ? (
                                <button className="primaryEditBtn_paprofile" onClick={() => setEditMode(true)}>
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <div className="editActions_paprofile">
                                    <button className="cancelBtn_paprofile" onClick={() => setEditMode(false)}>Cancel</button>
                                    <button className="saveBtn_paprofile" onClick={handleUpdate}>
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="detailsGrid_paprofile">
                        {activeSection === 'personal' && (
                            <>
                                <div className="detailField_paprofile">
                                    <label>First Name</label>
                                    {editMode ? (
                                        <input name="firstName" value={formData.firstName} onChange={handleChange} />
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.firstName}</div>
                                    )}
                                </div>
                                <div className="detailField_paprofile">
                                    <label>Last Name</label>
                                    {editMode ? (
                                        <input name="lastName" value={formData.lastName} onChange={handleChange} />
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.lastName}</div>
                                    )}
                                </div>
                                <div className="detailField_paprofile">
                                    <label>Email Address</label>
                                    <div className="valueBox_paprofile disabled_paprofile">{profile?.email} <Shield size={14} title="Verified" /></div>
                                </div>
                                <div className="detailField_paprofile">
                                    <label>Contact Number</label>
                                    {editMode ? (
                                        <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.contactNumber}</div>
                                    )}
                                </div>
                                <div className="detailField_paprofile">
                                    <label>Age</label>
                                    {editMode ? (
                                        <input type="number" name="age" value={formData.age} onChange={handleChange} />
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.age} Years</div>
                                    )}
                                </div>
                                <div className="detailField_paprofile">
                                    <label>Gender</label>
                                    <div className="valueBox_paprofile">{profile?.gender}</div>
                                </div>
                            </>
                        )}

                        {activeSection === 'health' && (
                            <div className="statsFlex_paprofile">
                                <div className="healthCard_paprofile">
                                    <Heart className="hcIcon_paprofile" />
                                    <span>Blood Type</span>
                                    <strong>O+</strong>
                                </div>
                                <div className="healthCard_paprofile">
                                    <Activity className="hcIcon_paprofile blue_paprofile" />
                                    <span>Last Visit</span>
                                    <strong>12 Oct 2026</strong>
                                </div>
                                <div className="healthCard_paprofile">
                                    <CheckCircle className="hcIcon_paprofile green_paprofile" />
                                    <span>Insurance</span>
                                    <strong>Active</strong>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="securityList_paprofile">
                                <div className="secItem_paprofile">
                                    <div className="secInfo_paprofile">
                                        <strong>Change Password</strong>
                                        <p>Keep your account secure with a strong password.</p>
                                    </div>
                                    <ChevronRight size={20} className="secArrow_paprofile" />
                                </div>
                                <div className="secItem_paprofile">
                                    <div className="secInfo_paprofile">
                                        <strong>Two-Factor Authentication</strong>
                                        <p>Add an extra layer of security to your logins.</p>
                                    </div>
                                    <div className="badge_paprofile">Enabled</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="errorAlert_paprofile"><Info size={16} /> {error}</div>}
                </div>
            </div>
        </div>
    );
};

export default PatientProfile_paprofile;
