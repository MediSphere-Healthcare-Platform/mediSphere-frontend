import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doctorApi } from '../../services/api';
import { 
    User, Mail, Phone, Award, Shield, MapPin, 
    Edit2, Save, X, Camera, Globe, Briefcase, Info, Loader2
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
    const [photoUploading, setPhotoUploading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('professional');
    const [previewImg, setPreviewImg] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const headerBg = "https://images.unsplash.com/photo-1559839734-2b71f1536780?auto=format&fit=crop&q=80&w=1200";

    useEffect(() => {
        fetchProfile();
    }, [currentDoctorId]);

    const fetchProfile = async () => {
        try {
            const response = await doctorApi.get(`/getDoctorById/${currentDoctorId}`);
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

    /* ── Profile Photo Selection (preview only) ── */
    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }
        // Store file for upload
        setSelectedFile(file);
        // Show local preview
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImg(reader.result);
        reader.readAsDataURL(file);
    };

    /* ── Save All Changes via multipart/form-data ── */
    const handleUpdate = async () => {
        setSaving(true);
        try {
            const formPayload = new FormData();
            // Doctor fields as JSON part
            formPayload.append('doctor', new Blob([JSON.stringify({
                firstName: formData.firstName,
                lastName:  formData.lastName,
                drContactNo: formData.drContactNo,
                status:    formData.status || profile?.status || 'ACTIVE',
            })], { type: 'application/json' }));
            // Profile image as separate part (optional)
            if (selectedFile) {
                formPayload.append('profileImage', selectedFile);
            }

            await doctorApi.put(`/updateDoctorDetails/${currentDoctorId}`, formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            await fetchProfile(); // Refresh to get Cloudinary URL
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
            <p>Loading medical credentials...</p>
        </div>
    );

    const avatarSrc = previewImg || profile?.profilePic || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300';

    return (
        <div className="dpWrapper_doprof">
            <div className="dpHero_doprof" style={{ backgroundImage: `url(${headerBg})` }}>
                <div className="dpHeroContent_doprof">
                    <h1>Doctor <span>Professional Profile</span></h1>
                    <p>Manage your medical credentials, clinical expertise, and professional biography to build patient trust.</p>
                </div>
                <div className="dpHeroOverlay_doprof"></div>
            </div>

            <div className="dpContainer_doprof">
                <div className="dpSidebar_doprof">
                    {/* Profile Photo with Upload */}
                    <div className="dpAvatarWrapper_doprof">
                        <img 
                            src={avatarSrc}
                            alt="Doctor" 
                            className="dpAvatar_doprof"
                        />
                        {/* Hidden file input — images only */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handlePhotoChange}
                        />
                        <button
                            className="dpCamera_doprof"
                            onClick={handlePhotoClick}
                            title="Change Profile Photo"
                        >
                            <Camera size={16} />
                        </button>
                        {previewImg && (
                            <div className="dpPhotoHint_doprof">
                                Photo selected — save to apply
                            </div>
                        )}
                    </div>

                    <div className="dpSidebarInfo_doprof">
                        <h1>Dr. {profile?.firstName} {profile?.lastName}</h1>
                        <p className="dpSpecialty_doprof">{profile?.specialty}</p>
                        <div className="dpVerifiedBadge_doprof">
                            <Shield size={14} /> Verified Professional
                        </div>
                    </div>

                    <div className="dpNav_doprof">
                        <button 
                            className={`dpNavItem_doprof ${activeTab === 'professional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('professional')}
                        >
                            <Award size={18} /> Professional Details
                        </button>
                        <button 
                            className={`dpNavItem_doprof ${activeTab === 'contact' ? 'active' : ''}`}
                            onClick={() => setActiveTab('contact')}
                        >
                            <Mail size={18} /> Contact Info
                        </button>
                        <button 
                            className={`dpNavItem_doprof ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Shield size={18} /> Credentials & Security
                        </button>
                    </div>
                </div>

                <div className="dpContent_doprof">
                    <div className="dpContentHeader_doprof">
                        <div>
                            <h2>{activeTab === 'professional' ? 'Professional Profile' : activeTab === 'contact' ? 'Contact Details' : 'Account Security'}</h2>
                            <p>Complete your profile to increase visibility among patients.</p>
                        </div>
                        <div className="dpActions_doprof">
                            {!editMode ? (
                                <button className="dpEditBtn_doprof" onClick={() => setEditMode(true)}>
                                    <Edit2 size={16} /> Edit Details
                                </button>
                            ) : (
                                <>
                                    <button className="dpCancelBtn_doprof" onClick={() => { setEditMode(false); setPreviewImg(null); }}>Cancel</button>
                                    <button className="dpSaveBtn_doprof" onClick={handleUpdate} disabled={saving}>
                                        {saving ? <Loader2 size={16} className="dpSpinIcon_doprof" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="dpDetailsGrid_doprof">
                        {activeTab === 'professional' && (
                            <>
                                <div className="dpField_doprof">
                                    <label><User size={14} /> First Name</label>
                                    {editMode ? <input name="firstName" value={formData.firstName} onChange={handleChange} /> : <div className="dpValue_doprof">{profile?.firstName}</div>}
                                </div>
                                <div className="dpField_doprof">
                                    <label><User size={14} /> Last Name</label>
                                    {editMode ? <input name="lastName" value={formData.lastName} onChange={handleChange} /> : <div className="dpValue_doprof">{profile?.lastName}</div>}
                                </div>
                                <div className="dpField_doprof">
                                    <label><Award size={14} /> Medical Specialty</label>
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
                                    ) : <div className="dpValue_doprof">{profile?.specialty}</div>}
                                </div>
                                <div className="dpField_doprof">
                                    <label><Briefcase size={14} /> Medical Licence No.</label>
                                    <div className="dpValue_doprof dpDisabled_doprof">{profile?.drLicence}</div>
                                </div>
                                <div className="dpField_doprof dpWide_doprof">
                                    <label><Info size={14} /> Professional Biography</label>
                                    {editMode ? (
                                        <textarea 
                                            name="bio" 
                                            value={formData.bio || "Senior consultant with over 10 years of experience in clinical practice."} 
                                            onChange={handleChange} 
                                        />
                                    ) : <div className="dpValue_doprof dpBio_doprof">{profile?.bio || "Senior consultant with over 10 years of experience in clinical practice."}</div>}
                                </div>
                            </>
                        )}

                        {activeTab === 'contact' && (
                            <>
                                <div className="dpField_doprof">
                                    <label><Mail size={14} /> Medical Email</label>
                                    <div className="dpValue_doprof dpDisabled_doprof">doctor@medisphere.com</div>
                                </div>
                                <div className="dpField_doprof">
                                    <label><Phone size={14} /> Contact Number</label>
                                    {editMode ? <input name="drContactNo" value={formData.drContactNo} onChange={handleChange} /> : <div className="dpValue_doprof">{profile?.drContactNo}</div>}
                                </div>
                                <div className="dpField_doprof">
                                    <label><MapPin size={14} /> Clinic Address</label>
                                    <div className="dpValue_doprof">123 Medical Plaza, Colombo 07</div>
                                </div>
                                <div className="dpField_doprof">
                                    <label><Globe size={14} /> Personal Website</label>
                                    <div className="dpValue_doprof">www.drsmith.lk</div>
                                </div>
                            </>
                        )}
                        
                        {activeTab === 'settings' && (
                            <div className="dpSecurityInfo_doprof">
                                <div className="dpSecItem_doprof">
                                    <Shield className="dpSecIcon_doprof" />
                                    <div>
                                        <strong>Licence Status</strong>
                                        <p>Your medical licence is verified and valid until 2028.</p>
                                    </div>
                                    <span className="dpActiveBadge_doprof">Active</span>
                                </div>
                                <div className="dpSecItem_doprof clickable_doprof">
                                    <Edit2 className="dpSecIcon_doprof" />
                                    <div>
                                        <strong>Update Account Password</strong>
                                        <p>Enforce strong security policies for your clinical data.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="dpError_doprof"><Info size={16} /> {error}</div>}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile_doprof;
