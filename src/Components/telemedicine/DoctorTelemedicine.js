import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineApi } from '../../services/api';
import { Video, Calendar, Check, X, AlertCircle, FileText, Loader2, Clock } from 'lucide-react';
import './DoctorTelemedicine.css';

const DoctorTelemedicine = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [pendingSessions, setPendingSessions] = useState([]);
    const [allSessions, setAllSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('desc');
    const [pendingSearch, setPendingSearch] = useState('');

    useEffect(() => {
        fetchSessions();
    }, [doctorId]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes] = await Promise.all([
                telemedicineApi.get(`sessions/doctor/${doctorId}/pending`),
                telemedicineApi.get(`sessions/doctor/${doctorId}`)
            ]);
            setPendingSessions(pendingRes.data || []);
            setAllSessions(allRes.data || []);
        } catch (err) {
            console.error("Error fetching sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (sessionId) => {
        try {
            await telemedicineApi.put(`sessions/${sessionId}/accept`);
            fetchSessions();
        } catch (err) {
            console.error("Error accepting session:", err);
            alert("Failed to accept session.");
        }
    };

    const handleReject = async (sessionId) => {
        try {
            await telemedicineApi.put(`sessions/${sessionId}/reject`);
            fetchSessions();
        } catch (err) {
            console.error("Error rejecting session:", err);
            alert("Failed to reject session.");
        }
    };

    const handleStartSession = async (sessionId) => {
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

    const getStatusBadge = (status) => {
        const normalized = (status || '').toLowerCase();
        return (
            <span className={`status_badge_doc status_doc_${normalized}`}>
                {status?.replace(/_/g, ' ')}
            </span>
        );
    };

    const STATUS_OPTIONS = ['ALL', 'PENDING_APPROVAL', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

    const filteredAllSessions = allSessions
        .filter(s => statusFilter === 'ALL' || s.status === statusFilter)
        .sort((a, b) => {
            const da = new Date(a.scheduledAt || a.preferredAt);
            const db = new Date(b.scheduledAt || b.preferredAt);
            return sortOrder === 'desc' ? db - da : da - db;
        });

    const filteredPending = pendingSessions.filter(s =>
        !pendingSearch.trim() ||
        (s.patientName || s.patientId || '').toLowerCase().includes(pendingSearch.toLowerCase())
    );

    const stats = {
        pending: pendingSessions.length,
        scheduled: allSessions.filter(s => s.status === 'SCHEDULED').length,
        active: allSessions.filter(s => s.status === 'ACTIVE').length,
        completed: allSessions.filter(s => s.status === 'COMPLETED').length,
    };

    return (
        <div className="container_tele_doctor">
            {/* Hero */}
            <div className="hero_tele_doctor">
                <div className="hero_tele_doctor_content">
                    <div className="hero_tele_doctor_badge">
                        <Video size={13} /> Telemedicine Portal
                    </div>
                    <h1>Virtual Consultations</h1>
                    <p>Manage online sessions, approve requests, and issue prescriptions post-consultation.</p>
                </div>
                <div className="hero_tele_doctor_stats">
                    <div className="hero_stat_doctor">
                        <span className="hero_stat_doctor_num stat_num_amber">{stats.pending}</span>
                        <span className="hero_stat_doctor_label">Pending</span>
                    </div>
                    <div className="hero_stat_doctor_divider"></div>
                    <div className="hero_stat_doctor">
                        <span className="hero_stat_doctor_num stat_num_blue">{stats.scheduled}</span>
                        <span className="hero_stat_doctor_label">Scheduled</span>
                    </div>
                    <div className="hero_stat_doctor_divider"></div>
                    <div className="hero_stat_doctor">
                        <span className="hero_stat_doctor_num stat_num_green">{stats.active}</span>
                        <span className="hero_stat_doctor_label">Active</span>
                    </div>
                    <div className="hero_stat_doctor_divider"></div>
                    <div className="hero_stat_doctor">
                        <span className="hero_stat_doctor_num stat_num_gray">{stats.completed}</span>
                        <span className="hero_stat_doctor_label">Completed</span>
                    </div>
                </div>
            </div>

            {/* Pending Requests */}
            <div className="card_tele_doctor">
                <div className="card_tele_doctor_header">
                    <div className="card_header_icon_doc pending_icon_doc">
                        <AlertCircle size={18} />
                    </div>
                    <div className="card_header_text_doc">
                        <h3>Pending Requests</h3>
                        <p>Review and respond to patient session requests</p>
                    </div>
                    {stats.pending > 0 && (
                        <span className="pending_count_badge_doc">{stats.pending} awaiting</span>
                    )}
                    <input
                        type="text"
                        placeholder="Search patient..."
                        value={pendingSearch}
                        onChange={e => setPendingSearch(e.target.value)}
                        className="filter_select_tele_doc search_input_doc"
                    />
                </div>

                {loading ? (
                    <div className="tele_doc_loading">
                        <Loader2 size={32} className="doc_spin" />
                        <p>Loading requests...</p>
                    </div>
                ) : filteredPending.length === 0 ? (
                    <div className="tele_doc_empty">
                        <AlertCircle size={44} />
                        <h4>{pendingSessions.length === 0 ? 'All caught up!' : 'No results found'}</h4>
                        <p>{pendingSessions.length === 0 ? 'No pending session requests right now.' : 'Try a different search term.'}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table_tele_doctor">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Preferred Time</th>
                                    <th>Reason</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPending.map(session => (
                                    <tr key={session.sessionId}>
                                        <td>
                                            <div className="table_person_cell_doc">
                                                <div className="table_avatar_doc">
                                                    {(session.patientName || 'P').charAt(0).toUpperCase()}
                                                </div>
                                                <span>{session.patientName || session.patientId}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table_date_cell_doc">
                                                <Clock size={13} />
                                                {new Date(session.preferredAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="reason_cell_doc">
                                            {session.reason || <span className="no_reason_doc">None provided</span>}
                                        </td>
                                        <td>
                                            <div className="action_btn_group_doc">
                                                <button className="btn_tele_doc btn_tele_accept_doc" onClick={() => handleAccept(session.sessionId)}>
                                                    <Check size={14} /> Accept
                                                </button>
                                                <button className="btn_tele_doc btn_tele_reject_doc" onClick={() => handleReject(session.sessionId)}>
                                                    <X size={14} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* All Sessions */}
            <div className="card_tele_doctor">
                <div className="card_tele_doctor_header">
                    <div className="card_header_icon_doc sessions_icon_doc">
                        <Calendar size={18} />
                    </div>
                    <div className="card_header_text_doc">
                        <h3>All Sessions</h3>
                        <p>Browse and manage your complete session history</p>
                    </div>
                    <div className="filter_controls_tele_doc">
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter_select_tele_doc">
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="filter_select_tele_doc">
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="tele_doc_loading">
                        <Loader2 size={32} className="doc_spin" />
                        <p>Loading sessions...</p>
                    </div>
                ) : filteredAllSessions.length === 0 ? (
                    <div className="tele_doc_empty">
                        <Calendar size={44} />
                        <h4>{allSessions.length === 0 ? 'No sessions yet' : 'No matching sessions'}</h4>
                        <p>{allSessions.length === 0 ? 'Sessions will appear once requests are approved.' : 'Try a different filter.'}</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table_tele_doctor">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Scheduled Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAllSessions.map(session => (
                                    <tr key={session.sessionId}>
                                        <td>
                                            <div className="table_person_cell_doc">
                                                <div className="table_avatar_doc">
                                                    {(session.patientName || 'P').charAt(0).toUpperCase()}
                                                </div>
                                                <span>{session.patientName || session.patientId}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="table_date_cell_doc">
                                                <Clock size={13} />
                                                {new Date(session.scheduledAt || session.preferredAt).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(session.status)}</td>
                                        <td>
                                            <div className="action_btn_group_doc">
                                                {(session.status === 'SCHEDULED' || session.status === 'ACTIVE') && (
                                                    <button
                                                        className="btn_tele_doc btn_tele_start_doc"
                                                        onClick={() => handleStartSession(session.sessionId)}
                                                    >
                                                        <Video size={14} /> Start Session
                                                    </button>
                                                )}
                                                {session.status === 'COMPLETED' && (
                                                    <button
                                                        className="btn_tele_doc btn_tele_prescribe_doc"
                                                        onClick={() => navigate(`/doctor/prescribe/${session.sessionId}`)}
                                                    >
                                                        <FileText size={14} /> Prescribe
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorTelemedicine;
