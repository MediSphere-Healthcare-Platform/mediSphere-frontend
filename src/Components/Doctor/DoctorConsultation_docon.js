import React, { useState } from 'react';
import { 
    Video, Mic, MicOff, VideoOff, PhoneOff, 
    Pill, FileText, Send, User, ChevronRight, AlertCircle, Plus, Trash2
} from 'lucide-react';
import './DoctorConsultation_docon.css';

const DoctorConsultation_docon = () => {
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [activeTab, setActiveTab] = useState('prescription');
    const [prescriptions, setPrescriptions] = useState([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [notes, setNotes] = useState('');

    const heroImg = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200";

    const addPrescriptionRow = () => {
        setPrescriptions([...prescriptions, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removePrescriptionRow = (index) => {
        const newRows = [...prescriptions];
        newRows.splice(index, 1);
        setPrescriptions(newRows);
    };

    const handlePrescriptionChange = (index, field, value) => {
        const newRows = [...prescriptions];
        newRows[index][field] = value;
        setPrescriptions(newRows);
    };

    const handleSubmitPrescription = () => {
        alert('Digital Prescription issued successfully to patient!');
        // Mock API call would go here
    };

    return (
        <div className="dcWrapper_docon">
            <div className="dcHero_docon" style={{ backgroundImage: `url(${heroImg})` }}>
                <div className="dcHeroContent_docon">
                    <h1>Telemedicine <span>Console</span></h1>
                    <p>Conduct high-definition video consultations and issue secure digital prescriptions in real-time.</p>
                </div>
                <div className="dcHeroOverlay_docon"></div>
            </div>

            <div className="dcContainer_docon">
                <div className="dcSession_docon">
                    <div className="dcVideoArea_docon">
                        <div className="dcRemoteVideo_docon">
                            <div className="dcVideoPlaceholder_docon">
                                <User size={80} />
                                <p>Waiting for Patient to Connect...</p>
                            </div>
                            <div className="dcLocalVideo_docon">
                                {isVideoOn ? (
                                    <div className="dcLiveCam_docon">Doctor Preview</div>
                                ) : (
                                    <div className="dcCamOff_docon"><VideoOff size={24} /></div>
                                )}
                            </div>
                        </div>
                        <div className="dcVideoControls_docon">
                            <button onClick={() => setIsMicOn(!isMicOn)} className={isMicOn ? 'active' : 'inactive'}>
                                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button onClick={() => setIsVideoOn(!isVideoOn)} className={isVideoOn ? 'active' : 'inactive'}>
                                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>
                            <button className="dcEndCall_docon"><PhoneOff size={20} /></button>
                        </div>
                    </div>

                    <div className="dcInterface_docon">
                        <div className="dcTabs_docon">
                            <button 
                                className={activeTab === 'prescription' ? 'active' : ''} 
                                onClick={() => setActiveTab('prescription')}
                            >
                                <Pill size={18} /> digital Prescription
                            </button>
                            <button 
                                className={activeTab === 'notes' ? 'active' : ''} 
                                onClick={() => setActiveTab('notes')}
                            >
                                <FileText size={18} /> Clinical Notes
                            </button>
                        </div>

                        <div className="dcTabContent_docon">
                            {activeTab === 'prescription' ? (
                                <div className="dcPrescription_docon">
                                    <h3>Issue Prescription</h3>
                                    <div className="dcPresTable_docon">
                                        <div className="dcPresHeader_docon">
                                            <span>Medicine Name</span>
                                            <span>Dosage</span>
                                            <span>Frequency</span>
                                            <span>Duration</span>
                                            <span></span>
                                        </div>
                                        {prescriptions.map((row, idx) => (
                                            <div key={idx} className="dcPresRow_docon">
                                                <input placeholder="e.g. Amoxicillin" value={row.name} onChange={(e) => handlePrescriptionChange(idx, 'name', e.target.value)} />
                                                <input placeholder="500mg" value={row.dosage} onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)} />
                                                <input placeholder="3x Daily" value={row.frequency} onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)} />
                                                <input placeholder="7 Days" value={row.duration} onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)} />
                                                <button onClick={() => removePrescriptionRow(idx)} disabled={prescriptions.length === 1}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="dcAddRow_docon" onClick={addPrescriptionRow}>
                                        <Plus size={16} /> Add Medication
                                    </button>
                                    
                                    <div className="dcPresFooter_docon">
                                        <div className="dcWarning_docon">
                                            <AlertCircle size={14} />
                                            <span>Prescription will be digitally signed by Dr. Sarah Smith</span>
                                        </div>
                                        <button className="dcSubmitPres_docon" onClick={handleSubmitPrescription}>
                                            <Send size={18} /> Issue & Finalize
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="dcNotes_docon">
                                    <h3>Patient Consultation Notes</h3>
                                    <textarea 
                                        placeholder="Record clinical findings, diagnosis, and patient advice here..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                    <button className="dcSaveNotes_docon">Save Private Notes</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorConsultation_docon;
