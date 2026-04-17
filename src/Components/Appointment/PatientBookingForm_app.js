import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, MessageSquare, Send } from 'lucide-react';
import './PatientBookingForm_app.css';

const PatientBookingForm_app = ({ doctor, patientId, existingAppointment = null, onClose, onSuccess }) => {
    const isEditMode = !!existingAppointment;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        appointmentDate: existingAppointment?.appointmentDate || '',
        appointmentTime: existingAppointment?.appointmentTime || '',
        reason: existingAppointment?.reason || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode) {
                const payload = {
                    appointmentReferenceId: existingAppointment.appointmentReferenceId,
                    appointmentDate: formData.appointmentDate,
                    appointmentTime: formData.appointmentTime,
                    reason: formData.reason
                };
                await axios.put('http://localhost:8084/patient/api/v1/updateAppointment', payload);
                alert('Appointment updated successfully!');
            } else {
                const payload = {
                    patientId,
                    doctorId: doctor.doctorId,
                    msUserId: "TEMP_USER_ID", // This should normally come from auth context
                    appointmentDate: formData.appointmentDate,
                    appointmentTime: formData.appointmentTime,
                    reason: formData.reason
                };
                await axios.post('http://localhost:8084/patient/api/v1/appointments/bookAppointment', payload);
                alert('Appointment booked successfully!');
            }
            onSuccess();
        } catch (err) {
            console.error("Booking error:", err);
            alert(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modalOverlay_app" onClick={onClose}>
            <div className="modal_app" onClick={e => e.stopPropagation()}>
                <button className="closeBtn_app" onClick={onClose}><X size={20} /></button>
                
                <h2>{isEditMode ? 'Modify Reservation' : 'Confirm Appointment'}</h2>
                <p className="modalSubtitle_app">
                    with <strong>Dr. {doctor?.firstName || existingAppointment?.doctorName}</strong>
                </p>

                <form className="form_app" onSubmit={handleSubmit}>
                    <div className="inputGroup_app">
                        <label><Calendar size={16} /> Preferred Date</label>
                        <input 
                            type="date" 
                            className="formInput_app"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.appointmentDate}
                            onChange={e => setFormData({...formData, appointmentDate: e.target.value})}
                        />
                    </div>

                    <div className="inputGroup_app">
                        <label><Clock size={16} /> Best Time Slot</label>
                        <input 
                            type="time" 
                            className="formInput_app"
                            required
                            value={formData.appointmentTime}
                            onChange={e => setFormData({...formData, appointmentTime: e.target.value})}
                        />
                    </div>

                    <div className="inputGroup_app">
                        <label><MessageSquare size={16} /> Reason for Visit</label>
                        <textarea 
                            className="formTextarea_app"
                            placeholder="Briefly describe your symptoms or reason for the consultation..."
                            required
                            value={formData.reason}
                            onChange={e => setFormData({...formData, reason: e.target.value})}
                        />
                    </div>

                    <button type="submit" className="submitBtn_app" disabled={loading}>
                        {loading ? 'Processing...' : (isEditMode ? 'Update Appointment' : 'Confirm Booking')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PatientBookingForm_app;
