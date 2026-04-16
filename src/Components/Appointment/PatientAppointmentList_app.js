import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Edit3, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import PatientBookingForm_app from './PatientBookingForm_app';
import './PatientAppointmentList_app.css';

const PatientAppointmentList_app = ({ patientId }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAppointment, setEditingAppointment] = useState(null);

    useEffect(() => {
        fetchAppointments();
    }, [patientId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/patient/api/v1/appointments/allAppointmentsByPatientId/${patientId}`);
            setAppointments(response.data || []);
        } catch (err) {
            console.error("Failed to fetch appointments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (refId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            await axios.delete(`http://localhost:8080/patient/api/v1/appointments/cancel/${refId}`);
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
