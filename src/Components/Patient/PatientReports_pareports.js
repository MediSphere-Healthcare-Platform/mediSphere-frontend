import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Upload, Download, Trash2, Plus, AlertCircle, FilePlus, Eye } from 'lucide-react';
import './PatientReports_pareports.css';

const PatientReports_pareports = ({ patientId = "P001" }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newReport, setNewReport] = useState({
        reportTitle: '',
        category: 'General',
        doctorId: ''
    });
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchReports();
    }, [patientId]);

    const fetchReports = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/patient/api/v1/getPatientReportsByPatientId/${patientId}`);
            setReports(response.data.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        const data = new FormData();
        data.append('reportData', new Blob([JSON.stringify({ ...newReport, patientId })], { type: 'application/json' }));
        data.append('file', file);

        try {
            await axios.post('http://localhost:8080/patient/api/v1/uploadMedicalReport', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Report uploaded successfully!');
            setShowUploadModal(false);
            fetchReports();
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload report.');
        } finally {
            setUploading(false);
        }
    };

    const deleteReport = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await axios.delete(`http://localhost:8080/patient/api/v1/deleteMedicalReport/${reportId}`);
            fetchReports();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <div className="container_pareports">
            {/* Hero Section */}
            <div className="hero_pareports">
                <div className="heroContent_pareports">
                    <h1>Medical <span>Reports</span></h1>
                    <p>Manage and access your digital medical documents securely and efficiently.</p>
                    <button className="heroAddBtn_pareports" onClick={() => setShowUploadModal(true)}>
                        <Plus size={20} /> Upload New Report
                    </button>
                </div>
                <div className="heroOverlay_pareports"></div>
            </div>

            {loading ? (
                <div className="loading_pareports">Loading documents...</div>
            ) : (
                <div className="reportGrid_pareports">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.reportId} className="reportCard_pareports">
                                <div className="reportIcon_pareports">
                                    <FileText size={32} />
                                </div>
                                <div className="reportInfo_pareports">
                                    <h3>{report.reportTitle}</h3>
                                    <p className="category_pareports">{report.category}</p>
                                    <p className="date_pareports">Uploaded: {new Date(report.uploadedAt).toLocaleDateString()}</p>
                                </div>
                                <div className="reportActions_pareports">
                                    <a href={report.reportUrl} target="_blank" rel="noopener noreferrer" className="actionBtn_pareports view_pareports">
                                        <Eye size={18} />
                                    </a>
                                    <button onClick={() => deleteReport(report.reportId)} className="actionBtn_pareports delete_pareports">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="noReports_pareports">
                            <AlertCircle size={40} />
                            <p>No medical reports found. Start by uploading one!</p>
                        </div>
                    )}
                </div>
            )}

            {showUploadModal && (
                <div className="modalOverlay_pareports">
                    <div className="modal_pareports">
                        <div className="modalHeader_pareports">
                            <h2><FilePlus size={24} /> Upload Report</h2>
                            <button onClick={() => setShowUploadModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleUpload} className="uploadForm_pareports">
                            <div className="inputGroup_pareports">
                                <label>Report Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g., Blood Test Results" 
                                    required 
                                    onChange={(e) => setNewReport({...newReport, reportTitle: e.target.value})} 
                                />
                            </div>
                            <div className="inputGroup_pareports">
                                <label>Category</label>
                                <select onChange={(e) => setNewReport({...newReport, category: e.target.value})}>
                                    <option value="General">General</option>
                                    <option value="Lab Report">Lab Report</option>
                                    <option value="Prescription">Prescription</option>
                                    <option value="X-Ray/Scan">X-Ray/Scan</option>
                                </select>
                            </div>
                            <div className="inputGroup_pareports">
                                <label>File Attachment</label>
                                <div className="fileDropZone_pareports">
                                    <Upload size={24} />
                                    <input type="file" required onChange={(e) => setFile(e.target.files[0])} />
                                    <p>{file ? file.name : 'Select or drag file here'}</p>
                                </div>
                            </div>
                            <button type="submit" className="submitBtn_pareports" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload Document'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientReports_pareports;
