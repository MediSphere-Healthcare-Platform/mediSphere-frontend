import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Users, FileText, ClipboardList, UserCircle, LogOut } from 'lucide-react';
import './DoctorNavbar_donv.css';

const DoctorNavbar_donv = () => {
    return (
        <nav className="nav_donv">
            <div className="logo_donv">
                <div className="logoIcon_donv">+</div>
                <span>MediSphere <strong>Pro</strong></span>
            </div>
            
            <div className="links_donv">
                <NavLink to="/doctor" end className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <LayoutDashboard size={18} /> Dashboard
                </NavLink>
                <NavLink to="/doctor/appointments" className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <ClipboardList size={18} /> Appointments
                </NavLink>
                <NavLink to="/doctor/schedule" className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <CalendarDays size={18} /> Schedule
                </NavLink>
                <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <Users size={18} /> Patients
                </NavLink>
                <NavLink to="/doctor/reports" className={({ isActive }) => isActive ? "link_donv active" : "link_donv"}>
                    <FileText size={18} /> Reports
                </NavLink>
            </div>

            <div className="profile_donv">
                <div className="info_donv">
                    <span className="name_donv">Dr. Sarah Smith</span>
                    <span className="role_donv">Cardiologist</span>
                </div>
                <Link to="/doctor/profile" className="avatar_donv">
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
