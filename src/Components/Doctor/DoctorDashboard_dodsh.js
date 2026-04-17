import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { doctorApi } from '../../services/api';
import { 
    Users, Calendar, Clock, ClipboardList, CheckCircle, 
    XCircle, ArrowRight, UserCheck, Activity, Award, FileText
} from 'lucide-react';
import './DoctorDashboard_dodsh.css';

const DoctorDashboard_dodsh = ({ doctorId: propDoctorId = "UD102616" }) => {
    const { doctorId: urlDoctorId } = useParams();
    const location = useLocation();
    
    // Robust ID Resolution Logic (Synced with Navbar)
    const getActiveId = () => {
        // 1. Try to find UD pattern in any segment of the URL (most robust)
        const pathParts = location.pathname.split('/');
        const idFromUrl = pathParts.find(part => part.startsWith('UD') && part.length > 5);
        
        if (idFromUrl) {
            sessionStorage.setItem('currentDoctorId', idFromUrl);
            return idFromUrl;
        }

        // 2. Check useParams (specifically for dashboard/:doctorId route)
        if (urlDoctorId) {
            sessionStorage.setItem('currentDoctorId', urlDoctorId);
            return urlDoctorId;
        }

        // 3. Fallback to Session Storage then Prop
        return sessionStorage.getItem('currentDoctorId') || propDoctorId;
    };

    const currentDoctorId = getActiveId();

    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingRequests: 0,
        completedToday: 0,
        totalPatients: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [doctorInfo, setDoctorInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    useEffect(() => {
        const fetchDoctorInfo = async () => {
            try {
                const response = await doctorApi.get(`/getDoctorById/${currentDoctorId}`);
                setDoctorInfo(response.data.data);
            } catch (err) {
                console.error('Error fetching dashboard doctor info:', err);
            }
        };
        fetchDoctorInfo();
    }, [currentDoctorId]);

    useEffect(() => {
        fetchDashboardData();
    }, [currentDoctorId]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch appointments
            const appointRes = await doctorApi.get(`/appointments/allAppointmentsByDoctorId/${currentDoctorId}`);
            const allAppointments = appointRes.data.data || [];
            
            // Calculate stats dynamically
            const todayStr = new Date().toISOString().split('T')[0];
            const uniquePatients = new Set(allAppointments.map(a => a.patientId)).size;
            const pendingCount = allAppointments.filter(a => a.status === 'Pending').length;
            const completedCount = allAppointments.filter(a => a.status === 'Completed').length;
            const todayCount = allAppointments.filter(a => a.appointmentDate === todayStr).length;

            setStats({
                totalAppointments: allAppointments.length,
                pendingRequests: pendingCount,
                completedToday: todayCount || completedCount,
                totalPatients: uniquePatients
            });

            setRecentAppointments(allAppointments.slice(0, 5));
        } catch (err) {
            console.error('Error fetching clinical data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId, status) => {
        try {
            await doctorApi.put('/appointments/appointmentStatusChange', {
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
                    <h1>Welcome back, <span>
                        {doctorInfo ? `Dr. ${doctorInfo.firstName || ''} ${doctorInfo.lastName || ''}` : (loading ? 'Loading...' : 'Dr. Smith')}
                    </span></h1>
                    <p className="heroDate_dodsh">{today}</p>
                    <p className="heroSub_dodsh">Your patient schedule for today is ready. You have {stats.pendingRequests} new consultation requests waiting for review.</p>
                </div>
                <div className="heroOverlay_dodsh"></div>
            </div>

            {/* Stats Grid */}
            <div className="statsGrid_dodsh">
                {/* ... (stats keep as is) ... */}
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
                        <Link to={`/doctor/appointments/${currentDoctorId}`} className="viewAll_dodsh">
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
                        <Link to={`/doctor/profile/${currentDoctorId}`} className="proBtn_dodsh">Manage Profile</Link>
                    </div>

                    <div className="quickTools_dodsh">
                        <h3>Quick Clinical Tools</h3>
                        <div className="toolGrid_dodsh">
                            <Link to={`/doctor/schedule/${currentDoctorId}`} className="toolItem_dodsh">
                                <Calendar size={20} />
                                <span>Schedule</span>
                            </Link>
                            <Link to={`/doctor/reports/${currentDoctorId}`} className="toolItem_dodsh">
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
            {/* Debug Panel */}
            <div className="debugSection_dodsh" style={{ marginTop: '40px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="debugHeader_dodsh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><Activity size={18} /> Doctor Network Diagnostic Panel</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '5px' }}>Active ID:</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1' }}>{currentDoctorId}</span>
                        </div>
                    </div>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Connected to Doctor Service on <strong>port 8085</strong>. 
                    Data fetched dynamically. Priority: URL > Session > Prop.
                </p>
            </div>
        </div>
    );
};

export default DoctorDashboard_dodsh;
