import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Video, PhoneOff, ExternalLink, ShieldCheck } from 'lucide-react';
import './PatientConsultation_paconsult.css';

const PatientConsultation_paconsult = () => {
    const { appointmentReferenceId, referenceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const refId = appointmentReferenceId || referenceId || 'consultation';

    const cleanRef = (refId || 'consultation').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const roomName = `medisphere-${cleanRef}`;
    const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&userInfo.displayName=Patient`;

    const handleLeave = () => {
        if (window.confirm('Do you want to exit the consultation call?')) {
            navigate(-1);
        }
    };

    return (
        <div className="wrapper_paconsult">
            {/* Hero Section */}
            <div className="hero_paconsult">
                <div className="heroContent_paconsult">
                    <h1>Live <span>Telemedicine Consultation</span></h1>
                    <p>Session Ref: <strong>{refId}</strong> — Connected to secure Jitsi Meet room with your specialist.</p>
                </div>
                <div className="heroOverlay_paconsult"></div>
            </div>

            <div className="container_paconsult" style={{ flexDirection: 'column', height: 'auto', minHeight: '680px', padding: 0 }}>
                {/* Control / Info Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '14px 24px', borderBottom: '1px solid #334155' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }}></span>
                        <strong style={{ fontSize: '14px', letterSpacing: '0.04em' }}>LIVE CONSULTATION ROOM: <code style={{ color: '#93c5fd' }}>{roomName}</code></strong>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => window.open(`https://meet.jit.si/${roomName}`, '_blank')}
                            style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            title="Open video in a new browser tab"
                        >
                            <ExternalLink size={16} /> Pop-out Window
                        </button>
                        <button
                            onClick={handleLeave}
                            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <PhoneOff size={16} /> Leave Call
                        </button>
                    </div>
                </div>

                {/* Real Jitsi Meet Video Embed */}
                <iframe
                    src={jitsiUrl}
                    title="Patient Jitsi Video Consultation"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    style={{ width: '100%', height: '640px', border: 'none', background: '#0f172a' }}
                />
            </div>
        </div>
    );
};

export default PatientConsultation_paconsult;
