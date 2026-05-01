import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText, Upload, Download, Trash2, Plus, AlertCircle, FilePlus, Eye, Loader2 } from 'lucide-react';
import { directPatientApi, directDoctorApi } from '../../services/api';
import './PatientReports_pareports.css';

const PatientReports_pareports = ({ patientId: propPatientId = "P002" }) => {
    const { patientId: urlPatientId } = useParams();
    const patientId = urlPatientId || propPatientId;

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [newReport, setNewReport] = useState({
        reportName: '',
        reportType: 'General',
        description: '',
        doctorId: '' 
    });
    const [file, setFile] = useState(null);
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        console.log(`[Reports] Fetching for Patient ID: ${patientId}`);
        fetchReports();
        fetchDoctors();
    }, [patientId]);

    const fetchDoctors = async () => {
        try {
            const response = await directDoctorApi.get('getAllDoctors');
            const resData = response.data?.data || response.data || [];
            setDoctors(Array.isArray(resData) ? resData : []);
            
            // Set default doctor if available
            if (resData.length > 0 && !newReport.doctorId) {
                setNewReport(prev => ({ ...prev, doctorId: resData[0].doctorId || resData[0].msUserId }));
            }
        } catch (err) {
            console.error('[Reports] Error fetching doctors:', err);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await directPatientApi.get(`getPatientReportsByPatientId/${patientId}`);
            const resData = response.data?.data !== undefined ? response.data.data : response.data;
            const finalData = Array.isArray(resData) ? resData : [];
            setReports(finalData);
        } catch (err) {
            console.error('[Reports] Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        setUploading(true);
        try {
            const data = new FormData();
            const reportData = {
                patientId: patientId,
                reportName: newReport.reportName,
                reportType: newReport.reportType,
                doctorId: newReport.doctorId,
                description: newReport.description
            };

            data.append('reportData', new Blob([JSON.stringify(reportData)], { type: 'application/json' }));
            data.append('file', file);

            await directPatientApi.post('uploadMedicalReport', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('Report uploaded successfully!');
            setShowUploadModal(false);
            setFile(null);
            setNewReport({
                reportName: '',
                reportType: 'General',
                description: '',
                doctorId: doctors.length > 0 ? (doctors[0].doctorId || doctors[0].msUserId) : ''
            });
            fetchReports();
        } catch (err) {
            console.error('Upload failed:', err);
            const msg = err.response?.data?.message || err.message || 'Upload failed.';
            alert(`Error: ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    const deleteReport = async (reportId) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            await directPatientApi.delete(`deleteMedicalReport/${reportId}`);
            fetchReports();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete report.');
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
                <div className="loading_pareports">
                    <Loader2 className="animate-spin" size={32} />
                    <p>Fetching your documents...</p>
                </div>
            ) : (
                <div className="reportGrid_pareports">
                    {reports && reports.length > 0 ? (
                        reports.map((report) => (
                            <div key={report.reportId} className="reportCard_pareports">
                                <div className="reportIcon_pareports">
                                    <FileText size={32} />
                                </div>
                                <div className="reportInfo_pareports">
                                    <h3>{report.reportName}</h3>
                                    <p className="category_pareports">{report.reportType}</p>
                                    <p className="date_pareports">Uploaded: {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="reportActions_pareports">
                                    {report.fileUrl && (
                                        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="actionBtn_pareports view_pareports">
                                            <Eye size={18} />
                                        </a>
                                    )}
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
                                <label>Report Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Blood Test Results"
                                    required
                                    value={newReport.reportName}
                                    onChange={(e) => setNewReport({ ...newReport, reportName: e.target.value })}
                                />
                            </div>
                            <div className="inputGroup_pareports">
                                <label>Target Doctor (Shared With)</label>
                                <select
                                    required
                                    value={newReport.doctorId}
                                    onChange={(e) => setNewReport({ ...newReport, doctorId: e.target.value })}
                                >
                                    <option value="">Select a Doctor</option>
                                    {doctors.map(doc => (
                                        <option key={doc.doctorId || doc.msUserId} value={doc.doctorId || doc.msUserId}>
                                            Dr. {doc.firstName} {doc.lastName} ({doc.specialization || 'General'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="inputGroup_pareports">
                                <label>Category (Report Type)</label>
                                <select
                                    value={newReport.reportType}
                                    onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Lab Report">Lab Report</option>
                                    <option value="Prescription">Prescription</option>
                                    <option value="X-Ray/Scan">X-Ray/Scan</option>
                                </select>
                            </div>
                            <div className="inputGroup_pareports">
                                <label>Description</label>
                                <textarea
                                    placeholder="Brief details about the report"
                                    value={newReport.description}
                                    onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                                />
                            </div>
                            <div className="inputGroup_pareports">
                                <label>File Attachment</label>
                                <div className="fileDropZone_pareports">
                                    <Upload size={24} />
                                    <input type="file" accept="image/*" required onChange={(e) => setFile(e.target.files[0])} />
                                    <p>{file ? file.name : 'Select or drag image here (JPG, PNG)'}</p>
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

