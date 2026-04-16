import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Calendar, Clock, User, Award, ArrowRight, ShieldCheck } from 'lucide-react';
import './PatientBooking_paAppoinmant.css';

const PatientBooking_paAppoinmant = ({ patientId = "P001" }) => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({
        appointmentDate: '',
        appointmentTime: '',
        comments: ''
    });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/patient/api/v1/getAllDoctors');
            setDoctors(response.data.data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                patientId,
                doctorId: selectedDoctor.doctorId,
                ...bookingData
            };
            await axios.post('http://localhost:8080/patient/api/v1/appointments/bookAppointment', payload);
            alert('Appointment booked successfully!');
            setShowModal(false);
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Failed to book appointment.');
        }
    };

    const filteredDoctors = doctors.filter(doc => 
        doc.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container_paAppoinmant">
            {/* Hero Section */}
            <div className="hero_paAppoinmant">
                <div className="heroContent_paAppoinmant">
                    <h1>Find & Book <span>Expert Care</span></h1>
                    <p>Search through our network of certified specialists and schedule your consultation in seconds.</p>
                    
                    <div className="searchBar_paAppoinmant">
                        <Search size={22} className="searchIcon_paAppoinmant" />
                        <input 
                            type="text" 
                            placeholder="Search by name or specialization..." 
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="heroOverlay_paAppoinmant"></div>
            </div>

            {loading ? (
                <div className="loading_paAppoinmant">Searching for doctors...</div>
            ) : (
                <div className="doctorGrid_paAppoinmant">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.doctorId} className="doctorCard_paAppoinmant">
                            <div className="docImageWrapper_paAppoinmant">
                                <img src={doctor.profileImageUrl || 'https://via.placeholder.com/150'} alt={doctor.firstName} />
                                <span className="specialtyBadge_paAppoinmant">{doctor.specialization}</span>
                            </div>
                            <div className="docInfo_paAppoinmant">
                                <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                                <p><Award size={14} /> {doctor.experience} Experience</p>
                                <p><ShieldCheck size={14} /> Verified Professional</p>
                                <button 
                                    className="bookBtn_paAppoinmant" 
                                    onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                                >
                                    Book Now <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modalOverlay_paAppoinmant">
                    <div className="modal_paAppoinmant">
                        <div className="modalHeader_paAppoinmant">
                            <h2>Book Appointment</h2>
                            <button onClick={() => setShowModal(false)}><Clock size={20} /></button>
                        </div>
                        <form onSubmit={handleBooking} className="bookingForm_paAppoinmant">
                            <p>Booking with <strong>Dr. {selectedDoctor.firstName}</strong></p>
                            
                            <div className="inputGroup_paAppoinmant">
                                <label><Calendar size={16} /> Date</label>
                                <input 
                                    type="date" 
                                    required 
                                    onChange={(e) => setBookingData({...bookingData, appointmentDate: e.target.value})} 
                                />
                            </div>

                            <div className="inputGroup_paAppoinmant">
                                <label><Clock size={16} /> Time Slot</label>
                                <input 
                                    type="time" 
                                    required 
                                    onChange={(e) => setBookingData({...bookingData, appointmentTime: e.target.value})} 
                                />
                            </div>

                            <div className="inputGroup_paAppoinmant">
                                <label>Symptoms / Comments</label>
                                <textarea 
                                    placeholder="Briefly describe your health concern..." 
                                    onChange={(e) => setBookingData({...bookingData, comments: e.target.value})} 
                                />
                            </div>

                            <button type="submit" className="confirmBtn_paAppoinmant">Confirm Booking</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientBooking_paAppoinmant;
