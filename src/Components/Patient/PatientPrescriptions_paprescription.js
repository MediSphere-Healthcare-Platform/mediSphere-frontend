import React from 'react';
import { Pill, Printer, Download, Calendar, User, FileText, AlertTriangle } from 'lucide-react';
import './PatientPrescriptions_paprescription.css';

const PatientPrescriptions_paprescription = () => {
    // Mock data for prescriptions
    const prescriptions = [
        {
            id: 'PR-1024',
            doctor: 'Dr. Sarah Smith',
            date: '2026-04-10',
            diagnosis: 'Acute Bronchitis',
            medications: [
                { name: 'Amoxicillin', dosage: '500mg', frequency: '3 times daily', duration: '7 days' },
                { name: 'Cough Syrup', dosage: '10ml', frequency: 'As needed', duration: '5 days' }
            ],
            notes: 'Drink plenty of warm fluids and rest.'
        },
        {
            id: 'PR-0982',
            doctor: 'Dr. John Doe',
            date: '2026-03-15',
            diagnosis: 'Seasonal Allergies',
            medications: [
                { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily (Night)', duration: '30 days' }
            ],
            notes: 'Avoid exposure to dust and pollen.'
        }
    ];

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

            <div className="list_paprescription">
                {prescriptions.map((pres) => (
                    <div key={pres.id} className="card_paprescription">
                        <div className="cardHeader_paprescription">
                            <div className="docMeta_paprescription">
                                <span className="idBadge_paprescription">{pres.id}</span>
                                <h3>{pres.diagnosis}</h3>
                            </div>
                            <div className="actions_paprescription">
                                <button title="Print"><Printer size={18} /></button>
                                <button title="Download PDF"><Download size={18} /></button>
                            </div>
                        </div>

                        <div className="metaGrid_paprescription">
                            <div className="metaItem_paprescription">
                                <User size={14} /> <span>{pres.doctor}</span>
                            </div>
                            <div className="metaItem_paprescription">
                                <Calendar size={14} /> <span>{pres.date}</span>
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
                                    {pres.medications.map((med, idx) => (
                                        <tr key={idx}>
                                            <td><strong>{med.name}</strong></td>
                                            <td>{med.dosage}</td>
                                            <td>{med.frequency}</td>
                                            <td>{med.duration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="notes_paprescription">
                            <h4><FileText size={16} /> Doctor's Note</h4>
                            <p>{pres.notes}</p>
                        </div>

                        <div className="warning_paprescription">
                            <AlertTriangle size={14} />
                            <span>Follow the dosage instructions carefully. Consult your doctor if symptoms persist.</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientPrescriptions_paprescription;
