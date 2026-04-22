import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorApi } from '../../services/api';
import { 
    Search, Filter, Calendar, Clock, User, 
    MessageSquare, CheckCircle, XCircle, MoreVertical,
    Activity, Video, ChevronRight, FileText
} from 'lucide-react';
import './DoctorAppointments_doappt.css';

const DoctorAppointments_doappt = () => {
    const { doctorId: urlDoctorId } = useParams();
    const currentDoctorId = urlDoctorId || sessionStorage.getItem('currentDoctorId') || "UD102616";
    
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchAppointments();
    }, [currentDoctorId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await doctorApi.get(`appointments/allAppointmentsByDoctorId/${currentDoctorId}`);
            const resData = response.data?.data !== undefined ? response.data.data : response.data;
            const appointmentData = Array.isArray(resData) ? resData : (resData?.doctorAppointments || []);
            setAppointments(appointmentData);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentReferenceId, status) => {
        try {
            await doctorApi.put('appointments/appointmentStatusChange', {
                appointmentReferenceId,
                status
            });
            fetchAppointments(); // Refresh list
            alert(`Appointment marked as ${status} successfully.`);
        } catch (err) {
            console.error('Status update failed:', err);
            alert('Failed to update status. Please try again.');
        }
    };

    const filteredAppointments = appointments.filter(app => {
        const matchesSearch = (app.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (app.appointmentReferenceId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || 
                             (app.status && app.status.toLowerCase() === statusFilter.toLowerCase());
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="daWrapper_doappt">
            {/* Rich Hero Header */}
            <header className="daHero_doappt">
                <div className="daHeroBg_doappt"></div>
                <div className="daHeroOverlay_doappt"></div>
                <div className="daHeroContent_doappt">
                    <div className="daBadge_doappt">
                        <Activity size={14} /> <span>Clinical Workflow</span>
                    </div>
                    <h1>Appointment <span>Management</span></h1>
                    <p>Review, manage, and coordinate your patient consultations with real-time status tracking.</p>
                </div>
            </header>

            <div className="daContainer_doappt">
                {/* Control Panel - Glassmorphism */}
                <div className="daControls_doappt">
                    <div className="daSearch_doappt">
                        <Search size={20} className="daSearchIcon_doappt" />
                        <input 
                            type="text" 
                            placeholder="Search by patient name or reference ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="daFilters_doappt">
                        <div className="daFilterItem_doappt">
                            <Filter size={18} />
                            <select 
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="APPROVED">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Appointment List */}
                {loading ? (
                    <div className="daLoading_doappt">
                        <div className="daSpinner_doappt"></div>
                        <p>Synchronizing your clinical schedule...</p>
                    </div>
                ) : filteredAppointments.length > 0 ? (
                    <div className="daGrid_doappt">
                        {filteredAppointments.map((app, index) => (
                            <div className="daCard_doappt" key={app.appointmentReferenceId || index}>
                                <div className="daCardHeader_doappt">
                                    <div className="daPatientMeta_doappt">
                                        <div className="daAvatar_doappt">
                                            {app.patientName?.charAt(0) || 'P'}
                                        </div>
                                        <div className="daPatientText_doappt">
                                            <h3>{app.patientName || 'Anonymous Patient'}</h3>
                                            <span className="daRef_doappt">REF: {app.appointmentReferenceId}</span>
                                        </div>
                                    </div>
                                    <div className={`daStatusTag_doappt ${app.status?.toLowerCase()}_doappt`}>
                                        {app.status}
                                    </div>
                                </div>

                                <div className="daCardBody_doappt">
                                    <div className="daDetail_doappt">
                                        <Calendar size={16} />
                                        <span>{app.appointmentDate}</span>
                                    </div>
                                    <div className="daDetail_doappt">
                                        <Clock size={16} />
                                        <span>{app.appointmentTime}</span>
                                    </div>
                                    <div className="daReasonBox_doappt">
                                        <MessageSquare size={16} />
                                        <p>{app.reason || 'No reason provided.'}</p>
                                    </div>
                                </div>

                                <div className="daCardActions_doappt">
                                    {app.status?.toUpperCase() === 'PENDING' ? (
                                        <>
                                            <button 
                                                className="daBtnAccept_doappt"
                                                onClick={() => handleStatusChange(app.appointmentReferenceId, 'APPROVED')}
                                            >
                                                <CheckCircle size={18} /> Accept
                                            </button>
                                            <button 
                                                className="daBtnReject_doappt"
                                                onClick={() => handleStatusChange(app.appointmentReferenceId, 'REJECTED')}
                                            >
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </>
                                    ) : app.status?.toUpperCase() === 'APPROVED' ? (
                                        <>
                                            <Link to={`/doctor/consultation/${app.appointmentReferenceId}`} className="daBtnConsult_doappt">
                                                <Video size={18} /> Start Session
                                            </Link>
                                        </>
                                    ) : (
                                        <button className="daBtnArchive_doappt" disabled>
                                            <FileText size={18} /> View History
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="daNoData_doappt">
                        <div className="daNoDataIcon_doappt">
                            <Calendar size={48} />
                        </div>
                        <h3>No consultations found</h3>
                        <p>Adjust your filters or search term to find what you're looking for.</p>
                        <button className="daResetBtn_doappt" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorAppointments_doappt;
