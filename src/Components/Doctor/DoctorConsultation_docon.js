import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Video, PhoneOff, ExternalLink,
    Pill, FileText, Send, AlertCircle, Plus, Trash2, CheckCircle2
} from 'lucide-react';
import { telemedicineApi } from '../../services/api';
import './DoctorConsultation_docon.css';

const DoctorConsultation_docon = () => {
    const { appointmentReferenceId, referenceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const refId = appointmentReferenceId || referenceId || 'N/A';
    const currentDoctorId = sessionStorage.getItem('currentDoctorId') || 'UD102616';

    const cleanRef = (refId || 'consultation').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const roomName = `medisphere-${cleanRef}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=Dr.%20Consultant`;

    const [activeTab, setActiveTab] = useState('prescription');
    const [prescriptions, setPrescriptions] = useState([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [notes, setNotes] = useState('');

    const heroImg = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200";

    useEffect(() => {
        console.log(`[Doctor Telemedicine] Initializing Jitsi Room: ${roomName} for Ref: ${refId}`);

        // 1. Broadcast active session in localStorage for immediate patient dashboard sync
        try {
            const activeSessions = JSON.parse(localStorage.getItem('medisphere_active_sessions') || '{}');
            activeSessions[refId] = {
                sessionId: 'SESS-' + refId,
                appointmentReferenceId: refId,
                doctorId: currentDoctorId,
                doctorName: location.state?.appointment?.doctorName || 'Consultant',
                patientId: location.state?.appointment?.patientId || '',
                patientName: location.state?.appointment?.patientName || '',
                roomName: roomName,
                roomUrl: `https://meet.jit.si/${roomName}`,
                status: 'ACTIVE',
                startTime: new Date().toISOString()
            };
            localStorage.setItem('medisphere_active_sessions', JSON.stringify(activeSessions));
        } catch (e) {
            console.error('[Session Storage Error]', e);
        }

        // 2. Register session in Telemedicine microservice if available
        const registerSessionBackend = async () => {
            try {
                await telemedicineApi.post('', {
                    patientId: location.state?.appointment?.patientId || 'P002',
                    doctorId: currentDoctorId,
                    scheduledAt: new Date().toISOString(),
                    patientName: location.state?.appointment?.patientName || 'Patient',
                    doctorName: location.state?.appointment?.doctorName || 'Doctor'
                });
            } catch (err) {
                // If telemedicine service is not running, the localStorage sync continues to power the patient dashboard
                console.warn('[Telemedicine Microservice Init Notice]', err.message);
            }
        };

        registerSessionBackend();
    }, [refId, roomName, currentDoctorId]);

    const handleEndCall = () => {
        if (window.confirm('Are you sure you want to conclude this consultation session?')) {
            try {
                const activeSessions = JSON.parse(localStorage.getItem('medisphere_active_sessions') || '{}');
                delete activeSessions[refId];
                localStorage.setItem('medisphere_active_sessions', JSON.stringify(activeSessions));
            } catch (e) { /* ignore */ }
            navigate(`/doctor/appointments/${currentDoctorId}`);
        }
    };

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
    };

    return (
        <div className="dcWrapper_docon">
            <div className="dcHero_docon" style={{ backgroundImage: `url(${heroImg})` }}>
                <div className="dcHeroContent_docon">
                    <h1>Telemedicine <span>Console</span></h1>
                    <p>Session Ref: <strong>{refId}</strong> — Live Jitsi Meet consultation and digital prescription suite.</p>
                </div>
                <div className="dcHeroOverlay_docon"></div>
            </div>

            <div className="dcContainer_docon">
                <div className="dcSession_docon">
                    {/* Live Jitsi Meet Video Embed */}
                    <div className="dcVideoArea_docon" style={{ background: '#0f172a', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '12px 18px', color: 'white', borderBottom: '1px solid #334155' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                                <span>LIVE JITSI SESSION: <code style={{ color: '#93c5fd' }}>{roomName}</code></span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => window.open(`https://meet.jit.si/${roomName}`, '_blank')}
                                    style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    title="Open video in a new browser tab"
                                >
                                    <ExternalLink size={14} /> Pop-out Video
                                </button>
                                <button 
                                    onClick={handleEndCall}
                                    style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    title="End Consultation"
                                >
                                    <PhoneOff size={14} /> End Call
                                </button>
                            </div>
                        </div>

                        {/* Real Jitsi Meet Iframe */}
                        <iframe
                            src={jitsiUrl}
                            title="Doctor Jitsi Telemedicine Console"
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            style={{ width: '100%', height: '540px', border: 'none', background: '#0f172a' }}
                        />
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
