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

            await telemedicineApi.post(`sessions/request?patientUserId=${patientId}`, {
                patientId: patientId,
                doctorId: selectedDoctor,
                preferredAt: preferredAtFormatted,
                reason: reason
            });
            alert('Video session requested successfully!');
            setSelectedDoctor('');
            setPreferredDate('');
            setReason('');
            fetchSessions();
        } catch (err) {
            console.error("Error requesting session:", err);
            const msg = err.response?.data?.message || err.response?.data || '';
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
        total: sessions.length,
        scheduled: sessions.filter(s => s.status === 'SCHEDULED').length,
        completed: sessions.filter(s => s.status === 'COMPLETED').length,
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
                        <h1>Telemedicine Consultations</h1>
                        <p>Connect with your doctor from the comfort of your home via secure video.</p>
                    </div>
                    <div className="hero_tele_stats">
                        <div className="hero_stat">
                            <span className="hero_stat_num">{stats.total}</span>
                            <span className="hero_stat_label">Total Sessions</span>
                        </div>
                        <div className="hero_stat_divider"></div>
                        <div className="hero_stat">
                            <span className="hero_stat_num">{stats.scheduled}</span>
                            <span className="hero_stat_label">Scheduled</span>
                        </div>
                        <div className="hero_stat_divider"></div>
                        <div className="hero_stat">
                            <span className="hero_stat_num">{stats.completed}</span>
                            <span className="hero_stat_label">Completed</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid_tele_patient">
                {/* Request Form */}
                <div className="card_tele_patient">
                    <div className="card_tele_section_header">
                        <div className="card_tele_icon blue"><Video size={18} /></div>
                        <div>
                            <h3>Request a Session</h3>
                            <p>Schedule a new video consultation</p>
                        </div>
                    </div>
                    <form onSubmit={handleRequestSession}>
                        <div className="formGroup_tele">
                            <label>Select Doctor</label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                required
                                disabled
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
                                disabled
                            />
                        </div>
                        <div className="formGroup_tele">
                            <label>Reason for Consultation</label>
                            <textarea
                                rows="3"
                                placeholder="Describe your symptoms briefly..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled
                            ></textarea>
                        </div>
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
                    </form>
                </div>

                {/* Sessions Table */}
                <div className="card_tele_patient">
                    <div className="card_tele_section_header">
                        <div className="card_tele_icon purple"><Calendar size={18} /></div>
                        <div style={{ flex: 1 }}>
                            <h3>My Sessions</h3>
                            <p>View and manage your consultations</p>
                        </div>
                        <div className="filter_controls_tele">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="filter_select_tele"
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>
                                        {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                                className="filter_select_tele"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div className="tele_loading_state">
                                <Loader2 size={32} className="tele_spin" />
                                <p>Loading your sessions...</p>
                            </div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="tele_empty_state">
                                <Calendar size={48} />
                                <h4>{sessions.length === 0 ? 'No sessions yet' : 'No matching sessions'}</h4>
                                <p>{sessions.length === 0
                                    ? 'Request your first video consultation above.'
                                    : 'Try adjusting the filter.'}
                                </p>
                            </div>
                        ) : (
                            <table className="table_tele">
                                <thead>
                                    <tr>
                                        <th>Doctor</th>
                                        <th>Date &amp; Time</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSessions.map(session => (
                                        <tr key={session.sessionId}>
                                            <td>
                                                <div className="table_tele_person_cell">
                                                    <div className="table_tele_avatar blue_avatar">
                                                        {(session.doctorName || 'D').charAt(0).toUpperCase()}
                                                    </div>
                                                    {session.doctorName || session.doctorId}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="table_tele_date_cell">
                                                    <Clock size={13} />
                                                    {new Date(session.scheduledAt || session.preferredAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status_badge status_${(session.status || '').toLowerCase()}`}>
                                                    {session.status?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                {(session.status === 'SCHEDULED' || session.status === 'ACTIVE') && (
                                                    <button
                                                        className="btn_join_tele"
                                                        onClick={() => handleJoinSession(session.sessionId)}
                                                    >
                                                        <Video size={14} /> Join Room
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientTelemedicine;
