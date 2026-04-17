import React from 'react';
import { Link, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, FileText, ClipboardList, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './DoctorNavbar_donv.css';

const DoctorNavbar_donv = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const { doctorId: urlDoctorId } = useParams();

    // Resolve doctorId from URL, context, or sessionStorage
    const getActiveDoctorId = () => {
        // 1. Extract UD-pattern from URL path
        const pathParts = location.pathname.split('/');
        const fromPath = pathParts.find(p => p.startsWith('UD') && p.length > 4);
        if (fromPath) return fromPath;
        // 2. From context
        if (user?.msUserId) return user.msUserId;
        // 3. From sessionStorage
        try {
            const stored = sessionStorage.getItem('medisphere_user');
            if (stored) return JSON.parse(stored)?.msUserId || '';
        } catch { return ''; }
        return '';
    };

    const doctorId = getActiveDoctorId();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const displayName = user?.name || `Dr. (${doctorId})`;

    return (
        <nav className="nav_donv">
            <div className="logo_donv">
                <div className="logoIcon_donv">+</div>
                <span>MediSphere <strong>Pro</strong></span>
            </div>

            <div className="links_donv">
                <NavLink to={`/doctor/dashboard/${doctorId}`} className={({ isActive }) => isActive ? 'link_donv active' : 'link_donv'}>
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to={`/doctor/appointments/${doctorId}`} className={({ isActive }) => isActive ? 'link_donv active' : 'link_donv'}>
                    <ClipboardList size={18} /> Appointments
                </NavLink>
                <NavLink to={`/doctor/schedule/${doctorId}`} className={({ isActive }) => isActive ? 'link_donv active' : 'link_donv'}>
                    <CalendarDays size={18} /> Schedule
                </NavLink>
                <NavLink to={`/doctor/patients/${doctorId}`} className={({ isActive }) => isActive ? 'link_donv active' : 'link_donv'}>
                    <Users size={18} /> Patients
                </NavLink>
                <NavLink to={`/doctor/reports/${doctorId}`} className={({ isActive }) => isActive ? 'link_donv active' : 'link_donv'}>
                    <FileText size={18} /> Reports
                </NavLink>
            </div>

            <div className="profile_donv">
                <div className="info_donv">
                    <span className="name_donv">{displayName}</span>
                    <span className="role_donv">Doctor</span>
                </div>
                <Link to={`/doctor/profile/${doctorId}`} className="avatar_donv">
                    <UserCircle size={24} />
                </Link>
                <button className="logout_donv" title="Logout" onClick={handleLogout}>
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
};

export default DoctorNavbar_donv;
