import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Calendar, Clock, User, Filter, Search, 
    CheckCircle, XCircle, Info, MoreVertical 
} from 'lucide-react';
import './DoctorAppointments_doappt.css';

const DoctorAppointments_doappt = ({ doctorId = "D001" }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const heroImg = "https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=1200";

    useEffect(() => {
        fetchAppointments();
    }, [doctorId]);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/doctor/api/v1/appointments/allAppointmentsByDoctorId/${doctorId}`);
            setAppointments(response.data.data);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, status) => {
        try {
            await axios.put('http://localhost:8080/doctor/api/v1/appointments/appointmentStatusChange', {
                appointmentId,
                status
            });
            fetchAppointments();
        } catch (err) {
            console.error('Status change failed:', err);
        }
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesFilter = filter === 'All' || app.status === filter;
        const matchesSearch = (app.patientName || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="daWrapper_doappt">
            {/* Hero Section */}
            <div className="daHero_doappt" style={{ backgroundImage: `url(${heroImg})` }}>
                <div className="daHeroContent_doappt">
                    <h1>Appointment <span>Management</span></h1>
                    <p>Review patient consultation requests and manage your daily clinical schedule.</p>
                </div>
                <div className="daHeroOverlay_doappt"></div>
            </div>

            <div className="daContainer_doappt">
                <div className="daControls_doappt">
                    <div className="daSearch_doappt">
                        <Search size={20} />
                        <input 
                            type="text" 
                            placeholder="Search patient name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="daFilter_doappt">
                        <Filter size={18} />
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="daLoading_doappt">
                        <div className="daSpinner_doappt"></div>
                        <p>Syncing appointments...</p>
                    </div>
                ) : (
                    <div className="daGrid_doappt">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((app) => (
                                <div key={app.appointmentId} className="daCard_doappt">
                                    <div className="daCardHeader_doappt">
                                        <div className="daPatientInfo_doappt">
                                            <div className="daAvatar_doappt">
                                                {app.patientName?.charAt(0) || 'P'}
                                            </div>
                                            <div>
                                                <h3>{app.patientName || 'Anonymous Patient'}</h3>
                                                <span className={`daStatusBadge_doappt ${app.status.toLowerCase()}_doappt`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                        <MoreVertical size={20} className="daMore_doappt" />
                                    </div>

                                    <div className="daCardBody_doappt">
                                        <div className="daDetailItem_doappt">
                                            <Calendar size={16} /> <span>{app.appointmentDate}</span>
                                        </div>
                                        <div className="daDetailItem_doappt">
                                            <Clock size={16} /> <span>{app.appointmentTime}</span>
                                        </div>
                                        {app.comments && (
                                            <div className="daComment_doappt">
                                                <Info size={14} /> <p>{app.comments}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="daCardFooter_doappt">
                                        {app.status === 'Pending' ? (
                                            <>
                                                <button 
                                                    className="daRejectBtn_doappt"
                                                    onClick={() => handleStatusChange(app.appointmentId, 'Rejected')}
                                                >
                                                    <XCircle size={18} /> Reject
                                                </button>
                                                <button 
                                                    className="daAcceptBtn_doappt"
                                                    onClick={() => handleStatusChange(app.appointmentId, 'Accepted')}
                                                >
                                                    <CheckCircle size={18} /> Accept
                                                </button>
                                            </>
                                        ) : (
                                            <button className="daViewBtn_doappt">View Details</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="daNoData_doappt">
                                <Info size={40} />
                                <p>No matching appointments found.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorAppointments_doappt;
