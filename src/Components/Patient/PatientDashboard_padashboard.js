import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, History, FileText, Pill, Video, 
    ChevronRight, ArrowUpRight, CheckCircle2, AlertCircle 
} from 'lucide-react';
import './PatientDashboard_padashboard.css';

const PatientDashboard_padashboard = ({ patientId = "P001" }) => {
    // Current date for display
    const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    return (
        <div className="container_padashboard">
            {/* Hero Section */}
            <div className="hero_padashboard">
                <div className="heroContent_padashboard">
                    <div className="heroBadge_padashboard">
                        <CheckCircle2 size={16} /> <span>All systems healthy</span>
                    </div>
                    <h1>Welcome back, <span>John Doe</span></h1>
                    <p className="heroDate_padashboard">{today}</p>
                    <p className="heroSub_padashboard">Manage your health records, book appointments, and consult with professionals — all in one place.</p>
                </div>
                <div className="heroOverlay_padashboard"></div>
            </div>

            <div className="statsGrid_padashboard">
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard blue_padashboard"><Calendar /></div>
                    <div className="statValue_padashboard">02</div>
                    <div className="statLabel_padashboard">Upcoming Appointments</div>
                </div>
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard green_padashboard"><FileText /></div>
                    <div className="statValue_padashboard">15</div>
                    <div className="statLabel_padashboard">Medical Reports</div>
                </div>
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard purple_padashboard"><Pill /></div>
                    <div className="statValue_padashboard">04</div>
                    <div className="statLabel_padashboard">Active Prescriptions</div>
                </div>
                <div className="statCard_padashboard">
                    <div className="statIcon_padashboard orange_padashboard"><History /></div>
                    <div className="statValue_padashboard">28</div>
                    <div className="statLabel_padashboard">Past Consultations</div>
                </div>
            </div>

            <div className="mainGrid_padashboard">
                <div className="leftCol_padashboard">
                    <div className="sectionHeader_padashboard">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="actionGrid_padashboard">
                        <Link to="/book" className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><Calendar /></div>
                            <h3>Book Appointment</h3>
                            <p>Schedule a visit with your preferred doctor</p>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/history" className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><History /></div>
                            <h3>Medical History</h3>
                            <p>View your past treatments and records</p>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/reports" className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><FileText /></div>
                            <h3>My Reports</h3>
                            <p>Access your lab results and documents</p>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/prescriptions" className="actionCard_padashboard">
                            <div className="actionIcon_padashboard"><Pill /></div>
                            <h3>Prescriptions</h3>
                            <p>View medications issued by doctors</p>
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>

                <div className="rightCol_padashboard">
                    <div className="sectionHeader_padashboard">
                        <h2>Notifications</h2>
                    </div>
                    <div className="notifyCard_padashboard">
                        <div className="notifyItem_padashboard alert_padashboard">
                            <AlertCircle size={20} />
                            <div className="notifyContent_padashboard">
                                <strong>Appointment Reminder</strong>
                                <p>Dr. Smith's consultation tomorrow at 10 AM.</p>
                            </div>
                        </div>
                        <div className="notifyItem_padashboard info_padashboard">
                            <CheckCircle2 size={20} />
                            <div className="notifyContent_padashboard">
                                <strong>Report Ready</strong>
                                <p>Your blood test results are available to view.</p>
                            </div>
                        </div>
                    </div>

                    <div className="profileSnip_padashboard">
                        <Link to="/profile" className="snipLink_padashboard">
                            View Full Profile <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard_padashboard;
