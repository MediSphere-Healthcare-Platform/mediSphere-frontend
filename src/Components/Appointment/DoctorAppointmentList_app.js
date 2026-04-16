import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Video, CheckCircle, XCircle, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DoctorAppointmentList_app.css';

const DoctorAppointmentList_app = ({ doctorId }) => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, [doctorId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/doctor/api/v1/appointments/allAppointmentsByDoctorId/${doctorId}`);
            setAppointments(response.data || []);
        } catch (err) {
            console.error("Failed to fetch doctor appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (refId, newStatus) => {
        try {
            const payload = {
                appointmentReferenceId: refId,
                status: newStatus
            };
            await axios.put('http://localhost:8080/doctor/api/v1/appointments/appointmentStatusChange', payload);
            alert(`Appointment ${newStatus.toLowerCase()} successfully.`);
            fetchAppointments();
        } catch (err) {
            console.error("Status change error:", err);
            alert("Failed to update status.");
        }
    };

    const handleConductSession = (refId) => {
        // Redirect to a new page as requested
        navigate(`/doctor/session/${refId}`);
    };

    if (loading && appointments.length === 0) return <div className="loading_app">Accessing your clinical records...</div>;

    return (
        <div className="docWrapper_app">
            <div className="docHeader_app">
                <h2>Clinical Scheduler</h2>
            </div>

            <div className="docGrid_app">
                {appointments.length > 0 ? (
                    appointments.map(appt => (
                        <div key={appt.appointmentReferenceId} className="docApptCard_app">
                            <div className="patientMeta_app">
                                <div className="patientInfo_app">
                                    <span className="patientId_app">REF: {appt.appointmentReferenceId}</span>
                                    <h3>{appt.patientName || "Jane Doe"}</h3>
                                </div>
                                <div className={`statusIndicator_app ${appt.status === 'APPROVED' ? 'waiting_app' : 'completed_app'}`}>
                                    {appt.status}
                                </div>
                            </div>

                            <div className="apptTimeBox_app">
                                <div className="timeItem_app"><Calendar size={18} /> {appt.appointmentDate}</div>
                                <div className="timeItem_app"><Clock size={18} /> {appt.appointmentTime}</div>
                            </div>

                            <div className="reasonBox_app">
                                <p><strong><MessageSquare size={14} /> Reason:</strong> {appt.reason || "General Consultation"}</p>
                            </div>

                            {appt.status === 'PENDING' && (
                                <div className="docActions_app">
                                    <button 
                                        className="btnApprove_app" 
                                        onClick={() => handleStatusChange(appt.appointmentReferenceId, 'APPROVED')}
                                    >
                                        <CheckCircle size={18} /> Approve
                                    </button>
                                    <button 
                                        className="btnReject_app" 
                                        onClick={() => handleStatusChange(appt.appointmentReferenceId, 'REJECTED')}
                                    >
                                        <XCircle size={18} /> Reject
                                    </button>
                                </div>
                            )}

                            {appt.status === 'APPROVED' && (
                                <button className="btnConduct_app" onClick={() => handleConductSession(appt.appointmentReferenceId)}>
                                    <Video size={18} /> Conduct Online Session
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="noResults_app">
                        <h3>No upcoming appointments found.</h3>
                        <p>Relax! You have a clear schedule for now.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorAppointmentList_app;
