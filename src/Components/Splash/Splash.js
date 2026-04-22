import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Shield, Calendar, Users, Heart,
    CheckCircle, Star, ChevronDown, Activity
} from 'lucide-react';
import './Splash.css';

const Splash = () => {

    // Scroll reveal observer
    const revealRefs = useRef([]);
    revealRefs.current = [];

    const addToRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible_splash');
                    }
                });
            },
            { threshold: 0.1 }
        );
        revealRefs.current.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="splash-page_splash">

            {/* ─── HERO SECTION ─────────────────────────────────── */}
            <section className="hero_splash">
                <div className="hero-bg-image_splash"></div>
                <div className="hero-overlay_splash"></div>

                {/* Floating particles */}
                <div className="particles_splash">
                    {[...Array(12)].map((_, i) => (
                        <span key={i} className={`particle_splash p${i + 1}_splash`}></span>
                    ))}
                </div>

                <div className="hero-content_splash reveal_splash" ref={addToRefs}>
                    <div className="hero-eyebrow_splash">
                        <Activity size={16} /> Trusted by 10,000+ patients across Sri Lanka
                    </div>
                    <h1 className="hero-headline_splash">
                        Healthcare That <br />
                        <span className="gradient-text_splash">Moves With You</span>
                    </h1>
                    <p className="hero-description_splash">
                        MediSphere unites patients, specialists, and administrators on one
                        seamless digital platform — delivering world-class care without boundaries.
                    </p>
                    <div className="hero-ctas_splash">
                        <Link to="/register" className="btn-primary_splash">
                            Get Started Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="btn-ghost_splash">
                            Sign In
                        </Link>
                    </div>
                    <div className="hero-stats_splash">
                        <div className="stat_splash">
                            <strong>50+</strong><span>Specialists</span>
                        </div>
                        <div className="stat-divider_splash"></div>
                        <div className="stat_splash">
                            <strong>10K+</strong><span>Patients</span>
                        </div>
                        <div className="stat-divider_splash"></div>
                        <div className="stat_splash">
                            <strong>4.9★</strong><span>Rating</span>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="hero-image-floater_splash reveal_splash" ref={addToRefs}>
                    <img
                        src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=900&q=80"
                        alt="Modern healthcare professional"
                        className="hero-img_splash"
                    />
                </div>

                <a href="#features" className="scroll-hint_splash">
                    <ChevronDown size={24} />
                </a>
            </section>

            {/* ─── FEATURES SECTION ─────────────────────────────── */}
            <section id="features" className="features-section_splash">
                <div className="section-inner_splash">
                    <div className="section-label_splash reveal_splash" ref={addToRefs}>Our Platform</div>
                    <h2 className="section-title_splash reveal_splash" ref={addToRefs}>
                        Everything you need, <br /><span>in one place</span>
                    </h2>

                    <div className="features-grid_splash">
                        {[
                            {
                                icon: <Shield size={28} />,
                                color: '#2563eb',
                                bg: '#eff6ff',
                                title: 'Bank-Grade Security',
                                desc: 'Your medical data is encrypted end-to-end and stored with full HIPAA-grade compliance.'
                            },
                            {
                                icon: <Calendar size={28} />,
                                color: '#7c3aed',
                                bg: '#f5f3ff',
                                title: 'Smart Scheduling',
                                desc: 'AI-powered appointment booking that adapts to doctor availability in real-time.'
                            },
                            {
                                icon: <Users size={28} />,
                                color: '#0891b2',
                                bg: '#ecfeff',
                                title: 'Global Specialist Network',
                                desc: 'Connect instantly with certified specialists across every medical discipline.'
                            },
                            {
                                icon: <Heart size={28} />,
                                color: '#dc2626',
                                bg: '#fef2f2',
                                title: 'Holistic Patient Journey',
                                desc: 'From consultations to prescriptions, track every aspect of your healthcare journey.'
                            }
                        ].map((f, i) => (
                            <div className="feature-card_splash reveal_splash" ref={addToRefs} key={i}
                                style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="feat-icon_splash" style={{ background: f.bg, color: f.color }}>
                                    {f.icon}
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── SPLIT SECTION: PATIENTS ─────────────────────── */}
            <section className="split-section_splash split-light_splash">
                <div className="split-image_splash">
                    <img
                        src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=800&q=80"
                        alt="Patient using app"
                    />
                    <div className="image-badge_splash">
                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                        <span>Top Rated Experience</span>
                    </div>
                </div>
                <div className="split-content_splash reveal_splash" ref={addToRefs}>
                    <div className="section-label_splash label-green_splash">For Patients</div>
                    <h2>Your health journey, <span>simplified</span></h2>
                    <p>
                        Book appointments, view your medical history, access prescriptions,
                        and join telemedicine sessions — all from one beautifully designed dashboard.
                    </p>
                    <ul className="check-list_splash">
                        <li><CheckCircle size={18} /> Book specialists in under 60 seconds</li>
                        <li><CheckCircle size={18} /> View reports and prescriptions instantly</li>
                        <li><CheckCircle size={18} /> Join secure video consultations</li>
                        <li><CheckCircle size={18} /> Manage your complete health history</li>
                    </ul>
                    <Link to="/register" className="btn-primary_splash">
                        Register as Patient <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* ─── SPLIT SECTION: DOCTORS ──────────────────────── */}
            <section className="split-section_splash split-dark_splash">
                <div className="split-content_splash split-content-right_splash reveal_splash" ref={addToRefs}>
                    <div className="section-label_splash label-blue_splash">For Doctors</div>
                    <h2>Practise smarter, <span>not harder</span></h2>
                    <p>
                        Manage your schedule, view patient records, issue digital prescriptions,
                        and grow your practice on a platform built for the modern clinician.
                    </p>
                    <ul className="check-list_splash">
                        <li><CheckCircle size={18} /> Real-time appointment management</li>
                        <li><CheckCircle size={18} /> Digital prescription and report tools</li>
                        <li><CheckCircle size={18} /> Telemedicine session integration</li>
                        <li><CheckCircle size={18} /> Admin-verified registration process</li>
                    </ul>
                    <Link to="/register" className="btn-white_splash">
                        Apply as Doctor <ArrowRight size={18} />
                    </Link>
                </div>
                <div className="split-image_splash reveal_splash" ref={addToRefs}>
                    <img
                        src="https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?auto=format&fit=crop&w=800&q=80"
                        alt="Doctor using digital device"
                    />
                </div>
            </section>

            {/* ─── TESTIMONIALS ─────────────────────────────────── */}
            <section className="testimonials-section_splash">
                <div className="section-inner_splash">
                    <div className="section-label_splash reveal_splash" ref={addToRefs}>Testimonials</div>
                    <h2 className="section-title_splash reveal_splash" ref={addToRefs}>
                        Trusted by thousands
                    </h2>
                    <div className="testimonials-grid_splash">
                        {[
                            {
                                quote: "MediSphere completely changed how I manage my health. Booking a specialist used to take weeks — now it takes seconds.",
                                name: "Amara S.",
                                role: "Patient",
                                img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=100&q=80"
                            },
                            {
                                quote: "As a cardiologist, the scheduling and telemedicine tools are exceptional. My patient workflow has never been smoother.",
                                name: "Dr. Nuwan R.",
                                role: "Cardiologist",
                                img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=100&q=80"
                            },
                            {
                                quote: "The admin dashboard gives us complete visibility into doctor registrations and platform reports. Absolutely essential.",
                                name: "Priya M.",
                                role: "System Administrator",
                                img: "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=100&q=80"
                            }
                        ].map((t, i) => (
                            <div className="testimonial-card_splash reveal_splash" ref={addToRefs} key={i}>
                                <div className="stars_splash">
                                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="#f59e0b" color="#f59e0b" />)}
                                </div>
                                <p>"{t.quote}"</p>
                                <div className="testimonial-author_splash">
                                    <img src={t.img} alt={t.name} />
                                    <div>
                                        <strong>{t.name}</strong>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CTA BAND ─────────────────────────────────────── */}
            <section className="cta-band_splash">
                <div className="cta-band-inner_splash reveal_splash" ref={addToRefs}>
                    <h2>Ready to experience <span>better healthcare?</span></h2>
                    <p>Join thousands of patients and doctors already using MediSphere.</p>
                    <div className="cta-band-btns_splash">
                        <Link to="/register" className="btn-primary_splash">
                            Create Free Account <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn-white_splash">
                            Member Login
                        </Link>
                    </div>
                </div>
                <div className="cta-band-image_splash">
                    <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                        alt="Healthcare team"
                    />
                </div>
            </section>


        </div>
    );
};

export default Splash;
