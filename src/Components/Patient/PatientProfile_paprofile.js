import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, MapPin, Edit2, Save, X, Camera,
    Shield, Activity, Heart, Info, ChevronRight, CheckCircle, Loader2,
    AlertTriangle, Clipboard
} from 'lucide-react';
import api from '../../services/api';
import './PatientProfile_paprofile.css';

const PatientProfile_paprofile = ({ patientId: propPatientId }) => {
    const { patientId: urlPatientId } = useParams();
    const patientId = urlPatientId || propPatientId;

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
        console.log(`[Profile] Initializing for Patient ID: ${patientId}`);
        fetchProfile();
    }, [patientId]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/getPatientById/${patientId}`);
            const finalData = response.data.data || response.data;
            setProfile(finalData);
            setFormData(finalData);
            setError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setError(`Patient ID ${patientId} not found. Please verify the ID or register.`);
            } else if (err.response?.status === 500) {
                setError("Internal Server Error (500). Please check the backend services.");
            } else {
                setError(`Fetch Error: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            await api.put(`/updatePatientDetails/${patientId}`, formData);
            setProfile(formData);
            setEditMode(false);
            setError('');
            alert('Profile updated successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Update failed.';
            setError(`Update failed: ${msg}`);
        }
    };

    if (!patientId) return (
        <div className="loadingContainer_paprofile">
            <AlertTriangle className="errorIcon_paprofile" size={40} color="#991b1b" />
            <p>Access Denied: No Patient ID provided.</p>
            <button onClick={() => window.history.back()} className="cancelBtn_paprofile" style={{ marginTop: '20px' }}>Go Back</button>
        </div>
    );

    if (loading) return (
        <div className="loadingContainer_paprofile">
            <Loader2 className="spinner_paprofile animate-spin" size={40} />
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
                        <div className="statusBadge_paprofile">{profile?.status || 'Active Patient'}</div>
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
                                    <label>Contact Number</label>
                                    {editMode ? (
                                        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.phoneNumber || 'Not provided'}</div>
                                    )}
                                </div>
                                <div className="detailField_paprofile">
                                    <label>Date of Birth</label>
                                    {editMode ? (
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.dateOfBirth || 'Not provided'}</div>
                                    )}
                                </div>
                                <div className="detailField_paprofile">
                                    <label>Gender</label>
                                    {editMode ? (
                                        <select name="gender" value={formData.gender} onChange={handleChange}>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.gender || 'Not specified'}</div>
                                    )}
                                </div>
                                <div className="detailField_paprofile fullWidth_paprofile">
                                    <label>Address</label>
                                    {editMode ? (
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows="2" />
                                    ) : (
                                        <div className="valueBox_paprofile">{profile?.address || 'No address provided'}</div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeSection === 'health' && (
                            <div className="healthSections_paprofile">
                                <div className="statsFlex_paprofile">
                                    <div className="healthCard_paprofile">
                                        <Heart className="hcIcon_paprofile" />
                                        <span>Blood Type</span>
                                        <strong>{profile?.bloodGroup || 'N/A'}</strong>
                                    </div>
                                    <div className="healthCard_paprofile">
                                        <Activity className="hcIcon_paprofile blue_paprofile" />
                                        <span>Status</span>
                                        <strong>{profile?.status || 'Active'}</strong>
                                    </div>
                                    <div className="healthCard_paprofile">
                                        <CheckCircle className="hcIcon_paprofile green_paprofile" />
                                        <span>Verification</span>
                                        <strong>Verified</strong>
                                    </div>
                                </div>

                                <div className="medicalHistoryGrid_paprofile">
                                    <div className="medicalBox_paprofile">
                                        <div className="boxHeader_paprofile">
                                            <AlertTriangle size={18} />
                                            <h3>Chronic Conditions</h3>
                                        </div>
                                        {editMode ? (
                                            <textarea name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} placeholder="e.g. Diabetes, Hypertension" />
                                        ) : (
                                            <p className="medicalValue_paprofile">{profile?.chronicConditions || 'No chronic conditions reported.'}</p>
                                        )}
                                    </div>
                                    <div className="medicalBox_paprofile">
                                        <div className="boxHeader_paprofile">
                                            <Clipboard size={18} />
                                            <h3>Allergies</h3>
                                        </div>
                                        {editMode ? (
                                            <textarea name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Penicillin" />
                                        ) : (
                                            <p className="medicalValue_paprofile">{profile?.allergies || 'No allergies reported.'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="securityList_paprofile">
                                <div className="secItem_paprofile">
                                    <div className="secInfo_paprofile">
                                        <strong>User ID</strong>
                                        <p>Unique identifier for your Medisphere account.</p>
                                    </div>
                                    <div className="badge_paprofile">{profile?.msUserId}</div>
                                </div>
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

