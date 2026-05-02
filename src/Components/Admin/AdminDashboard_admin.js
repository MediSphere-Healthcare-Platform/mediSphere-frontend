import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, FileText, ChevronRight, Activity, TrendingUp } from 'lucide-react';
import { adminApi } from '../../services/api';
import './Admin_admin.css';

const AdminDashboard_admin = () => {
    const [stats, setStats] = useState({
        pending: 0,
        total: 0,
        approved: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [pendingRes, reportRes] = await Promise.all([
                    adminApi.get('/doctors/pending'),
                    adminApi.get('/reports/doctors')
                ]);
                
                setStats({
                    pending: pendingRes.data.data?.length || 0,
                    total: reportRes.data.data?.total || 0,
                    approved: reportRes.data.data?.approved || 0
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="container_admin">
            <header className="header_admin">
                <h1 className="title_admin">Admin Overview</h1>
                <p className="subtitle_admin">Manage doctor registrations and view system metrics.</p>
            </header>

            <div className="statsGrid_admin">
                <Link to="/admin/approvals" className="statCard_admin">
                    <div className="statIconContainer_admin statIconContainer_indigo_admin">
                        <UserPlus size={24} />
                    </div>
                    <div className="statInfo_admin">
                        <h3>Pending Approvals</h3>
                        <p>{loading ? '...' : stats.pending}</p>
                    </div>
                    <ChevronRight className="statArrow_admin" size={20} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                </Link>

                <Link to="/admin/reports" className="statCard_admin">
                    <div className="statIconContainer_admin statIconContainer_emerald_admin">
                        <Users size={24} />
                    </div>
                    <div className="statInfo_admin">
                        <h3>Total Registered</h3>
                        <p>{loading ? '...' : stats.total}</p>
                    </div>
                    <ChevronRight className="statArrow_admin" size={20} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                </Link>

                <Link to="/admin/reports" className="statCard_admin">
                    <div className="statIconContainer_admin statIconContainer_blue_admin">
                        <Activity size={24} />
                    </div>
                    <div className="statInfo_admin">
                        <h3>Approved Doctors</h3>
                        <p>{loading ? '...' : stats.approved}</p>
                    </div>
                    <ChevronRight className="statArrow_admin" size={20} color="#94a3b8" style={{ marginLeft: 'auto' }} />
                </Link>
            </div>

            <div className="card_admin">
                <div className="cardHeader_admin">
                    <h2 className="cardTitle_admin">System Quick Actions</h2>
                </div>
                <div className="cardBody_admin" style={{ padding: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <Link to="/admin/approvals" className="btn_admin btnApprove_admin">
                        Review Registrations
                    </Link>
                    <Link to="/admin/reports" className="btn_admin" style={{ background: '#f1f5f9', color: '#475569' }}>
                        View Detailed Reports
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard_admin;
