import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doctorApi } from '../../services/api';
import { 
    Calendar, Clock, User, Filter, Search, 
    CheckCircle, XCircle, Info, MoreVertical, Video, AlertCircle
} from 'lucide-react';
import './DoctorAppointments_doappt.css';

const DoctorAppointments_doappt = ({ doctorId: propDoctorId = "UD102616" }) => {
    const { doctorId: urlDoctorId } = useParams();
    
    // ID Resolution Logic
    const getActiveId = () => {
        if (urlDoctorId) {
            sessionStorage.setItem('currentDoctorId', urlDoctorId);
            return urlDoctorId;
        }
        return sessionStorage.getItem('currentDoctorId') || propDoctorId;
    };

    const currentDoctorId = getActiveId();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchAppointments();
    }, [currentDoctorId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await doctorApi.get(`/appointments/allAppointmentsByDoctorId/${currentDoctorId}`);
            setAppointments(response.data.data || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        try {
            await doctorApi.put('/appointments/appointmentStatusChange', {
                appointmentId,
                status: newStatus
            });
            fetchAppointments();
            alert(`Appointment marked as ${newStatus}`);
        } catch (err) {
            console.error('Status update failed:', err);
        }
    };

    const handleCreateTelemedicineSession = async (appointment) => {
        try {
            const response = await doctorApi.post(`/telemedicine/sessions/from-appointment/${appointment.appointmentId}`);
            alert('Telemedicine session created successfully!');
            
            if (response.data?.data?.roomUrl) {
                window.open(response.data.data.roomUrl, '_blank');
            }
            fetchAppointments();
        } catch (err) {
            console.error('Failed to create session:', err);
            alert('Creation failed. Ensure session doesn\'t already exist.');
        }
    };

    const filteredAppointments = appointments.filter(app => 
        filter === 'All' || app.status === filter
    );

    return (
        <div className="daWrapper_doappt">
            <div className="daHeader_doappt">
                <h1>Clinical <span>Appointments</span></h1>
                <p>Manage your patient consultations, review medical cases, and initiate telemedicine sessions.</p>
            </div>

            <div className="daControls_doappt">
                <div className="daTabs_doappt">
                    {['All', 'Pending', 'Accepted', 'Completed', 'Rejected'].map(status => (
                        <button 
                            key={status}
                            className={`daTab_doappt ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="daLoading_doappt">
                    <div className="daSpinner_doappt"></div>
                    <p>Fetching clinical records...</p>
                </div>
            ) : (
                <div className="daGrid_doappt">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((app) => (
                            <div key={app.appointmentId} className="daCard_doappt">
                                <div className="daCardHeader_doappt">
                                    <div className="daPatientInfo_doappt">
                                        <div className="daPatientIcon_doappt">{app.patientName?.charAt(0) || 'P'}</div>
                                        <div>
                                            <h3>{app.patientName}</h3>
                                            <p className="daAppId_doappt">#{app.appointmentId}</p>
                                        </div>
                                    </div>
                                    <span className={`daStatus_doappt ${app.status?.toLowerCase()}_doappt`}>{app.status}</span>
                                </div>
                                <div className="daCardBody_doappt">
                                    <div className="daDetailItem_doappt"><Calendar size={16} /> {app.appointmentDate}</div>
                                    <div className="daDetailItem_doappt"><Clock size={16} /> {app.appointmentTime}</div>
                                    <div className="daReason_doappt">
                                        <strong>Reason:</strong> {app.reason || 'General check-up'}
                                    </div>
                                </div>
                                <div className="daCardActions_doappt">
                                    {app.status === 'Pending' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate(app.appointmentId, 'Accepted')} className="daAcceptBtn_doappt">Accept</button>
                                            <button onClick={() => handleStatusUpdate(app.appointmentId, 'Rejected')} className="daRejectBtn_doappt">Reject</button>
                                        </>
                                    )}
                                    {app.status === 'Accepted' && (
                                        <button 
                                            onClick={() => handleCreateTelemedicineSession(app)} 
                                            className="daTeleBtn_doappt"
                                        >
                                            <Video size={16} /> Create Session
                                        </button>
                                    )}
                                    <button className="daViewBtn_doappt">View Details</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="daNoData_doappt">
                            <AlertCircle size={40} />
                            <p>No appointments found for this category.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorAppointments_doappt;
