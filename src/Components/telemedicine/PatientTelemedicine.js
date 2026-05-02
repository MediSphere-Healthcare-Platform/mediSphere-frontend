import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { telemedicineApi, doctorApi } from '../../services/api';
import { Video, Calendar, Clock, Loader2 } from 'lucide-react';
import './PatientTelemedicine.css';

const PatientTelemedicine = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state || {};

    const [doctors, setDoctors] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const getInitialDate = () => {
        if (state.date && state.time) {
            const timeFormatted = state.time.substring(0, 5); 
            return `${state.date}T${timeFormatted}`;
        }
        return '';
    };

    const [selectedDoctor, setSelectedDoctor] = useState(state.doctorId || '');
    const [preferredDate, setPreferredDate] = useState(getInitialDate());
    const [reason, setReason] = useState(state.reason || '');
    const [requesting, setRequesting] = useState(false);
    
    const [showForm, setShowForm] = useState(!!state.doctorId); // Show form if redirecting from Book
    
    const [doctorNameFallback, setDoctorNameFallback] = useState(state.doctorName || '');

    useEffect(() => {
        if (state.doctorId && !state.doctorName) {
            doctorApi.get(`getDoctorById/${state.doctorId}`)
                .then(res => {
                    const data = res.data?.data;
                    if (data && data.firstName) {
                        setDoctorNameFallback(`${data.firstName} ${data.lastName || ''}`.trim());
                    }
                })
                .catch(err => console.error("Error fetching doctor fallback:", err));
        }
    }, [state.doctorId, state.doctorName]);

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchDoctors();
        fetchSessions();
    }, [patientId]);

    const fetchDoctors = async () => {
        try {
            const res = await telemedicineApi.get('doctors');
            setDoctors(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Error fetching doctors:", err);
        }
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await telemedicineApi.get(`sessions/patient/${patientId}`);
            let sessionData = res.data || [];
            
            // Fetch missing doctor names
            sessionData = await Promise.all(sessionData.map(async (session) => {
                if (!session.doctorName && session.doctorId) {
                    try {
                        const doctorRes = await doctorApi.get(`getDoctorById/${session.doctorId}`);
                        const doctorData = doctorRes.data?.data;
                        if (doctorData && doctorData.firstName) {
                            session.doctorName = `${doctorData.firstName} ${doctorData.lastName || ''}`.trim();
                        }
                    } catch (e) {
                        console.error(`Failed to fetch info for doctor ${session.doctorId}:`, e);
                    }
                }
                return session;
            }));
            
            setSessions(sessionData);
        } catch (err) {
            console.error("Error fetching sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestSession = async (e) => {
        e.preventDefault();
        if (!selectedDoctor || !preferredDate) return;

        setRequesting(true);
        try {
            // Ensure seconds are included for Java LocalDateTime parsing
            const preferredAtFormatted = preferredDate.length === 16
                ? preferredDate + ':00'
                : preferredDate;

            console.log("Requesting session:", {
                patientId,
                doctorId: selectedDoctor,
                preferredAt: preferredAtFormatted
            });

            const res = await telemedicineApi.post(`sessions/request?patientUserId=${patientId}`, {
                patientId: patientId,
                doctorId: selectedDoctor,
                preferredAt: preferredAtFormatted,
                reason: reason
            });
            console.log("Session request successful:", res.data);
            alert('Video session requested successfully!');
            setSelectedDoctor('');
            setPreferredDate('');
            setReason('');
            fetchSessions();
            setShowForm(false); // Hide form after success
        } catch (err) {
            console.error("Error requesting session detailed:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message || '';
            alert('Failed to request session. ' + msg);
        } finally {
            setRequesting(false);
        }
    };

    const handleJoinSession = async (sessionId) => {
        try {
            await telemedicineApi.put(`sessions/${sessionId}/start`);
            navigate(`/telemedicine/room/${sessionId}`);
        } catch (err) {
            console.error("Error starting session:", err);
            if (err.response?.status === 400 && err.response?.data?.message?.includes("ACTIVE")) {
                navigate(`/telemedicine/room/${sessionId}`);
            } else {
                alert('Failed to join session.');
            }
        }
    };

    const STATUS_OPTIONS = ['ALL', 'PENDING_APPROVAL', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

    const filteredSessions = sessions
        .filter(s => statusFilter === 'ALL' || s.status === statusFilter)
        .sort((a, b) => {
            const dateA = new Date(a.scheduledAt || a.preferredAt);
            const dateB = new Date(b.scheduledAt || b.preferredAt);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

    const stats = {
        total: doctors.length,
    };

    return (
        <div className="container_tele_patient">
            <div className="hero_img_tele">
                <div className="hero_tele_patient">
                    <div className="hero_tele_overlay"></div>
                    <div className="hero_tele_content">
                        <div className="hero_tele_badge">
                            <Video size={13} /> Virtual Care
                        </div>
                        <h1>Request Video Session</h1>
                        <p>Schedule a new video consultation with our expert medical team.</p>
                    </div>
                </div>
            </div>

            <div className="request_form_container">
                {/* Request Form */}
                <div className="card_tele_patient request_card_centered">
                    <div className="card_tele_section_header">
                        <div className="card_tele_icon blue"><Video size={18} /></div>
                        <div>
                            <h3>Book a Consultation</h3>
                            <p>Enter details below to request a session</p>
                        </div>
                    </div>
                    <form onSubmit={handleRequestSession}>
                        <div className="formGroup_tele">
                            <label>Select Doctor</label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                required
                                disabled={!!state.doctorId}
                            >
                                <option value="">— Choose a Doctor —</option>
                                {state.doctorId && !doctors.some(d => d.doctorId === state.doctorId) && (
                                    <option value={state.doctorId}>
                                        Dr. {doctorNameFallback || 'General Specialist'}
                                    </option>
                                )}
                                {doctors.map(doc => (
                                    <option key={doc.doctorId} value={doc.doctorId}>
                                        Dr. {doc.firstName} {doc.lastName} — {doc.specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="formGroup_tele">
                            <label>Preferred Date &amp; Time</label>
                            <input
                                type="datetime-local"
                                value={preferredDate}
                                onChange={(e) => setPreferredDate(e.target.value)}
                                required
                                disabled={!!state.doctorId && !!state.date}
                            />
                        </div>
                        <div className="formGroup_tele">
                            <label>Reason for Consultation</label>
                            <textarea
                                rows="3"
                                placeholder="Describe your symptoms briefly..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={!!state.reason}
                            ></textarea>
                        </div>
                        <div className="form_actions_tele">
                            <button
                                type="button"
                                className="btn_tele_secondary"
                                onClick={() => navigate(`/telemedicine/sessions/${patientId}`)}
                            >
                                Back to My Sessions
                            </button>
                            <button
                                type="submit"
                                className="btn_tele_primary"
                                disabled={requesting || !selectedDoctor || !preferredDate}
                            >
                                {requesting
                                    ? <><Loader2 size={16} className="tele_spin" /> Submitting...</>
                                    : <><Video size={16} /> Request Video Session</>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PatientTelemedicine;
