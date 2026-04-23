import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineApi } from '../../services/api';
import { Video, Calendar, Check, X, Users, AlertCircle, FileText } from 'lucide-react';
import './DoctorTelemedicine.css';

const DoctorTelemedicine = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    
    const [pendingSessions, setPendingSessions] = useState([]);
    const [allSessions, setAllSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters for All Sessions
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('desc');
    // Search for Pending Requests
    const [pendingSearch, setPendingSearch] = useState('');

    useEffect(() => {
        fetchSessions();
    }, [doctorId]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes] = await Promise.all([
                telemedicineApi.get(`/sessions/doctor/${doctorId}/pending`),
                telemedicineApi.get(`/sessions/doctor/${doctorId}`)
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
            await telemedicineApi.put(`/sessions/${sessionId}/accept`);
            fetchSessions();
        } catch (err) {
            console.error("Error accepting session:", err);
            alert("Failed to accept session.");
        }
    };

    const handleReject = async (sessionId) => {
        try {
            await telemedicineApi.put(`/sessions/${sessionId}/reject`);
            fetchSessions();
        } catch (err) {
            console.error("Error rejecting session:", err);
            alert("Failed to reject session.");
        }
    };

    const handleStartSession = async (sessionId) => {
        try {
            await telemedicineApi.put(`/sessions/${sessionId}/start`);
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
        return <span className={`status_badge status_${normalized}`}>{status}</span>;
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

    return (
        <div className="container_tele_doctor">
            <div className="hero_tele_doctor">
                <h1>Telemedicine Dashboard</h1>
                <p>Manage your virtual consultations and patient video sessions.</p>
            </div>

            <div className="card_tele_doctor">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0 }}><AlertCircle size={20} /> Pending Requests</h3>
                    <input
                        type="text"
                        placeholder="Search by patient..."
                        value={pendingSearch}
                        onChange={e => setPendingSearch(e.target.value)}
                        className="filter_select_tele"
                        style={{ padding: '7px 12px', minWidth: '180px' }}
                    />
                </div>
                {loading ? (
                    <p>Loading pending requests...</p>
                ) : filteredPending.length === 0 ? (
                    <p>{pendingSessions.length === 0 ? 'No pending session requests.' : 'No results match your search.'}</p>
                ) : (
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
                                    <td>{session.patientName || session.patientId}</td>
                                    <td>{new Date(session.preferredAt).toLocaleString()}</td>
                                    <td>{session.reason || 'None provided'}</td>
                                    <td>
                                        <button className="btn_tele_action btn_tele_accept" onClick={() => handleAccept(session.sessionId)}>
                                            <Check size={14} /> Accept
                                        </button>
                                        <button className="btn_tele_action btn_tele_reject" onClick={() => handleReject(session.sessionId)}>
                                            <X size={14} /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="card_tele_doctor">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0 }}><Calendar size={20} /> All Sessions</h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter_select_tele">
                            {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
                            ))}
                        </select>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="filter_select_tele">
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                </div>
                {loading ? (
                    <p>Loading sessions...</p>
                ) : filteredAllSessions.length === 0 ? (
                    <p>{allSessions.length === 0 ? 'No sessions found.' : 'No sessions match the selected filter.'}</p>
                ) : (
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
                                    <td>{session.patientName || session.patientId}</td>
                                    <td>
                                        {new Date(session.scheduledAt || session.preferredAt).toLocaleString()}
                                    </td>
                                    <td>{getStatusBadge(session.status)}</td>
                                    <td>
                                        {(session.status === 'SCHEDULED' || session.status === 'ACTIVE') && (
                                            <button 
                                                className="btn_tele_action btn_tele_start"
                                                onClick={() => handleStartSession(session.sessionId)}
                                            >
                                                <Video size={14} /> Start Session
                                            </button>
                                        )}
                                        {session.status === 'COMPLETED' && (
                                            <button 
                                                className="btn_tele_action btn_tele_accept"
                                                onClick={() => navigate(`/doctor/prescribe/${session.sessionId}`)}
                                            >
                                                <FileText size={14} /> Prescribe
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
    );
};

export default DoctorTelemedicine;
