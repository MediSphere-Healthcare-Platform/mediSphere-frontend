import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Activity, ClipboardList, CheckCircle2, XCircle, Video } from 'lucide-react';
import api, { doctorApi } from '../../services/api';
import './PatientHistory_pahistory.css';

const PatientHistory_pahistory = ({ patientId: propPatientId = "P002" }) => {
    const { patientId: urlPatientId } = useParams();
    const patientId = urlPatientId || propPatientId;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(`[History] Fetching for Patient ID: ${patientId}`);
        fetchHistory();
    }, [patientId]);

    const fetchHistory = async () => {
        try {
            const response = await api.get(`appointments/allAppointmentsByPatientId/${patientId}`);
            const resData = response.data?.data !== undefined ? response.data.data : response.data;
            const appointmentData = Array.isArray(resData) ? resData : (resData?.patientAppointments || []);
            
            const appointmentsWithDoctors = await Promise.all(appointmentData.map(async (app) => {
                if (!app.doctorName && app.doctorId) {
                    try {
                        const doctorRes = await doctorApi.get(`getDoctorById/${app.doctorId}`);
                        const doctorData = doctorRes.data?.data;
                        if (doctorData && doctorData.firstName) {
                            app.doctorName = `${doctorData.firstName} ${doctorData.lastName || ''}`.trim();
                        }
                    } catch (e) {
                        console.error(`Failed to fetch info for doctor ${app.doctorId}:`, e);
                    }
                }
                return app;
            }));

            setAppointments(appointmentsWithDoctors);
        } catch (err) {
            console.error('[History] Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="statusIcon_pahistory success_pahistory" />;
            case 'Cancelled': return <XCircle className="statusIcon_pahistory error_pahistory" />;
            default: return <Clock className="statusIcon_pahistory pending_pahistory" />;
        }
    };

    return (
        <div className="container_pahistory">
            {/* Hero Section */}
            <div className="hero_pahistory">
                <div className="heroContent_pahistory">
                    <h1>Your Medical <span>Journey</span></h1>
                    <p>Track your health progress, view past treatments, and access your consultation timeline.</p>
                </div>
                <div className="heroOverlay_pahistory"></div>
            </div>

            {loading ? (
                <div className="loading_pahistory">Fetching history...</div>
            ) : (
                <div className="timeline_pahistory">
                    {appointments.length > 0 ? (
                        appointments.map((app, index) => (
                            <div key={index} className="event_pahistory">
                                <div className="eventMarker_pahistory">
                                    <Activity size={20} />
                                </div>
                                <div className="eventContent_pahistory">
                                    <div className="eventHeader_pahistory">
                                        <div>
                                            <h3>Dr. {app.doctorName || 'General Specialist'}</h3>
                                            <p className="refId_pahistory" style={{ fontSize: '12px', color: '#64748b' }}>Ref ID: {app.appointmentReferenceId || app.appointmentId || 'N/A'}</p>
                                        </div>
                                        <span className={`status_pahistory ${app.status?.toLowerCase()}_pahistory`}>
                                            {getStatusIcon(app.status)} {app.status || 'Scheduled'}
                                        </span>
                                    </div>
                                    <div className="eventDetails_pahistory">
                                        <p><Calendar size={14} /> <strong>Date:</strong> {app.appointmentDate}</p>
                                        <p><Clock size={14} /> <strong>Time:</strong> {app.appointmentTime}</p>
                                        <p><ClipboardList size={14} /> <strong>Reason:</strong> {app.reason || 'Routine Checkup'}</p>
                                    </div>
                                    <div className="eventActions_pahistory" style={{ marginTop: '1rem', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        {app.status === 'Completed' && (
                                            <button className="viewPresBtn_pahistory">
                                                View Details <ChevronRight size={16} />
                                            </button>
                                        )}
                                        {app.status === 'APPROVED' && (
                                            <Link to={`/payment/${app.appointmentReferenceId || app.appointmentId}`} className="makePaymentBtn_pahistory">
                                                Make Payment <ChevronRight size={16} />
                                            </Link>
                                        )}
                                        {app.status === 'PAID' && (
                                            <div className="paymentCompleteWrapper_pahistory" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <span className="paymentCompleteBadge_pahistory" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', background: '#dcfce7', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    <CheckCircle2 size={14} /> Payment Complete
                                                </span>
                                                <Link to={`/telemedicine/patient/${patientId}`} className="requestVideoBtn_pahistory" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', transition: 'background 0.2s' }}>
                                                    Request Video consultation <Video size={16} />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="noData_pahistory">No medical history found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientHistory_pahistory;
