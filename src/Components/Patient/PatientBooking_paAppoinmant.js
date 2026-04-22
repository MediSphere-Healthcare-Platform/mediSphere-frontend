import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, Clock, User, Award, ArrowRight, ShieldCheck, X } from 'lucide-react';
import api from '../../services/api';
import './PatientBooking_paAppoinmant.css';

const PatientBooking_paAppoinmant = ({ patientId: propPatientId = "P002" }) => {
    const { patientId: urlPatientId } = useParams();
    const patientId = urlPatientId || propPatientId;

    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({
        appointmentDate: '',
        appointmentTime: '',
        comments: ''
    });
    const [loading, setLoading] = useState(true);
    const [patientLoading, setPatientLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        console.log(`[Booking] Initializing for Patient ID: ${patientId}`);
        fetchDoctors();
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            const response = await api.get(`getPatientById/${patientId}`);
            const data = response.data.data || response.data;
            setBookingData(prev => ({ ...prev, msUserId: data.msUserId }));
        } catch (err) {
            console.error('[Booking] Fetch Patient Error:', err);
        } finally {
            setPatientLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get('getAllDoctors');
            const finalData = response.data.data || response.data || [];
            setDoctors(Array.isArray(finalData) ? finalData : []);
        } catch (err) {
            console.error('[Booking] Fetch Doctors Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                patientId: patientId,
                doctorId: selectedDoctor.doctorId,
                msUserId: bookingData.msUserId,
                appointmentDate: bookingData.appointmentDate,
                appointmentTime: bookingData.appointmentTime,
                reason: bookingData.comments
            };

            await api.post('appointments/bookAppointment', payload);
            alert('Appointment booked successfully!');
            setShowModal(false);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Booking failed.';
            alert(`Booking failed: ${msg}`);
        }
    };

    const filteredDoctors = doctors.filter(doc =>
        (doc.firstName + ' ' + doc.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const defaultDocAvatar = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

    return (
        <div className="container_paAppoinmant">
            {/* Hero Section */}
            <div className="hero_img_booking">
                <div className="hero_paAppoinmant">
                    <div className="heroContent_paAppoinmant">
                        <h1>Find & Book <span>Expert Care</span></h1>
                        <p>Search through our network of certified specialists and schedule your consultation in seconds. Your health is our priority.</p>

                        <div className="searchBar_paAppoinmant">
                            <Search size={24} className="searchIcon_paAppoinmant" />
                            <input
                                type="text"
                                placeholder="Search by doctor name or medical specialty..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="heroOverlay_paAppoinmant"></div>
                </div>
            </div>

            {loading ? (
                <div className="loading_paAppoinmant">
                    <Clock className="animate-spin" size={32} />
                    <p>Connecting with our medical specialists...</p>
                </div>
            ) : (
                <div className="doctorGrid_paAppoinmant">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.doctorId} className="doctorCard_paAppoinmant">
                            <div className="docImageWrapper_paAppoinmant">
                                <img 
                                    src={doctor.profilePic || defaultDocAvatar} 
                                    alt={doctor.firstName}
                                    onError={(e) => { e.target.src = defaultDocAvatar; }}
                                />
                                <span className="specialtyBadge_paAppoinmant">{doctor.specialty || 'General'}</span>
                            </div>
                            <div className="docInfo_paAppoinmant">
                                <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                                <p><Award size={16} /> Highly Experienced</p>
                                <p><ShieldCheck size={16} /> Verified MediSphere Expert</p>
                                <button
                                    className="bookBtn_paAppoinmant"
                                    onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                                >
                                    Make an Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <div className="noResults_paAppoinmant">
                            <User size={48} />
                            <p>No specialists found matching your search.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modalOverlay_paAppoinmant">
                    <div className="modal_paAppoinmant">
                        <div className="modalHeader_paAppoinmant">
                            <h2>Reserve Slot</h2>
                            <button className="closeModal_paAppoinmant" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBooking} className="bookingForm_paAppoinmant">
                            <div className="selectedDocInfo_paAppoinmant">
                                <p>You are booking with</p>
                                <strong>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</strong>
                            </div>

                            <div className="formRow_paAppoinmant">
                                <div className="inputGroup_paAppoinmant">
                                    <label><Calendar size={18} /> Preferred Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                                    />
                                </div>

                                <div className="inputGroup_paAppoinmant">
                                    <label><Clock size={18} /> Available Time</label>
                                    <input
                                        type="time"
                                        required
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="inputGroup_paAppoinmant">
                                <label>Reason for Visit</label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe your symptoms or reason for the consultation..."
                                    onChange={(e) => setBookingData({ ...bookingData, comments: e.target.value })}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="confirmBtn_paAppoinmant"
                                disabled={patientLoading || !bookingData.msUserId}
                            >
                                {patientLoading ? 'Verifying Profile...' : 'Confirm Appointment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientBooking_paAppoinmant;
