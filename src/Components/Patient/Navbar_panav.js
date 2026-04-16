import React from 'react';
import { Link } from 'react-router-dom';
import { Home, User, Calendar, History, FileText, Pill, Video, LogOut } from 'lucide-react';
import './Navbar_panav.css';

const Navbar_panav = () => {
    return (
        <nav className="nav_panav">
            <div className="logo_panav">
                <div className="logoIcon_panav">+</div>
                <span>MediSphere</span>
            </div>
            
            <div className="links_panav">
                <Link to="/" className="link_panav"><Home size={18} /> Dashboard</Link>
                <Link to="/book" className="link_panav"><Calendar size={18} /> Book</Link>
                <Link to="/history" className="link_panav"><History size={18} /> History</Link>
                <Link to="/reports" className="link_panav"><FileText size={18} /> Reports</Link>
                <Link to="/prescriptions" className="link_panav"><Pill size={18} /> Prescriptions</Link>
                <Link to="/consult" className="link_panav"><Video size={18} /> Consult</Link>
            </div>

            <div className="profile_panav">
                <div className="userInfo_panav">
                    <span className="userName_panav">John Doe</span>
                    <span className="userRole_panav">Patient</span>
                </div>
                <Link to="/profile" className="avatar_panav">
                    <User size={20} />
                </Link>
                <button className="logoutBtn_panav" title="Logout">
                    <LogOut size={18} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar_panav;
