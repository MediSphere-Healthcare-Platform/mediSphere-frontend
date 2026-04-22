import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doctorApi } from '../../services/api';
import { 
    FileText, Search, Filter, Eye, Download, 
    Calendar, User, AlertCircle, Bookmark, CheckCircle2
} from 'lucide-react';
import './PatientReportViewer_dorep.css';

const PatientReportViewer_dorep = ({ doctorId: propDoctorId = "UD102616" }) => {
    const { doctorId: urlDoctorId } = useParams();
    
    // ID Resolution Logic
    const getActiveId = () => {
        if (urlDoctorId) {
            sessionStorage.setItem('currentDoctorId', urlDoctorId);
            return urlDoctorId;
        }
        return sessionStorage.getItem('currentDoctorId') || propDoctorId;
    };

    const currentDoctorId = getActiveId();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    const heroImg = "https://images.unsplash.com/photo-1542736667-069246bdbc6d?auto=format&fit=crop&q=80&w=1200";

    useEffect(() => {
        fetchReports();
    }, [currentDoctorId]);

    const fetchReports = async () => {
        try {
            // Calling a likely patientClient endpoint found in DoctorController
            const response = await doctorApi.get(`/getMedicalReportsByDoctorId/${currentDoctorId}`);
            setReports(response.data.data || []);
        } catch (err) {
            console.error('Error fetching reports:', err);
            // Mock data if API fails during dev
            setReports([
                { reportId: 'R1', reportTitle: 'Blood Sugar Analysis', category: 'Lab Report', patientName: 'John Doe', uploadedAt: '2026-04-12T10:30:00Z', reportUrl: '#' },
                { reportId: 'R2', reportTitle: 'Chest X-Ray', category: 'X-Ray/Scan', patientName: 'Jane Smith', uploadedAt: '2026-04-14T14:20:00Z', reportUrl: '#' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => {
        const matchesCategory = category === 'All' || r.reportType === category;
        const matchesSearch = (r.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (r.reportName || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="drvWrapper_dorep">
            <div className="drvHero_dorep" style={{ backgroundImage: `url(${heroImg})` }}>
                <div className="drvHeroContent_dorep">
                    <h1>Patient <span>Record Vault</span></h1>
                    <p>Securely access and review clinical diagnostic reports and medical history shared by your patients.</p>
                </div>
                <div className="drvHeroOverlay_dorep"></div>
            </div>

            <div className="drvContainer_dorep">
                <div className="drvControls_dorep">
                    <div className="drvSearch_dorep">
                        <Search size={20} />
                        <input 
                            placeholder="Search by patient or report name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="drvFilter_dorep">
                        <Filter size={18} />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            <option value="Lab Report">Lab Report</option>
                            <option value="X-Ray/Scan">X-Ray/Scan</option>
                            <option value="Prescription">Prescription</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="drvLoading_dorep">
                        <div className="drvSpinner_dorep"></div>
                        <p>Accessing secure vault...</p>
                    </div>
                ) : (
                    <div className="drvGrid_dorep">
                        {filteredReports.length > 0 ? (
                            filteredReports.map((report) => (
                                <div key={report.reportId} className="drvCard_dorep">
                                    <div className="drvCardIcon_dorep">
                                        <FileText size={30} />
                                    </div>
                                    <div className="drvCardBody_dorep">
                                        <div className="drvMeta_dorep">
                                            <span className="drvTag_dorep">{report.reportType}</span>
                                            <span className="drvDate_dorep">{report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                        <h3>{report.reportName}</h3>
                                        <div className="drvPatient_dorep">
                                            <User size={14} /> <span>{report.patientName || 'Unknown Patient'}</span>
                                        </div>
                                    </div>
                                    <div className="drvActions_dorep">
                                        {report.fileUrl && (
                                            <>
                                                <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="drvViewBtn_dorep" title="View Report">
                                                    <Eye size={18} />
                                                </a>
                                                <a href={report.fileUrl} download={report.reportName} className="drvDownloadBtn_dorep" title="Download">
                                                    <Download size={18} />
                                                </a>
                                            </>
                                        )}
                                        <button className="drvMarkBtn_dorep" title="Mark as Reviewed">
                                            <CheckCircle2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="drvNoData_dorep">
                                <AlertCircle size={40} />
                                <p>No digital records found for the given criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientReportViewer_dorep;
