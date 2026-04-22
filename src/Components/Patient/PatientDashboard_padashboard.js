import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Calendar, History, FileText, Pill, Video,
    ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle, Loader2,
    Database, Network
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './PatientDashboard_padashboard.css';

const PatientDashboard_padashboard = ({ patientId: propPatientId }) => {
    const { patientId: urlPatientId } = useParams();
    const { user } = useAuth();
    // Priority: URL param > auth context > prop fallback
    const resolvedId = urlPatientId || user?.patientId || propPatientId || '';
    const [currentId, setCurrentId] = useState(resolvedId);
    const [idInput, setIdInput] = useState(currentId);

    const [stats, setStats] = useState({
        patient: null,
        appointments: [],
        reports: [],
        activeSessions: [],
        loading: {
            patient: true,
            appointments: true,
            reports: true,
            sessions: true
        },
        error: null
    });

    const [debugData, setDebugData] = useState({
        rawPatient: null,
        rawAppointments: null,
        rawReports: null,
        showDebug: false
    });

    // Current date for display
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    useEffect(() => {
        console.log(`[Dashboard] Initializing for Patient ID: ${currentId}`);

        const fetchPatientInfo = async () => {
            setStats(prev => ({ ...prev, loading: { ...prev.loading, patient: true }, error: null }));
            try {
                const res = await api.get(`getPatientById/${currentId}`);
                const finalData = res.data.data || res.data;
                setDebugData(prev => ({ ...prev, rawPatient: res.data }));
                setStats(prev => ({
                    ...prev,
                    patient: finalData,
                    loading: { ...prev.loading, patient: false }
                }));
            } catch (err) {
                let errorMsg = "Could not load patient profile.";
                if (err.response?.status === 404) {
                    errorMsg = `Patient ID ${currentId} not found in database. Try registering or use another ID.`;
                } else if (err.response?.status === 500) {
                    errorMsg = "Internal Server Error (500). The service might be misconfigured.";
                }

                setStats(prev => ({
                    ...prev,
                    loading: { ...prev.loading, patient: false },
                    error: errorMsg
                }));
            }
        };

        const fetchAppointments = async () => {
            setStats(prev => ({ ...prev, loading: { ...prev.loading, appointments: true } }));
            try {
                const res = await api.get(`appointments/allAppointmentsByPatientId/${currentId}`);
                setDebugData(prev => ({ ...prev, rawAppointments: res.data }));
                const resData = res.data?.data !== undefined ? res.data.data : res.data;
                const appointmentData = Array.isArray(resData) ? resData : (resData?.patientAppointments || []);
                setStats(prev => ({
                    ...prev,
                    appointments: appointmentData,
                    loading: { ...prev.loading, appointments: false }
                }));
            } catch (err) {
                console.error("[Appointments Fetch Error]", err);
                setStats(prev => ({
                    ...prev,
                    loading: { ...prev.loading, appointments: false },
                    error: err.response?.status === 500 ? "Appointment service unavailable (Eureka link broken)." : prev.error
                }));
            }
        };

        const fetchReports = async () => {
            setStats(prev => ({ ...prev, loading: { ...prev.loading, reports: true } }));
            try {
                const res = await api.get(`getPatientReportsByPatientId/${currentId}`);
                setDebugData(prev => ({ ...prev, rawReports: res.data }));
                const reportsData = res.data.data || res.data || [];
                setStats(prev => ({
                    ...prev,
                    reports: Array.isArray(reportsData) ? reportsData : [],
                    loading: { ...prev.loading, reports: false }
                }));
            } catch (err) {
                setStats(prev => ({
                    ...prev,
                    loading: { ...prev.loading, reports: false }
                }));
            }
        };

        const fetchActiveSessions = async () => {
            setStats(prev => ({ ...prev, loading: { ...prev.loading, sessions: true } }));
            try {
                // Endpoint defined in PatientController: /telemedicine/sessions/patient/{patientId}
                const res = await api.get(`telemedicine/sessions/patient/${currentId}`);
                const sessionData = res.data.data || res.data || [];
                setStats(prev => ({
                    ...prev,
                    activeSessions: Array.isArray(sessionData) ? sessionData.filter(s => s.status === 'ACTIVE' || s.status === 'OPEN') : [],
                    loading: { ...prev.loading, sessions: false }
                }));
            } catch (err) {
                console.error("[Sessions Fetch Error]", err);
                setStats(prev => ({
                    ...prev,
                    loading: { ...prev.loading, sessions: false }
                }));
            }
        };

        fetchPatientInfo();
        fetchAppointments();
        fetchReports();
        fetchActiveSessions();
    }, [currentId]);

    const isLoading = stats.loading.patient;

    if (isLoading) {
        return (
            <div className="dashboard_loading_state">
                <Loader2 className="animate-spin" size={48} />
                <p>Preparing your healthcare dashboard for {currentId}...</p>
            </div>
        );
    }


    const pastConsultations = stats.appointments.filter(app =>
        app.status && app.status.toLowerCase() === 'completed'
    ).length;

    return (
        <div className="container_padashboard">
            {/* Hero Section */}
            <div className="hero_img">
                <div className="hero_padashboard">
                    <div className="heroContent_padashboard">
                        <div className="heroBadge_padashboard">
                            <CheckCircle2 size={16} /> <span>All systems healthy</span>
                        </div>
                        <h1>Welcome back, <span>{stats.patient?.firstName || "Patient"} {stats.patient?.lastName || ""}</span></h1>
                        <p className="heroDate_padashboard">{today}</p>
                        <p className="heroSub_padashboard">Manage your health records, book appointments, and consult with professionals — all in one place. Your health is our priority.</p>
                    </div>
                    <div className="heroOverlay_padashboard"></div>
                </div>
            </div>

            {stats.error && (
                <div className="dashboard_inline_error" style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '15px', borderRadius: '8px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', color: '#991b1b' }}>
                    <AlertCircle size={20} />
                    <span><strong>Diagnostic Info:</strong> {stats.error}</span>
                </div>
            )}

            <div className="statsGrid_padashboard">
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard blue_padashboard"><Calendar /></div>
                    <div className="statValue_padashboard">
                        {stats.loading.appointments ? "..." : stats.appointments.length.toString().padStart(2, '0')}
                    </div>
                    <div className="statLabel_padashboard">Total Appointments</div>
                </div>
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard green_padashboard"><FileText /></div>
                    <div className="statValue_padashboard">
                        {stats.loading.reports ? "..." : stats.reports.length.toString().padStart(2, '0')}
                    </div>
                    <div className="statLabel_padashboard">Medical Reports</div>
                </div>
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard purple_padashboard"><Pill /></div>
                    <div className="statValue_padashboard">00</div>
                    <div className="statLabel_padashboard">Active Prescriptions</div>
                </div>
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard orange_padashboard"><History /></div>
                    <div className="statValue_padashboard">
                        {stats.loading.appointments ? "..." : pastConsultations.toString().padStart(2, '0')}
                    </div>
                    <div className="statLabel_padashboard">Past Consultations</div>
                </div>
            </div>

            <div className="mainGrid_padashboard">
                <div className="leftCol_padashboard">
                    {/* Active Consultations Section */}
                    {stats.activeSessions.length > 0 && (
                        <div className="activeSessionsSection_padashboard anim_fade_in">
                            <div className="sectionHeader_padashboard">
                                <h2><Video className="text-secondary" /> Active Consultations</h2>
                                <span className="liveBadge_padashboard">LIVE NOW</span>
                            </div>
                            <div className="sessionList_padashboard">
                                {stats.activeSessions.map(session => (
                                    <div key={session.sessionId} className="sessionCard_padashboard">
                                        <div className="sessionInfo_padashboard">
                                            <div className="sessionIcon_padashboard">
                                                <Video size={24} />
                                            </div>
                                            <div>
                                                <h3>Consultation with Dr. {session.doctorName || 'Specialist'}</h3>
                                                <p>Started at {new Date(session.startTime || session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <button
                                            className="joinSessionBtn_padashboard"
                                            onClick={() => window.open(session.roomUrl, '_blank')}
                                        >
                                            Join Consultation
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="sectionHeader_padashboard">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="actionGrid_padashboard">
                        <Link to={`/book/${currentId}`} className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><Calendar /></div>
                            <h3>Book Appointment</h3>
                            <p>Schedule a visit with your preferred doctor</p>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to={`/history/${currentId}`} className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><History /></div>
                            <h3>Medical History</h3>
                            <p>View your past treatments and records</p>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to={`/reports/${currentId}`} className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><FileText /></div>
                            <h3>My Reports</h3>
                            <p>Access your lab results and documents</p>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to={`/prescriptions/${currentId}`} className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><Pill /></div>
                            <h3>Prescriptions</h3>
                            <p>View medications issued by doctors</p>
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>

                <div className="rightCol_padashboard">
                    <div className="sectionHeader_padashboard">
                        <h2>Health Overview</h2>
                    </div>
                    <div className="notifyCard_padashboard">
                        <div className="notifyItem_padashboard alert_padashboard">
                            <AlertCircle size={20} />
                            <div className="notifyContent_padashboard">
                                <strong>Recent Records</strong>
                                <p>{stats.reports.length > 0 ? `You have ${stats.reports.length} reports filed.` : 'No medical reports uploaded yet.'}</p>
                            </div>
                        </div>
                        <div className="notifyItem_padashboard info_padashboard">
                            <CheckCircle2 size={20} />
                            <div className="notifyContent_padashboard">
                                <strong>Account Status</strong>
                                <p>Your patient profile is active and verified.</p>
                            </div>
                        </div>
                    </div>

                    <div className="profileSnip_padashboard">
                        <Link to={`/profile/${currentId}`} className="snipLink_padashboard">
                            View Full Profile <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Debug Panel */}
            <div className="debugSection_padashboard" style={{ marginTop: '40px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="debugHeader_padashboard" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><Database size={18} /> Network Diagnostic Panel</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '5px' }}>Test ID:</span>
                            <input
                                value={idInput}
                                onChange={(e) => setIdInput(e.target.value)}
                                style={{ border: 'none', width: '60px', fontSize: '12px', outline: 'none' }}
                                placeholder="e.g. P002"
                            />
                            <button
                                onClick={() => setCurrentId(idInput)}
                                style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', marginLeft: '5px', cursor: 'pointer' }}
                            >
                                Switch
                            </button>
                        </div>
                        <button
                            onClick={() => setDebugData({ ...debugData, showDebug: !debugData.showDebug })}
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px', cursor: 'pointer', background: '#fff', border: '1px solid #cbd5e1' }}
                        >
                            {debugData.showDebug ? 'Hide Details' : 'Show JSON'}
                        </button>
                    </div>
                </div>

                {debugData.showDebug && (
                    <div className="debugBody_padashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div className="debugCard_padashboard">
                            <h4 style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Patient Response</h4>
                            <pre style={{ fontSize: '11px', background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '150px' }}>
                                {JSON.stringify(debugData.rawPatient || { status: 'Not Fetched' }, null, 2)}
                            </pre>
                        </div>
                        <div className="debugCard_padashboard">
                            <h4 style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Appointments Response</h4>
                            <pre style={{ fontSize: '11px', background: '#fff', padding: '10px', borderRadius: '4px', overflow: 'auto', maxHeight: '150px' }}>
                                {JSON.stringify(debugData.rawAppointments || { status: 'Not Fetched' }, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDashboard_padashboard;
