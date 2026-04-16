import React from 'react';
import { Heart, Mail, Phone, MapPin, Globe, Share2, Camera } from 'lucide-react';
import './Footer_pafoot.css';

const Footer_pafoot = () => {
    return (
        <footer className="footer_pafoot">
            <div className="content_pafoot">
                <div className="section_pafoot branding_pafoot">
                    <div className="logo_pafoot">+ MediSphere</div>
                    <p>Your trusted partner in digital healthcare. Providing accessible records and consultations anytime, anywhere.</p>
                </div>
                
                <div className="section_pafoot">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Dashboard</a></li>
                        <li><a href="/book">Book Appointment</a></li>
                        <li><a href="/history">Medical History</a></li>
                        <li><a href="/reports">Reports</a></li>
                    </ul>
                </div>

                <div className="section_pafoot">
                    <h4>Contact Us</h4>
                    <ul className="contact_pafoot">
                        <li><Phone size={16} /> +94 11 234 5678</li>
                        <li><Mail size={16} /> support@medisphere.com</li>
                        <li><MapPin size={16} /> 123 Healthcare Ave, Colombo</li>
                    </ul>
                </div>

                <div className="section_pafoot">
                    <h4>Follow Us</h4>
                    <div className="socials_pafoot">
                        <Globe size={20} />
                        <Share2 size={20} />
                        <Camera size={20} />
                    </div>
                </div>
            </div>
            
            <div className="bottom_pafoot">
                <p>&copy; 2026 MediSphere Healthcare. Made with <Heart size={14} fill="currentColor" /> for better health.</p>
            </div>
        </footer>
    );
};

export default Footer_pafoot;
