import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PhoneOff, LogOut, Video, WifiOff } from 'lucide-react';
import './VideoRoom.css';

const VideoRoom = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await telemedicineApi.get(`/sessions/${sessionId}`);
                setSession(res.data);
                loadJitsiScript(res.data);
            } catch (err) {
                console.error("Error fetching session:", err);
                setError("Failed to load session details.");
                setLoading(false);
            }
        };

        fetchSession();

        return () => {
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
            }
        };
    }, [sessionId]);

    const loadJitsiScript = (sessionData) => {
        if (window.JitsiMeetExternalAPI) {
            initJitsi(sessionData);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;
        script.onload = () => initJitsi(sessionData);
        document.body.appendChild(script);
    };

    const initJitsi = (sessionData) => {
        if (!window.JitsiMeetExternalAPI) return;

        const domain = "meet.jit.si";
        const options = {
            roomName: sessionData.roomName,
            width: "100%",
            height: "100%",
            parentNode: jitsiContainerRef.current,
            // jwt: sessionData.jitsiToken, // Disabled — public meet.jit.si rejects custom tokens
            userInfo: {
                displayName: user?.name || (user?.role === 'DOCTOR' ? 'Doctor' : 'Patient')
            },
            configOverwrite: {
                prejoinPageEnabled: false,
                disableDeepLinking: true
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
                ]
            }
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;
        setLoading(false);
    };

    const handleEndSession = async () => {
        if (window.confirm("Are you sure you want to end this session for everyone?")) {
            try {
                await telemedicineApi.put(`/sessions/${sessionId}/end`);
                if (jitsiApiRef.current) {
                    jitsiApiRef.current.dispose();
                }
                navigate(`/doctor/prescribe/${sessionId}`);
            } catch (err) {
                console.error("Error ending session:", err);
                alert("Failed to end session.");
            }
        }
    };

    const handleLeaveSession = () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
        }
        if (user?.role === 'PATIENT') {
            navigate(`/telemedicine/patient/${user.patientId}`);
        } else {
            navigate(`/doctor/telemedicine/${user.msUserId}`);
        }
    };

    return (
        <div className="video_room_container">
            {/* Header bar */}
            <div className="video_room_header">
                <div className="video_room_brand">
                    <div className="video_room_logo">
                        <Video size={18} />
                    </div>
                    <div>
                        <h2>MediSphere</h2>
                        <span className="video_room_subtitle">Telemedicine Consultation</span>
                    </div>
                    {!loading && !error && (
                        <span className="live_badge">
                            <span className="live_dot"></span> LIVE
                        </span>
                    )}
                </div>

                <div className="video_room_actions">
                    <button className="btn_leave_call" onClick={handleLeaveSession}>
                        <LogOut size={15} /> Leave Room
                    </button>
                    {user?.role === 'DOCTOR' && (
                        <button className="btn_end_call" onClick={handleEndSession}>
                            <PhoneOff size={15} /> End &amp; Prescribe
                        </button>
                    )}
                </div>
            </div>

            {/* Loading / Error overlay */}
            {(loading || error) && (
                <div className="video_room_overlay">
                    <div className="video_room_overlay_card">
                        {error ? (
                            <>
                                <div className="overlay_icon_wrap error_icon_wrap">
                                    <WifiOff size={28} />
                                </div>
                                <h3>Connection Failed</h3>
                                <p>{error}</p>
                                <button className="btn_overlay_back" onClick={handleLeaveSession}>
                                    <LogOut size={15} /> Go Back
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="overlay_spinner"></div>
                                <h3>Connecting to Secure Room</h3>
                                <p>Setting up your encrypted video session&hellip;</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Jitsi embed */}
            <div
                id="jitsi-container"
                ref={jitsiContainerRef}
                style={{ display: loading || error ? 'none' : 'block' }}
            ></div>
        </div>
    );
};

export default VideoRoom;
