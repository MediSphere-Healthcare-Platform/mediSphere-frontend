import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Pill, Printer, Download, Calendar, User, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { telemedicineApi } from '../../services/api';
import './PatientPrescriptions_paprescription.css';

const PatientPrescriptions_paprescription = () => {
    const { patientId } = useParams();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPrescriptions = async () => {
            try {
                const res = await telemedicineApi.get(`prescriptions/patient/${patientId}`);
                setPrescriptions(res.data || []);
            } catch (err) {
                console.error('[Prescriptions] Fetch error:', err);
                setError('Could not load prescriptions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        if (patientId) fetchPrescriptions();
    }, [patientId]);

    if (loading) {
        return (
            <div className="container_paprescription">
                <div className="hero_paprescription">
                    <div className="heroContent_paprescription">
                        <h1>Medication <span>Management</span></h1>
                    </div>
                    <div className="heroOverlay_paprescription"></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader2 size={36} className="animate-spin" style={{ color: '#4299e1' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="container_paprescription">
            {/* Hero Section */}
            <div className="hero_paprescription">
                <div className="heroContent_paprescription">
                    <h1>Medication <span>Management</span></h1>
                    <p>Access your digital prescriptions, dosage instructions, and history in a single view.</p>
                </div>
                <div className="heroOverlay_paprescription"></div>
            </div>

            {error && (
                <div style={{ margin: '20px auto', maxWidth: '800px', padding: '15px', background: '#fff5f5', borderRadius: '8px', color: '#c53030', border: '1px solid #feb2b2' }}>
                    {error}
                </div>
            )}

            <div className="list_paprescription">
                {prescriptions.length === 0 && !error ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#718096' }}>
                        <Pill size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                        <p>No prescriptions found. Prescriptions issued by your doctor after a telemedicine session will appear here.</p>
                    </div>
                ) : (
                    prescriptions.map((pres) => (
                        <div key={pres.prescriptionId} className="card_paprescription">
                            <div className="cardHeader_paprescription">
                                <div className="docMeta_paprescription">
                                    <span className="idBadge_paprescription">{pres.prescriptionId?.slice(0, 8).toUpperCase()}</span>
                                    <h3>{pres.diagnosis}</h3>
                                </div>
                                <div className="actions_paprescription">
                                    <button title="Print" onClick={() => window.print()}><Printer size={18} /></button>
                                </div>
                            </div>

                            <div className="metaGrid_paprescription">
                                <div className="metaItem_paprescription">
                                    <User size={14} /> <span>Dr. {pres.doctorId}</span>
                                </div>
                                <div className="metaItem_paprescription">
                                    <Calendar size={14} />
                                    <span>{pres.issuedAt ? new Date(pres.issuedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="medSection_paprescription">
                                <h4><Pill size={16} /> Medications</h4>
                                <table className="medTable_paprescription">
                                    <thead>
                                        <tr>
                                            <th>Medicine</th>
                                            <th>Dosage</th>
                                            <th>Frequency</th>
                                            <th>Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(pres.medications || []).map((med, idx) => (
                                            <tr key={idx}>
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
                                <div className="notes_paprescription">
                                    <h4><FileText size={16} /> Doctor's Note</h4>
                                    <p>{pres.instructions}</p>
                                </div>
                            )}

                            <div className="warning_paprescription">
                                <AlertTriangle size={14} />
                                <span>Follow the dosage instructions carefully. Consult your doctor if symptoms persist.</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientPrescriptions_paprescription;
