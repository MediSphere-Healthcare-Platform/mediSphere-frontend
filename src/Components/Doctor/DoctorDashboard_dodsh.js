import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Users, Calendar, Clock, ClipboardList, CheckCircle, 
    XCircle, ArrowRight, UserCheck, Activity, Award, FileText
} from 'lucide-react';
import './DoctorDashboard_dodsh.css';

const DoctorDashboard_dodsh = ({ doctorId = "D001" }) => {
    const [stats, setStats] = useState({
        totalAppointments: 124,
        pendingRequests: 8,
        completedToday: 5,
        totalPatients: 450
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    useEffect(() => {
        fetchDashboardData();
    }, [doctorId]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/doctor/api/v1/appointments/allAppointmentsByDoctorId/${doctorId}`);
            // In a real app, I'd filter or get separate stats
            setRecentAppointments(response.data.data.slice(0, 5));
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
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
            fetchDashboardData();
            alert(`Appointment ${status.toLowerCase()} successfully!`);
        } catch (err) {
            console.error('Status change failed:', err);
        }
    };

    return (
        <div className="container_dodsh">
            {/* Hero Section */}
            <div className="hero_dodsh">
                <div className="heroContent_dodsh">
                    <div className="heroBadge_dodsh">
                        <UserCheck size={14} /> <span>Clinical Excellence</span>
                    </div>
                    <h1>Welcome back, <span>Dr. Smith</span></h1>
                    <p className="heroDate_dodsh">{today}</p>
                    <p className="heroSub_dodsh">Your patient schedule for today is ready. You have {stats.pendingRequests} new appointment requests waiting for review.</p>
                </div>
                <div className="heroOverlay_dodsh"></div>
            </div>

            {/* Stats Grid */}
            <div className="statsGrid_dodsh">
                <div className="statCard_dodsh">
                    <div className="statIcon_dodsh blue_dodsh"><ClipboardList /></div>
                    <div className="statValue_dodsh">{stats.totalAppointments}</div>
                    <div className="statLabel_dodsh">Total Appointments</div>
                </div>
                <div className="statCard_dodsh">
                    <div className="statIcon_dodsh orange_dodsh"><Clock /></div>
                    <div className="statValue_dodsh">{stats.pendingRequests}</div>
                    <div className="statLabel_dodsh">Pending Requests</div>
                </div>
                <div className="statCard_dodsh">
                    <div className="statIcon_dodsh green_dodsh"><CheckCircle /></div>
                    <div className="statValue_dodsh">{stats.completedToday}</div>
                    <div className="statLabel_dodsh">Completed Today</div>
                </div>
                <div className="statCard_dodsh">
                    <div className="statIcon_dodsh purple_dodsh"><Users /></div>
                    <div className="statValue_dodsh">{stats.totalPatients}</div>
                    <div className="statLabel_dodsh">Unique Patients</div>
                </div>
            </div>

            <div className="mainGrid_dodsh">
                <div className="leftCol_dodsh">
                    <div className="sectionHeader_dodsh">
                        <h2>Recent Appointments</h2>
                        <Link to="/doctor/appointments" className="viewAll_dodsh">
                            View All <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="appointmentList_dodsh">
                        {loading ? (
                            <p className="loadingText_dodsh">Loading schedule...</p>
                        ) : recentAppointments.length > 0 ? (
                            recentAppointments.map((app, idx) => (
                                <div key={idx} className="appCard_dodsh">
                                    <div className="appInfo_dodsh">
                                        <div className="patientAvatar_dodsh">
                                            {app.patientName?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <h4>{app.patientName || 'Patient Name'}</h4>
                                            <p><Clock size={14} /> {app.appointmentTime} - {app.appointmentDate}</p>
                                        </div>
                                    </div>
                                    <div className="appActions_dodsh">
                                        {app.status === 'Pending' ? (
                                            <>
                                                <button onClick={() => handleStatusChange(app.appointmentId, 'Accepted')} className="acceptBtn_dodsh" title="Accept"><CheckCircle size={18} /></button>
                                                <button onClick={() => handleStatusChange(app.appointmentId, 'Rejected')} className="rejectBtn_dodsh" title="Reject"><XCircle size={18} /></button>
                                            </>
                                        ) : (
                                            <span className={`statusSpan_dodsh ${app.status?.toLowerCase()}_dodsh`}>{app.status}</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="noApp_dodsh">No appointments found for today.</div>
                        )}
                    </div>
                </div>

                <div className="rightCol_dodsh">
                    <div className="proCard_dodsh">
                        <Award className="proIcon_dodsh" size={40} />
                        <h3>Professional Identity</h3>
                        <p>Keep your profile information and medical license details up to date to maintain patient trust.</p>
                        <Link to="/doctor/profile" className="proBtn_dodsh">Manage Profile</Link>
                    </div>

                    <div className="quickTools_dodsh">
                        <h3>Quick Clinical Tools</h3>
                        <div className="toolGrid_dodsh">
                            <Link to="/doctor/schedule" className="toolItem_dodsh">
                                <Calendar size={20} />
                                <span>Schedule</span>
                            </Link>
                            <Link to="/doctor/reports" className="toolItem_dodsh">
                                <FileText size={20} />
                                <span>Reports</span>
                            </Link>
                            <div className="toolItem_dodsh">
                                <Activity size={20} />
                                <span>Vitals</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard_dodsh;
