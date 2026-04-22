import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Layout, LogOut, CheckCircle, PieChart, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminNavbar_admin.css';

const AdminNavbar_admin = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar_admin">
            <div className="navBrand_admin">
                <Layout className="brandIcon_admin" size={24} />
                <span className="brandText_admin">MediSphere <span className="brandBadge_admin">Admin</span></span>
            </div>

            <div className="navLinks_admin">
                <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'navLink_admin active_admin' : 'navLink_admin'}>
                    <PieChart size={18} className="linkIcon_admin" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/admin/approvals" className={({ isActive }) => isActive ? 'navLink_admin active_admin' : 'navLink_admin'}>
                    <CheckCircle size={18} className="linkIcon_admin" />
                    <span>Approvals</span>
                </NavLink>
                <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'navLink_admin active_admin' : 'navLink_admin'}>
                    <Users size={18} className="linkIcon_admin" />
                    <span>Doctor Reports</span>
                </NavLink>
            </div>

            <button onClick={handleLogout} className="logoutBtn_admin">
                <LogOut size={18} className="linkIcon_admin" />
                <span>Logout</span>
            </button>
        </nav>
    );
};

export default AdminNavbar_admin;
