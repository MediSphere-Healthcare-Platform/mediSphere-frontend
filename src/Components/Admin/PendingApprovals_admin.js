import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, User, Award, Image, ExternalLink } from 'lucide-react';
import { adminApi } from '../../services/api';
import './Admin_admin.css';

const PendingApprovals_admin = () => {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [licenceModal, setLicenceModal] = useState(null); // holds licenseUrl to display

    const fetchPending = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get('/doctors/pending');
            setPendingDoctors(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch pending doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleApprove = async (id) => {
        try {
            setProcessingId(id);
            await adminApi.put(`/doctors/${id}/approve`);
            setPendingDoctors(prev => prev.filter(doc => doc.id !== id));
        } catch (error) {
            alert('Failed to approve doctor. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectClick = (doctor) => {
        setSelectedDoctor(doctor);
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) return alert('Please provide a reason for rejection.');
        try {
            setProcessingId(selectedDoctor.id);
            await adminApi.put(`/doctors/${selectedDoctor.id}/reject`, {
                rejectionReason: rejectionReason
            });
            setPendingDoctors(prev => prev.filter(doc => doc.id !== selectedDoctor.id));
            setShowRejectModal(false);
        } catch (error) {
            alert('Failed to reject doctor. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    /* Helper — decide how to handle the licenseUrl value */
    const isValidUrl = (val) => {
        try { return val && new URL(val) && true; }
        catch { return false; }
    };

    const handleViewLicence = (doctor) => {
        const url = doctor.licenseUrl || doctor.drLicence;
        if (!url) { alert('No licence document available.'); return; }
        if (isValidUrl(url)) {
            setLicenceModal(url);
        } else {
            alert('Licence URL is not available yet (stored as filename only).');
        }
    };

    if (loading) return (
        <div className="loadingContainer_admin">
            <Loader2 className="spinner_admin animate-spin" size={40} />
            <p>Fetching pending requests...</p>
        </div>
    );

    return (
        <div className="container_admin">
            <header className="header_admin">
                <h1 className="title_admin">Pending Approvals</h1>
                <p className="subtitle_admin">Review registration requests from new medical professionals.</p>
            </header>

            <div className="card_admin">
                {pendingDoctors.length === 0 ? (
                    <div className="noData_admin">
                        <Check size={48} color="#059669" style={{ marginBottom: '1rem' }} />
                        <p>All caught up! No pending registrations.</p>
                    </div>
                ) : (
                    <table className="table_admin">
                        <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Specialty</th>
                                <th>Phone</th>
                                <th>Licence</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingDoctors.map(doctor => (
                                <tr key={doctor.id}>
                                    <td>
                                        <div className="doctorInfo_admin">
                                            <div className="avatar_admin">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <span className="doctorName_admin">Dr. {doctor.firstName} {doctor.lastName}</span>
                                                <span className="doctorEmail_admin">{doctor.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Award size={14} color="#6366f1" />
                                            <span>{doctor.specialty}</span>
                                        </div>
                                    </td>
                                    <td>{doctor.phone}</td>
                                    <td>
                                        <button
                                            onClick={() => handleViewLicence(doctor)}
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                                color: '#2563eb', background: 'rgba(37,99,235,0.08)',
                                                border: '1px solid rgba(37,99,235,0.2)', borderRadius: '8px',
                                                padding: '5px 12px', fontSize: '0.82rem', fontWeight: 600,
                                                cursor: 'pointer', transition: '0.2s'
                                            }}
                                        >
                                            <Image size={14} /> View Licence
                                        </button>
                                    </td>
                                    <td>
                                        <div className="actions_admin" style={{ justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn_admin btnApprove_admin"
                                                onClick={() => handleApprove(doctor.id)}
                                                disabled={processingId === doctor.id}
                                            >
                                                {processingId === doctor.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                                Approve
                                            </button>
                                            <button
                                                className="btn_admin btnReject_admin"
                                                onClick={() => handleRejectClick(doctor)}
                                                disabled={processingId === doctor.id}
                                            >
                                                <X size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ── Licence Image Lightbox ── */}
            {licenceModal && (
                <div
                    className="modalOverlay_admin"
                    onClick={() => setLicenceModal(null)}
                    style={{ zIndex: 1000 }}
                >
                    <div
                        className="modal_admin"
                        onClick={e => e.stopPropagation()}
                        style={{ maxWidth: '800px', width: '90vw', padding: '24px' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 className="modalTitle_admin" style={{ margin: 0 }}>Medical Licence</h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <a
                                    href={licenceModal}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}
                                >
                                    <ExternalLink size={14} /> Open Full Size
                                </a>
                                <button
                                    onClick={() => setLicenceModal(null)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <img
                            src={licenceModal}
                            alt="Medical Licence"
                            style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        />
                    </div>
                </div>
            )}

            {/* ── Reject Modal ── */}
            {showRejectModal && (
                <div className="modalOverlay_admin">
                    <div className="modal_admin">
                        <h2 className="modalTitle_admin">Reject Registration</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Please provide a reason for rejecting Dr. {selectedDoctor.firstName}'s request. This will be sent to their email.
                        </p>
                        <textarea
                            className="textarea_admin"
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <div className="modalActions_admin">
                            <button className="btn_admin btnCancel_admin" onClick={() => setShowRejectModal(false)}>Cancel</button>
                            <button className="btn_admin btnReject_admin" onClick={handleRejectSubmit}>Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingApprovals_admin;
