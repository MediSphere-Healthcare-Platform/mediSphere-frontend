import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Find patientId from sessionStorage
        let patientId = "P002"; // Fallback
        const storedUser = sessionStorage.getItem('medisphere_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.patientId) {
                    patientId = parsedUser.patientId;
                }
            } catch (e) {
                console.error("Failed to parse user session", e);
            }
        }

        // Wait a few seconds to let user read the success message, then redirect back to history
        const timer = setTimeout(() => {
            navigate(`/history/${patientId}`);
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="payment-success-container">
            <div className="payment-success-card">
                <CheckCircle2 size={80} className="success-icon" />
                <h1>Payment Successful!</h1>
                <p>Your payment has been processed. The appointment status is being updated.</p>
                
                <div className="redirect-info">
                    <Loader2 size={20} className="spinner-small" />
                    <span>Redirecting you back to your history...</span>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
