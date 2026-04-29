import React from 'react';
import { Link, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Home, User, Calendar, History, FileText, Pill, LogOut, ArrowRight, Video, Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar_panav.css';

const Navbar_panav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user, isLoggedIn } = useAuth();
    const { patientId: urlPatientId } = useParams();

    const patientId = urlPatientId
        || user?.patientId
        || (sessionStorage.getItem('medisphere_user') && JSON.parse(sessionStorage.getItem('medisphere_user'))?.patientId)
        || '';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const loggedIn = isLoggedIn();
    const userName = user?.name || '';
    const userRole = user?.role || '';

    return (
        <nav className="nav_panav">
            {/* Brand */}
            <Link to="/" className="logo_panav">
                <div className="logoIcon_panav">+</div>
                <span>MediSphere</span>
            </Link>

            {/* Nav links — only when logged in as patient */}
            {loggedIn && userRole === 'PATIENT' && (
                <div className="links_panav">
                    <NavLink to={`/dashboard/${patientId}`} className={({ isActive }) => isActive ? 'link_panav link_active_panav' : 'link_panav'}>
                        <Home size={17} /> Dashboard
                    </NavLink>
                    <NavLink to={`/book/${patientId}`} className={({ isActive }) => isActive ? 'link_panav link_active_panav' : 'link_panav'}>
                        <Calendar size={17} /> Book
                    </NavLink>
                    <NavLink to={`/history/${patientId}`} className={({ isActive }) => isActive ? 'link_panav link_active_panav' : 'link_panav'}>
                        <History size={17} /> History
                    </NavLink>
                    <NavLink to={`/reports/${patientId}`} className={({ isActive }) => isActive ? 'link_panav link_active_panav' : 'link_panav'}>
                        <FileText size={17} /> Reports
                    </NavLink>
                    <NavLink to={`/prescriptions/${patientId}`} className={({ isActive }) => isActive ? 'link_panav link_active_panav' : 'link_panav'}>
                        <Pill size={17} /> Prescriptions
                    </NavLink>
                    <NavLink to={`/telemedicine/patient/${patientId}`} className={({ isActive }) => isActive ? 'link_panav link_active_panav' : 'link_panav'}>
                        <Video size={17} /> Telemedicine
                    </NavLink>
                    <NavLink to={`/symptom-check/${patientId}`} className={({ isActive }) => isActive ? 'link_panav link_active_panav' : 'link_panav'}>
                        <Brain size={17} /> AI Check
                    </NavLink>
                </div>
            )}

            {/* Right side */}
            {loggedIn ? (
                /* Logged-in: show user info + avatar + logout */
                <div className="profile_panav">
                    <div className="userInfo_panav">
                        {userName && <span className="userName_panav">{userName}</span>}
                        <span className="userRole_panav">{userRole}</span>
                    </div>
                    {userRole === 'PATIENT' && (
                        <Link to={`/profile/${patientId}`} className="avatar_panav">
                            <User size={19} />
                        </Link>
                    )}
                    <button className="logoutBtn_panav" title="Logout" onClick={handleLogout}>
                        <LogOut size={17} />
                    </button>
                </div>
            ) : (
                /* Guest: show Login + Register CTAs */
                <div className="guestCtas_panav">
                    <Link to="/login" className="guestLogin_panav">Sign In</Link>
                    <Link to="/register" className="guestRegister_panav">
                        Get Started <ArrowRight size={15} />
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar_panav;
