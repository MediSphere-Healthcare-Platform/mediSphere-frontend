import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { paymentApi } from '../../services/api';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [patientId, setPatientId] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const orderId = queryParams.get('order_id');

        const processPaymentSuccess = async () => {
            if (!orderId) {
                console.error("No order_id found in URL");
                setStatus('error');
                setErrorMessage("Missing transaction reference.");
                return;
            }

            try {
                // 1. Fetch payment details to know where to redirect
                const detailsRes = await paymentApi.get(`payment/details/${orderId}`);
                const paymentData = detailsRes.data?.data;

                if (!paymentData) throw new Error("Transaction record not found on server.");
                setPatientId(paymentData.patientId);

                // 2. Simulate the PayHere Notify call to update appointment status
                console.log("Simulating payment success for:", orderId);
                await paymentApi.post(`payment/simulate-success/${orderId}`);

                setStatus('success');
                
                // 3. Redirect after a delay
                setTimeout(() => {
                    navigate(`/history/${paymentData.patientId}`);
                }, 4000);
            } catch (err) {
                console.error("Success processing error:", err);
                setStatus('error');
                setErrorMessage(err.response?.data?.description || err.message || "Failed to update appointment status.");
            }
        };

        processPaymentSuccess();
    }, [navigate]);

    return (
        <div className="payment-success-container">
            <div className="payment-success-card">
                {status === 'processing' && (
                    <>
                        <Loader2 size={80} className="spinner-large" />
                        <h1>Verifying Payment...</h1>
                        <p>We are confirming your transaction with the gateway. Please do not refresh the page.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 size={80} className="success-icon" />
                        <h1>Payment Confirmed!</h1>
                        <p>Your appointment has been successfully marked as PAID.</p>
                        <div className="redirect-info">
                            <Loader2 size={20} className="spinner-small" />
                            <span>Returning to your medical history...</span>
                        </div>
                        <button 
                            className="manual-redirect-btn" 
                            onClick={() => navigate(`/history/${patientId}`)}
                            style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}
                        >
                            Go to History Now <ArrowRight size={18} />
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle size={80} color="#ef4444" />
                        <h1>Update Pending</h1>
                        <p>The payment was successful, but we encountered an issue updating the system status.</p>
                        <div className="error-box" style={{ background: '#fef2f2', color: '#991b1b', padding: '15px', borderRadius: '8px', marginTop: '15px', fontSize: '0.9rem' }}>
                            <strong>Details:</strong> {errorMessage}
                        </div>
                        <button 
                            className="manual-redirect-btn" 
                            onClick={() => navigate('/')}
                            style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#475569', color: 'white', cursor: 'pointer' }}
                        >
                            Back to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
