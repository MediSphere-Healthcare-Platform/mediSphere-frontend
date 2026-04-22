import React, { useState, useEffect } from 'react';
import { Mail, Phone, Award, Search, Loader2, User, ChevronDown, Users, Check, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import './Admin_admin.css';

const DoctorReports_admin = () => {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await adminApi.get('/reports/doctors');
                setStats(response.data.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
            } catch (error) {
                console.error('Failed to fetch doctor reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) return (
        <div className="loadingContainer_admin">
            <Loader2 className="spinner_admin animate-spin" size={40} />
            <p>Generating reports...</p>
        </div>
    );

    return (
        <div className="container_admin">
            <header className="header_admin">
                <h1 className="title_admin">Doctor Statistics</h1>
                <p className="subtitle_admin">Overview of registration statuses and system growth.</p>
            </header>

            <div className="statsGrid_admin">
                <div className="statCard_admin" style={{ cursor: 'default' }}>
                    <div className="statIconContainer_admin statIconContainer_blue_admin">
                        <Users size={24} />
                    </div>
                    <div className="statInfo_admin">
                        <h3>Total Requests</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>

                <div className="statCard_admin" style={{ cursor: 'default' }}>
                    <div className="statIconContainer_admin statIconContainer_indigo_admin">
                        <User size={24} />
                    </div>
                    <div className="statInfo_admin">
                        <h3>Pending</h3>
                        <p>{stats.pending}</p>
                    </div>
                </div>

                <div className="statCard_admin" style={{ cursor: 'default' }}>
                    <div className="statIconContainer_admin statIconContainer_emerald_admin">
                        <Check size={24} />
                    </div>
                    <div className="statInfo_admin">
                        <h3>Approved</h3>
                        <p>{stats.approved}</p>
                    </div>
                </div>

                <div className="statCard_admin" style={{ cursor: 'default' }}>
                    <div className="statIconContainer_admin" style={{ background: '#fef2f2', color: '#dc2626' }}>
                        <X size={24} />
                    </div>
                    <div className="statInfo_admin">
                        <h3>Rejected</h3>
                        <p>{stats.rejected}</p>
                    </div>
                </div>
            </div>

            <div className="card_admin">
                <div className="cardHeader_admin">
                    <h1 className="cardTitle_admin">Registration Distribution</h1>
                </div>
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                        { label: 'Approved', value: stats.approved, total: stats.total, color: '#10b981' },
                        { label: 'Pending', value: stats.pending, total: stats.total, color: '#6366f1' },
                        { label: 'Rejected', value: stats.rejected, total: stats.total, color: '#ef4444' }
                    ].map(item => (
                        <div key={item.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                                <span>{item.label}</span>
                                <span>{item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%</span>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    background: item.color, 
                                    width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`,
                                    transition: 'width 1s ease-out'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoctorReports_admin;
