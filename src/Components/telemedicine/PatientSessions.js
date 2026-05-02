import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineApi, doctorApi } from '../../services/api';
import { Video, Calendar, Clock, Loader2, Plus } from 'lucide-react';
import './PatientTelemedicine.css';

const PatientSessions = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchSessions();
    }, [patientId]);

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
                            session.doctorName = `Dr. ${doctorData.firstName} ${doctorData.lastName || ''}`.trim();
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
                        <h1>My Video Consultations</h1>
                        <p>Manage your telemedicine sessions and join active video calls.</p>
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

            <div className="sessions_list_container">
                <div className="card_tele_patient full_width_card">
                    <div className="card_tele_section_header">
                        <div className="card_tele_icon purple"><Calendar size={18} /></div>
                        <div style={{ flex: 1 }}>
                            <h3>Telemedicine History</h3>
                            <p>View and manage your upcoming and past consultations</p>
                        </div>
                        <div className="tele_header_actions"></div>
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
                                    ? 'Request your first video consultation to get started.'
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

export default PatientSessions;
