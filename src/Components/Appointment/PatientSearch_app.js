import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Star, Clock, Briefcase, ArrowRight } from 'lucide-react';
import PatientBookingForm_app from './PatientBookingForm_app';
import './PatientSearch_app.css';

const PatientSearch_app = ({ patientId }) => {
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [bookingDoctor, setBookingDoctor] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const response = await axios.get('http://localhost:8080/patient/api/v1/getAllDoctors');
            const docs = response.data.data || [];
            setDoctors(docs);
            
            // Extract distinct specialties
            const uniqueSpecs = ['All', ...new Set(docs.map(d => d.specialty).filter(Boolean))];
            setSpecialties(uniqueSpecs);
        } catch (err) {
            console.error("Failed to fetch doctors:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = `${doc.firstName} ${doc.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpec = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
        return matchesSearch && matchesSpec;
    });

    if (loading) return <div className="loading_app">Transforming medical network...</div>;

    return (
        <div className="searchWrapper_app">
            <div className="filterControls_app">
                <div className="searchGroup_app">
                    <label>Search Provider</label>
                    <div className="inputWrapper_app">
                        <Search size={20} className="searchIcon_app" />
                        <input 
                            className="searchInput_app"
                            placeholder="Find by doctor's name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="selectGroup_app">
                    <label>Category</label>
                    <select 
                        className="specialtySelect_app"
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                    >
                        {specialties.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="docGrid_app">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doctor => (
                        <div key={doctor.doctorId} className="docCard_app">
                            <div className="docHeader_app">
                                <div className="docImgWrapper_app">
                                    <img src={doctor.profilePic || 'https://via.placeholder.com/150'} alt={doctor.firstName} className="docImg_app" />
                                    <div className="onlineBadge_app"></div>
                                </div>
                                <div className="docMeta_app">
                                    <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                                    <span className="specTag_app">{doctor.specialty}</span>
                                </div>
                            </div>
                            
                            <div className="docStats_app">
                                <div className="statItem_app"><Briefcase size={14} /> {doctor.experience || '5+'} yrs</div>
                                <div className="statItem_app"><Star size={14} color="#f59e0b" /> 4.9 (120+)</div>
                                <div className="statItem_app"><MapPin size={14} /> Medical Center</div>
                            </div>

                            <button className="bookBtn_app" onClick={() => setBookingDoctor(doctor)}>
                                Schedule Visit <ArrowRight size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="noResults_app">
                        <h3>No physicians found matching your criteria.</h3>
                        <p>Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            {bookingDoctor && (
                <PatientBookingForm_app 
                    doctor={bookingDoctor} 
                    patientId={patientId} 
                    onClose={() => setBookingDoctor(null)}
                    onSuccess={() => {
                        setBookingDoctor(null);
                        // In a real app, maybe switch tabs to "My Bookings"
                    }}
                />
            )}
        </div>
    );
};

export default PatientSearch_app;
