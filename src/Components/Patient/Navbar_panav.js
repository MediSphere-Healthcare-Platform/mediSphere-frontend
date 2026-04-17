import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Home, User, Calendar, History, FileText, Pill, Video, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar_panav.css';

const Navbar_panav = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { patientId: urlPatientId } = useParams();

    // Resolve patientId: from URL param, auth context, or sessionStorage
    const patientId = urlPatientId
        || user?.patientId
        || sessionStorage.getItem('medisphere_user') && JSON.parse(sessionStorage.getItem('medisphere_user'))?.patientId
        || '';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userName = user?.name || 'Patient';

    return (
        <nav className="nav_panav">
            <div className="logo_panav">
                <div className="logoIcon_panav">+</div>
                <span>MediSphere</span>
            </div>

            <div className="links_panav">
                <Link to={`/dashboard/${patientId}`} className="link_panav"><Home size={18} /> Dashboard</Link>
                <Link to={`/book/${patientId}`} className="link_panav"><Calendar size={18} /> Book</Link>
                <Link to={`/history/${patientId}`} className="link_panav"><History size={18} /> History</Link>
                <Link to={`/reports/${patientId}`} className="link_panav"><FileText size={18} /> Reports</Link>
                <Link to={`/prescriptions/${patientId}`} className="link_panav"><Pill size={18} /> Prescriptions</Link>
            </div>

            <div className="profile_panav">
                <div className="userInfo_panav">
                    <span className="userName_panav">{userName}</span>
                    <span className="userRole_panav">Patient</span>
                </div>
                <Link to={`/profile/${patientId}`} className="avatar_panav">
                    <User size={20} />
                </Link>
                <button className="logoutBtn_panav" title="Logout" onClick={handleLogout}>
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar_panav;
