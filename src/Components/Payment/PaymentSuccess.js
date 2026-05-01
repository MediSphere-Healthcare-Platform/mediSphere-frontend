import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { paymentApi, appointmentApi } from '../../services/api';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const orderId = queryParams.get('order_id');

        const processPaymentSuccess = async () => {
            if (!orderId) {
                navigate('/');
                return;
            }

            try {
                const detailsRes = await paymentApi.get(`payment/details/${orderId}`);
                const paymentData = detailsRes.data?.data;

                if (!paymentData) throw new Error("Transaction not found");

                await paymentApi.post(`payment/simulate-success/${orderId}`);

                setTimeout(() => {
                    navigate(`/history/${paymentData.patientId}`);
                }, 3000);
            } catch (err) {
                console.error("Success processing error:", err);
                navigate('/');
            }
        };

        processPaymentSuccess();
    }, [navigate]);

    return (
        <div className="payment-success-container">
            <div className="payment-success-card">
                <CheckCircle2 size={80} className="success-icon" />
                <h1>Payment Successful!</h1>
                <p>Your payment has been processed. We are updating your appointment status now.</p>
                
                <div className="redirect-info">
                    <Loader2 size={20} className="spinner-small" />
                    <span>Redirecting you back to your history...</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
