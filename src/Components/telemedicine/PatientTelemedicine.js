import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineApi } from '../../services/api';
import { Video, Calendar, Clock, User, FileText, CheckCircle } from 'lucide-react';
import './PatientTelemedicine.css';

const PatientTelemedicine = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    
    const [doctors, setDoctors] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [reason, setReason] = useState('');
    const [requesting, setRequesting] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first

    useEffect(() => {
        fetchDoctors();
        fetchSessions();
    }, [patientId]);

    const fetchDoctors = async () => {
        try {
            const res = await telemedicineApi.get('/doctors');
            // Assuming response is an array or { data: [...] }
            setDoctors(res.data?.data || res.data || []);
        } catch (err) {
            console.error("Error fetching doctors:", err);
        }
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await telemedicineApi.get(`/sessions/patient/${patientId}`);
            setSessions(res.data || []);
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
            await telemedicineApi.post('/sessions/request', {
                patientId: patientId,
                doctorId: selectedDoctor,
                preferredAt: preferredDate,
                reason: reason
            });
            alert('Video session requested successfully!');
            // Reset form
            setSelectedDoctor('');
            setPreferredDate('');
            setReason('');
            fetchSessions();
        } catch (err) {
            console.error("Error requesting session:", err);
            alert('Failed to request session. ' + (err.response?.data?.message || ''));
        } finally {
            setRequesting(false);
        }
    };

    const handleJoinSession = async (sessionId) => {
        try {
            // Mark session as active
            await telemedicineApi.put(`/sessions/${sessionId}/start`);
            // Navigate to room
            navigate(`/telemedicine/room/${sessionId}`);
        } catch (err) {
            console.error("Error starting session:", err);
            // If already active, just navigate
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

    return (
        <div className="container_tele_patient">
            <div className="hero_tele_patient">
                <h1>Telemedicine Consultations</h1>
                <p>Connect with your doctor online from the comfort of your home.</p>
            </div>

            <div className="grid_tele_patient">
                <div className="card_tele_patient">
                    <h3><Video size={20} /> Request a Session</h3>
                    <form onSubmit={handleRequestSession}>
                        <div className="formGroup_tele">
                            <label>Select Doctor</label>
                            <select 
                                value={selectedDoctor} 
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                required
                            >
                                <option value="">-- Choose a Doctor --</option>
                                {doctors.map(doc => (
                                    <option key={doc.doctorId} value={doc.doctorId}>
                                        Dr. {doc.firstName} {doc.lastName} - {doc.specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="formGroup_tele">
                            <label>Preferred Date & Time</label>
                            <input 
                                type="datetime-local" 
                                value={preferredDate}
                                onChange={(e) => setPreferredDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="formGroup_tele">
                            <label>Reason for Consultation</label>
                            <textarea 
                                rows="3" 
                                placeholder="Describe your symptoms briefly..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            ></textarea>
                        </div>
                        <button type="submit" className="btn_tele_primary" disabled={requesting || !selectedDoctor || !preferredDate}>
                            {requesting ? 'Submitting...' : 'Request Video Session'}
                        </button>
                    </form>
                </div>

                <div className="card_tele_patient" style={{ overflowX: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                        <h3 style={{ margin: 0 }}><Calendar size={20} /> My Sessions</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="filter_select_tele"
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}</option>
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
                    {loading ? (
                        <p>Loading sessions...</p>
                    ) : filteredSessions.length === 0 ? (
                        <p>{sessions.length === 0 ? 'You have no telemedicine sessions.' : 'No sessions match the selected filter.'}</p>
                    ) : (
                        <table className="table_tele">
                            <thead>
                                <tr>
                                    <th>Doctor</th>
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSessions.map(session => (
                                    <tr key={session.sessionId}>
                                        <td>{session.doctorName || session.doctorId}</td>
                                        <td>
                                            {new Date(session.scheduledAt || session.preferredAt).toLocaleString()}
                                        </td>
                                        <td><span className={`status_badge status_${(session.status || '').toLowerCase()}`}>{session.status}</span></td>
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
    );
};

export default PatientTelemedicine;
