import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paymentApi, patientApi, appointmentApi } from '../../services/api';
import { Loader2, CreditCard, ShieldCheck, User, Receipt, ArrowRight, AlertCircle } from 'lucide-react';
import './PatientPayment.css';

const PatientPayment = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Dynamic Data
    const [appointmentData, setAppointmentData] = useState(null);
    const [patientData, setPatientData] = useState(null);
    const [doctorCharge, setDoctorCharge] = useState(null);
    const [isPaid, setIsPaid] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        const loadPaymentDetails = async () => {
            try {
                setLoading(true);
                // 1. Fetch Appointment Details to get patientId and doctorId
                const appoinmentRes = await appointmentApi.get(`appointments/trackStatus/${appointmentId}`);
                const appData = appoinmentRes.data?.data;
                
                if (!appData || !appData.doctorId || !appData.patientId) {
                    throw new Error("Could not retrieve appointment details.");
                }
                setAppointmentData(appData);

                // Check if already paid
                if (appData.status === 'PAID' || appData.status === 'Success') {
                    setIsPaid(true);
                }

                // 2. Fetch Patient Details
                const patientRes = await patientApi.get(`getPatientById/${appData.patientId}`);
                if (!patientRes.data?.data) {
                    throw new Error("Could not retrieve patient details.");
                }
                setPatientData(patientRes.data.data);

                // 3. Fetch Doctor Charges
                const chargeRes = await paymentApi.get(`payment/doctor-charge/${appData.doctorId}`);
                if (!chargeRes.data?.data) {
                    throw new Error("Could not retrieve doctor charge details.");
                }
                setDoctorCharge(chargeRes.data.data);

                setLoading(false);
            } catch (err) {
                console.error('Data loading error:', err);
                setError(err.response?.data?.description || err.message || 'An error occurred while loading payment details.');
                setLoading(false);
            }
        };

        if (appointmentId) {
            loadPaymentDetails();
        }
    }, [appointmentId]);

    const handleConfirmAndPay = async () => {
        if (isPaid) return;
        try {
            setVerifying(true);
            
            // Initiate the payment process in backend
            const paymentReq = {
                patientId: patientData.patientId,
                appointmentReferenceId: appointmentId,
                msUserId: patientData.msUserId || 3, // fallback 
                amount: doctorCharge.price,
                currency: doctorCharge.currency || "LKR"
            };

            const res = await paymentApi.post('payment/initiate', paymentReq);
            const payData = res.data?.data;

            if (!payData) {
                throw new Error("Failed to receive payment gateway data.");
            }

            // PayHere Redirect Logic
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://sandbox.payhere.lk/pay/checkout';

            const params = {
                merchant_id: payData.merchant_id,
                return_url: payData.return_url,
                cancel_url: payData.cancel_url,
                notify_url: payData.notify_url,
                first_name: payData.first_name,
                last_name: payData.last_name,
                email: payData.email,
                phone: payData.phone,
                address: payData.address || 'N/A',
                city: 'Colombo',
                country: 'Sri Lanka',
                order_id: payData.order_id,
                items: payData.items,
                currency: payData.currency,
                amount: payData.amount,
                hash: payData.hash
            };

            for (const key in params) {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = key;
                hiddenField.value = params[key];
                form.appendChild(hiddenField);
            }

            document.body.appendChild(form);
            setIsConfirmed(true);
            
            // Brief delay for UX then submit
            setTimeout(() => {
                form.submit();
            }, 1500);

        } catch (err) {
            console.error('Payment processing error:', err);
            setError(err.message || 'Payment initiation failed.');
            setVerifying(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await paymentApi.get('payment/history');
            if (res.data?.data) {
                // Filter history for this appointment just in case, 
                // but the endpoint returns all history for now
                setHistory(res.data.data);
            }
            setShowHistory(true);
            setLoadingHistory(false);
        } catch (err) {
            console.error('History fetch error:', err);
            setLoadingHistory(false);
        }
    }

    if (loading) {
        return (
            <div className="payment-loading-container">
                <Loader2 className="spinner" size={48} />
                <p>Loading transaction details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-error-container">
                <div className="payment-error-card">
                    <AlertCircle size={48} color="#ef4444" />
                    <h2 className="error-title">Unable to Proceed</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
                </div>
            </div>
        );
    }

    if (isConfirmed || verifying) {
        return (
            <div className="payment-loading-container">
                <div className="payment-loading-content">
                    <div className="icon-group">
                        <CreditCard size={48} className="text-primary icon-bounce" />
                        <ShieldCheck size={32} className="text-success icon-secured" />
                    </div>
                    <h2>{isConfirmed ? "Redirecting to Gateway" : "Securing Your Transaction"}</h2>
                    <p>Please wait while we securely connect you to PayHere...</p>
                    <Loader2 className="spinner" size={40} />
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page-wrapper">
            <div className="verification-container">
                <div className="verification-card">
                    <div className="verification-header">
                        <Receipt size={32} className="header-icon" />
                        <div>
                            <h1>Confirm Payment</h1>
                            <p>Reference: {appointmentId}</p>
                        </div>
                    </div>

                    <div className="verification-body">
                        <div className="info-section">
                            <h3><User size={18} /> Patient Details</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Full Name</label>
                                    <span>{patientData?.firstName} {patientData?.lastName}</span>
                                </div>
                                <div className="info-item">
                                    <label>Email Address</label>
                                    <span>{patientData?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="info-section">
                            <h3><CreditCard size={18} /> Appointment Details</h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Doctor</label>
                                    <span>{appointmentData?.doctorName}</span>
                                </div>
                                <div className="info-item">
                                    <label>Date & Time</label>
                                    <span>{appointmentData?.appointmentDate} at {appointmentData?.appointmentTime}</span>
                                </div>
                            </div>
                        </div>

                        <div className="payment-summary">
                            <div className="summary-row">
                                <span>Consultation Fee</span>
                                <span>{doctorCharge?.currency} {parseFloat(doctorCharge?.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Amount</span>
                                <span>{doctorCharge?.currency} {parseFloat(doctorCharge?.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        </div>
                    </div>

                    <div className="verification-footer">
                        <button className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                        
                        {isPaid ? (
                            <button className="paid-btn">
                                <ShieldCheck size={20} /> PAID
                            </button>
                        ) : (
                            <button className="pay-btn" onClick={handleConfirmAndPay} disabled={verifying}>
                                {verifying ? "Processing..." : "Confirm & Pay"} <ArrowRight size={18} />
                            </button>
                        )}
                    </div>

                    {isPaid && (
                        <button className="history-btn" onClick={fetchHistory} disabled={loadingHistory}>
                            {loadingHistory ? <Loader2 size={18} className="spin" /> : <Receipt size={18} />} 
                            View Payment History
                        </button>
                    )}

                    {showHistory && history.length > 0 && (
                        <div className="history-section">
                            <h3 className="history-title"><Receipt size={18} /> Recent Transactions</h3>
                            <div className="history-list">
                                {history.map((item, index) => (
                                    <div key={index} className="history-item">
                                        <div className="history-item-info">
                                            <label>{item.paymentReferenceId}</label>
                                            <span>{item.status}</span>
                                        </div>
                                        <div className="history-item-amount">
                                            LKR {parseFloat(item.amount || item.payhereAmount).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="secure-badge">
                        <ShieldCheck size={14} /> Secured by PayHere Sandbox
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientPayment;
