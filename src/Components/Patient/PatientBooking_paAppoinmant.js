import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Search, Calendar, Clock, User, Award, ArrowRight, ShieldCheck, X,
    CreditCard, CheckCircle2, AlertCircle, Sparkles
} from 'lucide-react';
import api, { paymentApi } from '../../services/api';
import './PatientBooking_paAppoinmant.css';

const PatientBooking_paAppoinmant = ({ patientId: propPatientId = "P002" }) => {
    const { patientId: urlPatientId } = useParams();
    const navigate = useNavigate();
    const patientId = urlPatientId || propPatientId;

    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingData, setBookingData] = useState({
        appointmentDate: '',
        appointmentTime: '',
        comments: ''
    });
    const [loading, setLoading] = useState(true);
    const [patientLoading, setPatientLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Payment state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bookedDetails, setBookedDetails] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    useEffect(() => {
        console.log(`[Booking] Initializing for Patient ID: ${patientId}`);
        fetchDoctors();
        fetchPatientData();
    }, [patientId]);

    const fetchPatientData = async () => {
        try {
            const response = await api.get(`getPatientById/${patientId}`);
            const data = response.data.data || response.data;
            setBookingData(prev => ({ ...prev, msUserId: data.msUserId }));
        } catch (err) {
            console.error('[Booking] Fetch Patient Error:', err);
        } finally {
            setPatientLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get('getAllDoctors');
            const finalData = response.data.data || response.data || [];
            setDoctors(Array.isArray(finalData) ? finalData : []);
        } catch (err) {
            console.error('[Booking] Fetch Doctors Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                patientId: patientId,
                doctorId: selectedDoctor.doctorId,
                msUserId: bookingData.msUserId,
                appointmentDate: bookingData.appointmentDate,
                appointmentTime: bookingData.appointmentTime,
                reason: bookingData.comments
            };

            const bookRes = await api.post('appointments/bookAppointment', payload);
            const resData = bookRes.data?.data || bookRes.data;
            const refId = resData?.bookReferenceID || 'MEDSPREF-' + Math.random().toString(36).substring(2, 9).toUpperCase();

            setBookedDetails({
                referenceId: refId,
                doctor: selectedDoctor,
                date: bookingData.appointmentDate,
                time: bookingData.appointmentTime,
                amount: "2500.00",
                currency: "LKR"
            });
            setShowModal(false);
            setShowPaymentModal(true);
            setPaymentSuccess(false);
            setPaymentError('');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Booking failed.';
            alert(`Booking failed: ${msg}`);
        }
    };

    const handlePayHereCheckout = async () => {
        if (!bookedDetails) return;
        setPaymentLoading(true);
        setPaymentError('');

        try {
            let resolvedMsUserId = bookingData.msUserId;
            if (!resolvedMsUserId) {
                try {
                    const stored = sessionStorage.getItem('medisphere_user');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        resolvedMsUserId = parsed.msUserId;
                    }
                } catch (e) { /* ignore */ }
            }
            if (!resolvedMsUserId) resolvedMsUserId = 'UP0001';

            const payPayload = {
                appointmentReferenceId: bookedDetails.referenceId,
                patientId: patientId,
                msUserId: resolvedMsUserId,
                amount: bookedDetails.amount,
                currency: bookedDetails.currency
            };

            // Call Payment Service
            const initRes = await paymentApi.post('initiate', payPayload);
            if (initRes.data && initRes.data.status === '01') {
                const failReason = initRes.data.error?.errorDescription || 'Payment initiation declined.';
                setPaymentError(failReason);
                setPaymentLoading(false);
                return;
            }

            const payData = initRes.data?.data || initRes.data;
            const orderId = payData?.order_id || payData?.orderId;

            if (!orderId) {
                throw new Error('Order reference could not be created by payment service.');
            }

            // Launch PayHere 3rd Party SDK if loaded on window
            if (window.payhere) {
                window.payhere.onCompleted = async function onCompleted(completedOrderId) {
                    console.log('[PayHere] Payment completed. Order ID:', completedOrderId);
                    try {
                        await paymentApi.post(`simulate-success/${completedOrderId || orderId}`);
                    } catch (e) {
                        console.error('[PayHere] Success notification sync error:', e);
                    }
                    setPaymentSuccess(true);
                    setPaymentLoading(false);
                };

                window.payhere.onDismissed = function onDismissed() {
                    console.log('[PayHere] Popup dismissed by user.');
                    setPaymentLoading(false);
                };

                window.payhere.onError = function onError(error) {
                    console.error('[PayHere] Gateway error:', error);
                    setPaymentError(typeof error === 'string' ? error : 'PayHere gateway encountered an error.');
                    setPaymentLoading(false);
                };

                const paymentConfig = {
                    sandbox: true,
                    merchant_id: payData.merchant_id || "1211149",
                    return_url: payData.return_url || "http://localhost:3000/history/" + patientId,
                    cancel_url: payData.cancel_url || "http://localhost:3000/history/" + patientId,
                    notify_url: payData.notify_url || "https://medisphere.requestcatcher.com/payment/api/v1/payment/notify",
                    order_id: orderId,
                    items: payData.items || "Medical Appointment Consultation Fee",
                    amount: payData.amount || bookedDetails.amount,
                    currency: payData.currency || bookedDetails.currency,
                    hash: payData.hash,
                    first_name: payData.first_name || "Patient",
                    last_name: payData.last_name || "User",
                    email: payData.email || "patient@medisphere.com",
                    phone: payData.phone || "0771234567",
                    address: payData.address || "Colombo",
                    city: "Colombo",
                    country: "Sri Lanka",
                    delivery_address: payData.address || "Colombo",
                    delivery_city: "Colombo",
                    delivery_country: "Sri Lanka"
                };

                console.log('[PayHere] Launching 3rd-party checkout:', paymentConfig);
                window.payhere.startPayment(paymentConfig);
            } else {
                console.warn('[PayHere] SDK not detected on window, simulating sandbox payment directly.');
                await paymentApi.post(`simulate-success/${orderId}`);
                setPaymentSuccess(true);
                setPaymentLoading(false);
            }
        } catch (err) {
            console.error('[PayHere Initiation Error]:', err);
            const msg = err.response?.data?.error?.errorDescription 
                     || err.response?.data?.message 
                     || err.message 
                     || 'Payment processing error. Please try again or pay at the clinic.';
            setPaymentError(msg);
            setPaymentLoading(false);
        }
    };

    const handleDirectSimulatePayment = async () => {
        if (!bookedDetails) return;
        setPaymentLoading(true);
        setPaymentError('');

        try {
            let resolvedMsUserId = bookingData.msUserId;
            if (!resolvedMsUserId) {
                try {
                    const stored = sessionStorage.getItem('medisphere_user');
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        resolvedMsUserId = parsed.msUserId;
                    }
                } catch (e) { /* ignore */ }
            }
            if (!resolvedMsUserId) resolvedMsUserId = 'UP0001';

            const payPayload = {
                appointmentReferenceId: bookedDetails.referenceId,
                patientId: patientId,
                msUserId: resolvedMsUserId,
                amount: bookedDetails.amount,
                currency: bookedDetails.currency
            };

            const initRes = await paymentApi.post('initiate', payPayload);
            const payData = initRes.data?.data || initRes.data;
            const orderId = payData?.order_id || payData?.orderId;

            if (orderId) {
                await paymentApi.post(`simulate-success/${orderId}`);
            }

            setPaymentSuccess(true);
        } catch (err) {
            console.error('[Simulate Error]:', err);
            const msg = err.response?.data?.message || err.message || 'Payment simulation failed.';
            setPaymentError(msg);
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePayAtDesk = () => {
        alert(`Appointment slot reserved (Ref: ${bookedDetails?.referenceId}). Status is PENDING. You can pay at the clinic.`);
        setShowPaymentModal(false);
        navigate(`/history/${patientId}`);
    };

    const filteredDoctors = doctors.filter(doc =>
        (doc.firstName + ' ' + doc.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialty || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const defaultDocAvatar = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

    return (
        <div className="container_paAppoinmant">
            {/* Hero Section */}
            <div className="hero_img_booking">
                <div className="hero_paAppoinmant">
                    <div className="heroContent_paAppoinmant">
                        <h1>Find & Book <span>Expert Care</span></h1>
                        <p>Search through our network of certified specialists and schedule your consultation in seconds. Your health is our priority.</p>

                        <div className="searchBar_paAppoinmant">
                            <Search size={24} className="searchIcon_paAppoinmant" />
                            <input
                                type="text"
                                placeholder="Search by doctor name or medical specialty..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="heroOverlay_paAppoinmant"></div>
                </div>
            </div>

            {loading ? (
                <div className="loading_paAppoinmant">
                    <Clock className="animate-spin" size={32} />
                    <p>Connecting with our medical specialists...</p>
                </div>
            ) : (
                <div className="doctorGrid_paAppoinmant">
                    {filteredDoctors.map(doctor => (
                        <div key={doctor.doctorId} className="doctorCard_paAppoinmant">
                            <div className="docImageWrapper_paAppoinmant">
                                <img 
                                    src={doctor.profilePic || defaultDocAvatar} 
                                    alt={doctor.firstName}
                                    onError={(e) => { e.target.src = defaultDocAvatar; }}
                                />
                                <span className="specialtyBadge_paAppoinmant">{doctor.specialty || 'General'}</span>
                            </div>
                            <div className="docInfo_paAppoinmant">
                                <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                                <p><Award size={16} /> Highly Experienced</p>
                                <p><ShieldCheck size={16} /> Verified MediSphere Expert</p>
                                <button
                                    className="bookBtn_paAppoinmant"
                                    onClick={() => { setSelectedDoctor(doctor); setShowModal(true); }}
                                >
                                    Make an Appointment
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredDoctors.length === 0 && (
                        <div className="noResults_paAppoinmant">
                            <User size={48} />
                            <p>No specialists found matching your search.</p>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="modalOverlay_paAppoinmant">
                    <div className="modal_paAppoinmant">
                        <div className="modalHeader_paAppoinmant">
                            <h2>Reserve Slot</h2>
                            <button className="closeModal_paAppoinmant" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBooking} className="bookingForm_paAppoinmant">
                            <div className="selectedDocInfo_paAppoinmant">
                                <p>You are booking with</p>
                                <strong>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</strong>
                            </div>

                            <div className="formRow_paAppoinmant">
                                <div className="inputGroup_paAppoinmant">
                                    <label><Calendar size={18} /> Preferred Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentDate: e.target.value })}
                                    />
                                </div>

                                <div className="inputGroup_paAppoinmant">
                                    <label><Clock size={18} /> Available Time</label>
                                    <input
                                        type="time"
                                        required
                                        onChange={(e) => setBookingData({ ...bookingData, appointmentTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="inputGroup_paAppoinmant">
                                <label>Reason for Visit</label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe your symptoms or reason for the consultation..."
                                    onChange={(e) => setBookingData({ ...bookingData, comments: e.target.value })}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="confirmBtn_paAppoinmant"
                                disabled={patientLoading || !bookingData.msUserId}
                            >
                                {patientLoading ? 'Verifying Profile...' : 'Confirm & Proceed to Payment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && bookedDetails && (
                <div className="modalOverlay_paAppoinmant">
                    <div className="modal_paAppoinmant" style={{ maxWidth: '520px' }}>
                        <div className="modalHeader_paAppoinmant">
                            <h2>{paymentSuccess ? 'Payment Confirmed' : 'Consultation Fee Payment'}</h2>
                            <button 
                                className="closeModal_paAppoinmant" 
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    if (paymentSuccess) navigate(`/history/${patientId}`);
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {paymentSuccess ? (
                            <div className="paymentSuccessBox_paAppoinmant">
                                <div className="paySuccessIcon_paAppoinmant">
                                    <CheckCircle2 size={44} />
                                </div>
                                <span className="payBadgePaid">STATUS: PAID</span>
                                <h3>Payment Completed Successfully!</h3>
                                <p>
                                    Your consultation with <strong>Dr. {bookedDetails.doctor.firstName} {bookedDetails.doctor.lastName}</strong> has been confirmed.
                                    <br />Reference: <strong>{bookedDetails.referenceId}</strong>
                                </p>
                                <button 
                                    className="confirmBtn_paAppoinmant" 
                                    style={{ width: '100%' }}
                                    onClick={() => navigate(`/history/${patientId}`)}
                                >
                                    View My Appointments
                                </button>
                            </div>
                        ) : (
                            <div>
                                {/* Summary Info */}
                                <div className="paymentSummary_paAppoinmant" style={{ padding: '14px 18px', marginBottom: '16px' }}>
                                    <div className="paymentSummaryRow">
                                        <span>Reference:</span>
                                        <strong>{bookedDetails.referenceId}</strong>
                                    </div>
                                    <div className="paymentSummaryRow">
                                        <span>Doctor:</span>
                                        <strong>Dr. {bookedDetails.doctor.firstName} {bookedDetails.doctor.lastName} ({bookedDetails.doctor.specialty || 'General'})</strong>
                                    </div>
                                    <div className="paymentSummaryRow">
                                        <span>Schedule:</span>
                                        <strong>{bookedDetails.date} at {bookedDetails.time}</strong>
                                    </div>
                                </div>

                                <div className="paymentAmountBox_paAppoinmant" style={{ marginBottom: '18px', padding: '14px 18px' }}>
                                    <span>Total Payable:</span>
                                    <h3>{bookedDetails.currency} {bookedDetails.amount}</h3>
                                </div>

                                {/* Gateway Information Banner with Test Card Details */}
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '12px 16px', marginBottom: '18px', fontSize: '13px', color: '#166534' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
                                        <Sparkles size={16} color="#16a34a" />
                                        <span>PayHere Sandbox Test Credentials</span>
                                    </div>
                                    <div style={{ fontSize: '12px', lineHeight: '1.6', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                                        <div><strong>Visa (Approved):</strong> <code style={{ userSelect: 'all', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>4916217501611292</code></div>
                                        <div><strong>Mastercard (Approved):</strong> <code style={{ userSelect: 'all', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>5307732125531191</code></div>
                                        <div style={{ color: '#64748b', marginTop: '2px' }}>Expiry: Any future date (e.g. <strong>12/28</strong>) &nbsp;|&nbsp; CVV: <strong>123</strong></div>
                                    </div>
                                </div>

                                {paymentError && (
                                    <div style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <AlertCircle size={16} />
                                        <span>{paymentError}</span>
                                    </div>
                                )}

                                {/* Action Buttons - Clearly Visible */}
                                <div className="paymentOptions_paAppoinmant" style={{ marginBottom: 0 }}>
                                    <button 
                                        type="button"
                                        className="paymentOptionBtn_paAppoinmant primary_pay" 
                                        onClick={handlePayHereCheckout}
                                        disabled={paymentLoading}
                                    >
                                        <CreditCard size={22} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 800 }}>
                                                {paymentLoading ? 'Connecting to PayHere...' : 'Pay with PayHere (Sandbox Gateway)'}
                                            </span>
                                            <small style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>
                                                Launch official 3rd-party PayHere checkout popup
                                            </small>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        className="paymentOptionBtn_paAppoinmant sim_pay" 
                                        onClick={handleDirectSimulatePayment}
                                        disabled={paymentLoading}
                                    >
                                        <CheckCircle2 size={22} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 800 }}>
                                                Instant Sandbox Pay (1-Click Test)
                                            </span>
                                            <small style={{ fontSize: '12px', opacity: 0.85, fontWeight: 500 }}>
                                                Directly mark as PAID without opening popup
                                            </small>
                                        </div>
                                    </button>

                                    <button 
                                        type="button"
                                        className="paymentOptionBtn_paAppoinmant" 
                                        onClick={handlePayAtDesk}
                                        disabled={paymentLoading}
                                    >
                                        <Clock size={22} />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '15px', fontWeight: 700 }}>Pay at Hospital Desk</span>
                                            <small style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                Reserve slot now, pay cash/card upon clinic arrival
                                            </small>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientBooking_paAppoinmant;
