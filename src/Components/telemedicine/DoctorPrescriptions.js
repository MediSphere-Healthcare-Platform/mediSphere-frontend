import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { telemedicineApi } from '../../services/api';
import {
    FileText, Edit2, Trash2, Plus, X, Save,
    User, Calendar, CheckCircle, Loader2, Pill
} from 'lucide-react';
import './DoctorPrescriptions.css';

const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '' };

const DoctorPrescriptions = () => {
    const { doctorId } = useParams();

    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit modal state
    const [editTarget, setEditTarget] = useState(null); // the prescription being edited
    const [editForm, setEditForm] = useState({ diagnosis: '', medications: [], instructions: '' });
    const [saving, setSaving] = useState(false);

    // ── Fetch ──────────────────────────────────────────────────
    const fetchPrescriptions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await telemedicineApi.get(`/prescriptions/doctor/${doctorId}`);
            setPrescriptions(res.data || []);
        } catch (err) {
            console.error('[DoctorPrescriptions] fetch error:', err);
            setError('Failed to load prescriptions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (doctorId) fetchPrescriptions();
    }, [doctorId]);

    // ── Delete ─────────────────────────────────────────────────
    const handleDelete = async (prescriptionId) => {
        if (!window.confirm('Are you sure you want to permanently delete this prescription?')) return;
        try {
            await telemedicineApi.delete(`/prescriptions/${prescriptionId}`);
            setPrescriptions(prev => prev.filter(p => p.prescriptionId !== prescriptionId));
        } catch (err) {
            alert('Failed to delete prescription. ' + (err.response?.data?.message || ''));
        }
    };

    // ── Edit helpers ───────────────────────────────────────────
    const openEdit = (pres) => {
        setEditTarget(pres);
        setEditForm({
            diagnosis: pres.diagnosis || '',
            medications: pres.medications?.length
                ? pres.medications.map(m => ({ ...m }))
                : [{ ...EMPTY_MED }],
            instructions: pres.instructions || ''
        });
    };

    const closeEdit = () => { setEditTarget(null); };

    const handleMedChange = (idx, field, value) => {
        setEditForm(prev => {
            const meds = [...prev.medications];
            meds[idx] = { ...meds[idx], [field]: value };
            return { ...prev, medications: meds };
        });
    };

    const addMed = () =>
        setEditForm(prev => ({ ...prev, medications: [...prev.medications, { ...EMPTY_MED }] }));

    const removeMed = (idx) =>
        setEditForm(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== idx)
        }));

    // ── Save edit ──────────────────────────────────────────────
    const handleSave = async () => {
        const validMeds = editForm.medications.filter(m => m.name.trim());
        if (!editForm.diagnosis.trim()) { alert('Diagnosis is required.'); return; }
        if (validMeds.length === 0) { alert('At least one medication with a name is required.'); return; }

        setSaving(true);
        try {
            const res = await telemedicineApi.put(`/prescriptions/${editTarget.prescriptionId}`, {
                diagnosis: editForm.diagnosis.trim(),
                medications: validMeds,
                instructions: editForm.instructions.trim()
            });
            setPrescriptions(prev =>
                prev.map(p => p.prescriptionId === editTarget.prescriptionId ? res.data : p)
            );
            closeEdit();
        } catch (err) {
            alert('Failed to update prescription. ' + (err.response?.data?.message || ''));
        } finally {
            setSaving(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="container_docprescriptions">
            <div className="hero_docprescriptions">
                <h1><FileText size={26} /> My Issued Prescriptions</h1>
                <p>View, edit or delete prescriptions you have issued to patients.</p>
            </div>

            {error && (
                <div className="prescriptions_error_banner">
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: '14px', color: '#94a3b8' }}>
                    <Loader2 size={36} style={{ color: '#3b82f6', animation: 'pres_spin 0.9s linear infinite' }} />
                    <span style={{ fontSize: '0.93rem' }}>Loading prescriptions...</span>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="empty_state">
                    <Pill size={52} />
                    <p>No prescriptions issued yet. They'll appear here after you complete a telemedicine session.</p>
                </div>
            ) : (
                <div className="prescriptions_grid">
                    {prescriptions.map(pres => (
                        <div key={pres.prescriptionId} className="pres_card">
                            <div className="pres_card_header">
                                <div className="pres_card_title">
                                    <h3>
                                        <span className="pres_id_badge">
                                            {pres.prescriptionId?.slice(0, 8).toUpperCase()}
                                        </span>
                                        &nbsp;&nbsp;{pres.diagnosis}
                                    </h3>
                                    <div className="pres_meta_row">
                                        <span className="pres_meta_item">
                                            <User size={13} /> Patient: {pres.patientId}
                                        </span>
                                        <span className="pres_meta_item">
                                            <Calendar size={13} />
                                            {pres.issuedAt
                                                ? new Date(pres.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="pres_card_actions">
                                    <button className="btn_pres_edit" onClick={() => openEdit(pres)}>
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button className="btn_pres_delete" onClick={() => handleDelete(pres.prescriptionId)}>
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>

                            <div className="pres_card_body">
                                <div className="med_table_wrap">
                                    <table className="med_table">
                                        <thead>
                                            <tr>
                                                <th>Medicine</th>
                                                <th>Dosage</th>
                                                <th>Frequency</th>
                                                <th>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(pres.medications || []).map((med, i) => (
                                                <tr key={i}>
                                                    <td><strong>{med.name}</strong></td>
                                                    <td>{med.dosage || '—'}</td>
                                                    <td>{med.frequency || '—'}</td>
                                                    <td>{med.duration || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {pres.instructions && (
                                    <div className="pres_instructions">
                                        📝 {pres.instructions}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Edit Modal ── */}
            {editTarget && (
                <div className="modal_overlay" onClick={closeEdit}>
                    <div className="modal_box" onClick={e => e.stopPropagation()}>
                        <div className="modal_header">
                            <h2><Edit2 size={18} /> Edit Prescription</h2>
                            <button className="btn_modal_close" onClick={closeEdit}><X size={16} /></button>
                        </div>

                        <div className="form_group_modal">
                            <label>Diagnosis *</label>
                            <input
                                type="text"
                                value={editForm.diagnosis}
                                onChange={e => setEditForm(f => ({ ...f, diagnosis: e.target.value }))}
                                placeholder="e.g. Viral Fever"
                            />
                        </div>

                        <div className="edit_med_section">
                            <h4><Pill size={15} /> Medications</h4>
                            {editForm.medications.map((med, idx) => (
                                <div key={idx} className="edit_med_row">
                                    <input
                                        placeholder="Medicine name"
                                        value={med.name}
                                        onChange={e => handleMedChange(idx, 'name', e.target.value)}
                                    />
                                    <input
                                        placeholder="Dosage"
                                        value={med.dosage}
                                        onChange={e => handleMedChange(idx, 'dosage', e.target.value)}
                                    />
                                    <input
                                        placeholder="Frequency"
                                        value={med.frequency}
                                        onChange={e => handleMedChange(idx, 'frequency', e.target.value)}
                                    />
                                    <input
                                        placeholder="Duration"
                                        value={med.duration}
                                        onChange={e => handleMedChange(idx, 'duration', e.target.value)}
                                    />
                                    {editForm.medications.length > 1 && (
                                        <button className="btn_remove_med_modal" onClick={() => removeMed(idx)}>
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className="btn_add_med_modal" onClick={addMed}>
                                <Plus size={14} /> Add Medication
                            </button>
                        </div>

                        <div className="form_group_modal">
                            <label>Instructions</label>
                            <textarea
                                rows={3}
                                value={editForm.instructions}
                                onChange={e => setEditForm(f => ({ ...f, instructions: e.target.value }))}
                                placeholder="e.g. Take after meals, get plenty of rest."
                            />
                        </div>

                        <div className="modal_footer">
                            <button className="btn_cancel_modal" onClick={closeEdit}>Cancel</button>
                            <button className="btn_save_modal" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 size={15} /> : <Save size={15} />}
                                {saving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPrescriptions;
