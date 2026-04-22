import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doctorApi } from '../../services/api';
import { 
    User, Mail, Phone, Award, Shield, MapPin, 
    Edit2, Save, X, Camera, Globe, Briefcase, Info, 
    Loader2, ExternalLink, Activity, CheckCircle, Eye
} from 'lucide-react';
import './DoctorProfile_doprof.css';

const DoctorProfile_doprof = ({ doctorId: propDoctorId = "UD102616" }) => {
    const { doctorId: urlDoctorId } = useParams();
    
    const getActiveId = () => {
        if (urlDoctorId) {
            sessionStorage.setItem('currentDoctorId', urlDoctorId);
            return urlDoctorId;
        }
        return sessionStorage.getItem('currentDoctorId') || propDoctorId;
    };

    const currentDoctorId = getActiveId();
    const fileInputRef = useRef(null);

    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('professional');
    const [previewImg, setPreviewImg] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showLicenceModal, setShowLicenceModal] = useState(false);

    const headerBg = "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80";

    useEffect(() => {
        fetchProfile();
    }, [currentDoctorId]);

    const fetchProfile = async () => {
        try {
            const response = await doctorApi.get(`getDoctorById/${currentDoctorId}`);
            const data = response.data.data;
            setProfile(data);
            setFormData(data);
            setPreviewImg(null);
        } catch (err) {
            setError('Failed to load professional profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoClick = () => {
        if (editMode) fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImg(reader.result);
        reader.readAsDataURL(file);
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const formPayload = new FormData();
            formPayload.append('doctor', new Blob([JSON.stringify({
                firstName: formData.firstName,
                lastName:  formData.lastName,
                drContactNo: formData.drContactNo,
                status:    formData.status || profile?.status || 'ACTIVE',
            })], { type: 'application/json' }));
            
            if (selectedFile) {
                formPayload.append('profileImage', selectedFile);
            }

            await doctorApi.put(`updateDoctorDetails/${currentDoctorId}`, formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            await fetchProfile();
            setPreviewImg(null);
            setSelectedFile(null);
            setEditMode(false);
            alert('Professional details updated successfully!');
        } catch (err) {
            setError('Update failed. Ensure all fields are valid.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="dpLoading_doprof">
            <div className="dpSpinner_doprof"></div>
            <p>Verifying clinical credentials...</p>
        </div>
    );

    const avatarSrc = previewImg || profile?.profilePic;

    return (
        <div className="dpWrapper_doprof">
            {/* Header / Hero */}
            <div className="dpHero_doprof">
                <div className="dpHeroBg_doprof" style={{ backgroundImage: `url(${headerBg})` }}></div>
                <div className="dpHeroOverlay_doprof"></div>
                <div className="dpHeroContent_doprof">
                    <div className="dpHeroBadge_doprof">
                        <Shield size={14} /> <span>Official Medical Record</span>
                    </div>
                    <h1>Practitioner <span>Profile</span></h1>
                    <p>Manage your professional identity and clinical certification data on the MediSphere network.</p>
                </div>
            </div>

            <div className="dpContainer_doprof">
                {/* Left Sidebar - Glassmorphism */}
                <div className="dpSidebar_doprof">
                    <div className="dpAvatarSection_doprof">
                        <div className={`dpAvatarWrapper_doprof ${editMode ? 'editEnabled_doprof' : ''}`} onClick={handlePhotoClick}>
                            <div className="dpAvatarCircle_doprof">
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="Doctor" className="dpAvatarImg_doprof" />
                            ) : (
                                <User size={80} className="dpDefaultAvatar_doprof" />
                            )}
                        </div>
                            {editMode && (
                                <div className="dpAvatarOverlay_doprof">
                                    <Camera size={24} />
                                    <span>Change Photo</span>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePhotoChange}
                            />
                        </div>
                        <div className="dpProfileHeader_doprof">
                            <h2>Dr. {profile?.firstName} {profile?.lastName}</h2>
                            <p>{profile?.specialty}</p>
                            <div className="dpStatusBadge_doprof">
                                <CheckCircle size={14} /> Verified Practitioner
                            </div>
                        </div>
                    </div>

                    <nav className="dpNav_doprof">
                        <button 
                            className={`dpNavItem_doprof ${activeTab === 'professional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('professional')}
                        >
                            <Award size={18} /> <span>Professional</span>
                        </button>
                        <button 
                            className={`dpNavItem_doprof ${activeTab === 'contact' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contact')}
                        >
                            <Mail size={18} /> <span>Contact</span>
                        </button>
                        <button 
                            className={`dpNavItem_doprof ${activeTab === 'verification' ? 'active' : ''}`}
                            onClick={() => setActiveTab('verification')}
                        >
                            <Shield size={18} /> <span>Verification</span>
                        </button>
                    </nav>
                </div>

                {/* Right Content Area */}
                <div className="dpMainContent_doprof">
                    <div className="dpSectionHeader_doprof">
                        <div className="dpTitleGroup_doprof">
                            <h3>{activeTab === 'professional' ? 'Clinical Information' : activeTab === 'contact' ? 'Connect Details' : 'Certification & Security'}</h3>
                            <p>Update your public-facing professional details and credentials.</p>
                        </div>
                        <div className="dpHeaderActions_doprof">
                            {!editMode ? (
                                <button className="dpBtnEdit_doprof" onClick={() => setEditMode(true)}>
                                    <Edit2 size={16} /> Edit Profile
                                </button>
                            ) : (
                                <div className="dpEditActions_doprof">
                                    <button className="dpBtnCancel_doprof" onClick={() => { setEditMode(false); setPreviewImg(null); }}>Cancel</button>
                                    <button className="dpBtnSave_doprof" onClick={handleUpdate} disabled={saving}>
                                        {saving ? <Loader2 size={16} className="dpSpin_doprof" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dpFormGrid_doprof">
                        {activeTab === 'professional' && (
                            <>
                                <div className="dpInputGroup_doprof">
                                    <label><User size={14} /> First Name</label>
                                    {editMode ? <input name="firstName" value={formData.firstName} onChange={handleChange} /> : <div className="dpStaticValue_doprof">{profile?.firstName}</div>}
                                </div>
                                <div className="dpInputGroup_doprof">
                                    <label><User size={14} /> Last Name</label>
                                    {editMode ? <input name="lastName" value={formData.lastName} onChange={handleChange} /> : <div className="dpStaticValue_doprof">{profile?.lastName}</div>}
                                </div>
                                <div className="dpInputGroup_doprof">
                                    <label><Award size={14} /> Specialty</label>
                                    {editMode ? (
                                        <select name="specialty" value={formData.specialty} onChange={handleChange}>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="Dermatology">Dermatology</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="Gynecology">Gynecology</option>
                                            <option value="Psychiatry">Psychiatry</option>
                                        </select>
                                    ) : <div className="dpStaticValue_doprof">{profile?.specialty}</div>}
                                </div>
                                <div className="dpInputGroup_doprof">
                                    <label><Briefcase size={14} /> Medical Licence ID</label>
                                    <div className="dpStaticValue_doprof dpLockedValue_doprof">
                                        <span>{profile?.drLicence ? "SLMC Certified" : "Pending Verification"}</span>
                                        <button className="dpViewLicenceBtn_doprof" onClick={() => setShowLicenceModal(true)}>
                                            <Eye size={14} /> See Licence
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'contact' && (
                            <>
                                <div className="dpInputGroup_doprof">
                                    <label><Mail size={14} /> Professional Email</label>
                                    <div className="dpStaticValue_doprof dpLockedValue_doprof">doctor@medisphere.com</div>
                                </div>
                                <div className="dpInputGroup_doprof">
                                    <label><Phone size={14} /> Contact Phone</label>
                                    {editMode ? <input name="drContactNo" value={formData.drContactNo} onChange={handleChange} /> : <div className="dpStaticValue_doprof">{profile?.drContactNo}</div>}
                                </div>
                                <div className="dpInputGroup_doprof dpFullWidth_doprof">
                                    <label><MapPin size={14} /> Primary Practice Address</label>
                                    <div className="dpStaticValue_doprof">Central Medical Plaza, Level 4, Colombo 07</div>
                                </div>
                            </>
                        )}

                        {activeTab === 'verification' && (
                            <div className="dpVerificationBox_doprof">
                                <div className="dpVerifyItem_doprof">
                                    <div className="dpVerifyIcon_doprof green_doprof"><Shield size={20} /></div>
                                    <div className="dpVerifyText_doprof">
                                        <h4>Licence Status: Verified</h4>
                                        <p>Your medical certification has been manually reviewed and approved by the MediSphere Admin panel.</p>
                                    </div>
                                </div>
                                <div className="dpVerifyItem_doprof">
                                    <div className="dpVerifyIcon_doprof blue_doprof"><CheckCircle size={20} /></div>
                                    <div className="dpVerifyText_doprof">
                                        <h4>System Integrity</h4>
                                        <p>All data changes are audited to ensure clinical standards are maintained.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="dpAlertError_doprof"><Info size={16} /> {error}</div>}
                </div>
            </div>

            {/* Licence Preview Modal */}
            {showLicenceModal && (
                <div className="dpModal_doprof">
                    <div className="dpModalOverlay_doprof" onClick={() => setShowLicenceModal(false)}></div>
                    <div className="dpModalContent_doprof">
                        <div className="dpModalHeader_doprof">
                            <h3>Medical Licence Verification</h3>
                            <button className="dpModalClose_doprof" onClick={() => setShowLicenceModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="dpLicenceFrame_doprof">
                            <img src={profile?.drLicence} alt="Medical Licence" />
                            <div className="dpLicenceOverlay_doprof">
                                <Shield size={48} />
                                <p>Authentic Document Verified by MediSphere</p>
                            </div>
                        </div>
                        <p className="dpModalFooter_doprof">Note: For security reasons, your medical licence cannot be modified by the user. Contact admin for updates.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorProfile_doprof;
