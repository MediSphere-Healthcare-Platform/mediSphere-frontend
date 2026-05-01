import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Plus, Trash2, CheckCircle, Pill, Loader2 } from 'lucide-react';
import './PrescribeMedicine.css';

const PrescribeMedicine = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [diagnosis, setDiagnosis] = useState('');
    const [instructions, setInstructions] = useState('');
    const [medications, setMedications] = useState([
        { name: '', dosage: '', frequency: '', duration: '' }
    ]);
    const [submitting, setSubmitting] = useState(false);

    const handleMedicationChange = (index, field, value) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
    };

    const removeMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validMeds = medications.filter(m => m.name.trim() !== '');
        if (validMeds.length === 0) {
            alert("Please add at least one medication.");
            return;
        }

        setSubmitting(true);
        try {
            await telemedicineApi.post('prescriptions', {
                sessionId: sessionId,
                diagnosis: diagnosis,
                instructions: instructions,
                medications: validMeds
            });
            alert("Prescription issued successfully!");
            navigate(`/doctor/telemedicine/${user.msUserId}`);
        } catch (err) {
            console.error("Error issuing prescription:", err);
            alert("Failed to issue prescription. " + (err.response?.data?.message || ''));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container_prescribe">
            {/* Hero */}
            <div className="hero_prescribe">
                <div className="hero_prescribe_icon_wrap">
                    <FileText size={22} />
                </div>
                <div>
                    <div className="hero_prescribe_badge">Post-Consultation</div>
                    <h1>Issue Prescription</h1>
                    <p>
                        Provide diagnosis, medications, and instructions for the patient's follow-up care.
                    </p>
                    <div className="hero_prescribe_session_id">
                        Session: <span>{sessionId}</span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="prescribe_form">
                {/* Diagnosis */}
                <div className="form_group_prescribe">
                    <label>Diagnosis <span className="required_star">*</span></label>
                    <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="e.g. Viral Fever, Hypertension..."
                        required
                    />
                </div>

                {/* Medications */}
                <div className="medications_section">
                    <div className="medications_section_header">
                        <div className="med_section_icon"><Pill size={16} /></div>
                        <div>
                            <h3>Medications</h3>
                            <p>Add all prescribed medicines with dosage details</p>
                        </div>
                    </div>

                    <div className="med_col_labels">
                        <span>Medicine Name</span>
                        <span>Dosage</span>
                        <span>Frequency</span>
                        <span>Duration</span>
                        <span></span>
                    </div>

                    {medications.map((med, index) => (
                        <div key={index} className="medication_item">
                            <input
                                type="text"
                                placeholder="e.g. Paracetamol"
                                value={med.name}
                                onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="500mg"
                                value={med.dosage}
                                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="1-0-1"
                                value={med.frequency}
                                onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="5 days"
                                value={med.duration}
                                onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            />
                            {medications.length > 1 && (
                                <button
                                    type="button"
                                    className="btn_remove_med"
                                    onClick={() => removeMedication(index)}
                                    title="Remove medication"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                        </div>
                    ))}

                    <button type="button" className="btn_add_med" onClick={addMedication}>
                        <Plus size={15} /> Add Medication
                    </button>
                </div>

                {/* Instructions */}
                <div className="form_group_prescribe">
                    <label>Additional Instructions</label>
                    <textarea
                        rows="4"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g. Take medicines after food. Drink plenty of water. Rest well."
                    ></textarea>
                </div>

                {/* Submit */}
                <button type="submit" className="btn_submit_prescribe" disabled={submitting}>
                    {submitting
                        ? <><Loader2 size={18} className="prescribe_spin" /> Submitting...</>
                        : <><CheckCircle size={18} /> Issue Prescription</>
                    }
                </button>
            </form>
        </div>
    );
};

export default PrescribeMedicine;
