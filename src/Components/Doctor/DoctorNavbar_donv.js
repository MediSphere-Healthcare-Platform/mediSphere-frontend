import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, FileText, ClipboardList, UserCircle, LogOut } from 'lucide-react';
import { doctorApi } from '../../services/api';
import './DoctorNavbar_donv.css';

const DoctorNavbar_donv = () => {
    const location = useLocation();
    const [doctorInfo, setDoctorInfo] = useState(null);
    const defaultDoctorId = "UD102616";

    // Helper to get ID from URL or Storage
    const getActiveDoctorId = () => {
        // 1. Try to find UD pattern in any segment of the URL
        const pathParts = location.pathname.split('/');
        const idFromUrl = pathParts.find(part => part.startsWith('UD') && part.length > 5);
        
        if (idFromUrl) {
            sessionStorage.setItem('currentDoctorId', idFromUrl);
            return idFromUrl;
        }

        // 2. Fallback to Session Storage
        const savedId = sessionStorage.getItem('currentDoctorId');
        if (savedId) return savedId;

        // 3. Fallback to default
        return defaultDoctorId;
    };

    const currentDoctorId = getActiveDoctorId();

    useEffect(() => {
        const fetchDoctorInfo = async () => {
            try {
                const response = await doctorApi.get(`/getDoctorById/${currentDoctorId}`);
                setDoctorInfo(response.data.data);
            } catch (err) {
                console.error('Error fetching navbar doctor info:', err);
            }
        };

        fetchDoctorInfo();
    }, [currentDoctorId]);

    // Helper for generating dynamic links
    const getLink = (basePath) => `${basePath}/${currentDoctorId}`;

    return (
        <nav className="nav_donv">
            <div className="logo_donv">
                <div className="logoIcon_donv">+</div>
                <span>MediSphere <strong>Pro</strong></span>
            </div>
            
            <div className="links_donv">
                <NavLink to={getLink('/doctor/dashboard')} end className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to={getLink('/doctor/appointments')} className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <ClipboardList size={18} /> Appointments
                </NavLink>
                <NavLink to={getLink('/doctor/schedule')} className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <CalendarDays size={18} /> Schedule
                </NavLink>
                <NavLink to={getLink('/doctor/patients')} className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <Users size={18} /> Patients
                </NavLink>
                <NavLink to={getLink('/doctor/reports')} className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <FileText size={18} /> Reports
                </NavLink>
            </div>

            <div className="profile_donv">
                <div className="info_donv">
                    <span className="name_donv">Dr. {doctorInfo?.firstName || 'Sarah'} {doctorInfo?.lastName || 'Smith'}</span>
                    <span className="role_donv">{doctorInfo?.specialty || 'Medical Specialist'}</span>
                </div>
                <Link to={getLink('/doctor/profile')} className="avatar_donv">
                    <UserCircle size={24} />
                </Link>
                <button className="logout_donv" title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
};

export default DoctorNavbar_donv;
