import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, AlertCircle, Video } from 'lucide-react';
import { patientApi } from '../../services/api';
import PatientBookingForm_app from './PatientBookingForm_app';
import './PatientAppointmentList_app.css';

const PatientAppointmentList_app = ({ patientId }) => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAppointment, setEditingAppointment] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, [patientId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await patientApi.get(`appointments/allAppointmentsByPatientId/${patientId}`);
            const resData = response.data?.data !== undefined ? response.data.data : response.data;
            const appointmentData = Array.isArray(resData) ? resData : (resData?.patientAppointments || []);
            setAppointments(appointmentData);
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (refId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await patientApi.delete(`appointments/cancel/${refId}`);
            alert("Appointment cancelled successfully.");
            fetchAppointments();
        } catch (err) {
            console.error("Deletion error:", err);
            alert("Failed to cancel appointment.");
        }
    };

    if (loading && appointments.length === 0) return <div className="loading_app">Loading your appointments...</div>;

    return (
        <div className="listWrapper_app">
            <div className="listHeader_app">
                <h2>Your Schedule</h2>
                <button className="refreshBtn_app" onClick={fetchAppointments}>
                    <RefreshCw size={16} /> Sync Status
                </button>
            </div>

            <div className="appointmentGrid_app">
                {appointments.length > 0 ? (
                    appointments.map(appt => (
                        <div key={appt.appointmentReferenceId} className="apptCard_app">
                            <span className={`apptStatus_app status_${appt.status}_app`}>
                                {appt.status}
                            </span>
                            
                            <div className="apptMain_app">
                                <span className="apptRef_app">{appt.appointmentReferenceId}</span>
                                <h3 className="apptDoctor_app">Dr. {appt.doctorName}</h3>
                                
                                <div className="apptDetails_app">
                                    <div className="detailItem_app">
                                        <Calendar size={14} /> {appt.appointmentDate}
                                    </div>
                                    <div className="detailItem_app">
                                        <Clock size={14} /> {appt.appointmentTime}
                                    </div>
                                </div>

                                <div className="apptActions_app">
                                    {['APPROVED', 'PAID', 'CONFIRMED'].includes(appt.status?.toUpperCase()) && (
                                        <button 
                                            className="actionBtn_app"
                                            style={{ background: '#2563eb', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            onClick={() => navigate(`/patient/consultation/${appt.appointmentReferenceId}`)}
                                        >
                                            <Video size={16} /> Join Video
                                        </button>
                                    )}
                                    <button 
                                        className="actionBtn_app editBtn_app" 
                                        onClick={() => setEditingAppointment(appt)}
                                        disabled={appt.status === 'CANCELLED' || appt.status === 'REJECTED'}
                                    >
                                        <Edit3 size={16} /> Modify
                                    </button>
                                    <button 
                                        className="actionBtn_app deleteBtn_app" 
                                        onClick={() => handleDelete(appt.appointmentReferenceId)}
                                        disabled={appt.status === 'CANCELLED'}
                                    >
                                        <Trash2 size={16} /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="emptyState_app">
                        <AlertCircle size={48} strokeWidth={1.5} />
                        <h3>No appointments yet.</h3>
                        <p>Schedule your first consultation today!</p>
                    </div>
                )}
            </div>

            {editingAppointment && (
                <PatientBookingForm_app 
                    existingAppointment={editingAppointment}
                    patientId={patientId}
                    onClose={() => setEditingAppointment(null)}
                    onSuccess={() => {
                        setEditingAppointment(null);
                        fetchAppointments();
                    }}
                />
            )}
        </div>
    );
};

export default PatientAppointmentList_app;
