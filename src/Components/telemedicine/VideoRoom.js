import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { telemedicineApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PhoneOff, LogOut, Video } from 'lucide-react';
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
            // jwt: sessionData.jitsiToken, // Disabled since public meet.jit.si rejects custom local tokens
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
                // Redirect doctor to prescription page
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
        // Redirect patient to dashboard
        if (user?.role === 'PATIENT') {
            navigate(`/telemedicine/patient/${user.patientId}`);
        } else {
            navigate(`/doctor/telemedicine/${user.msUserId}`);
        }
    };

    return (
        <div className="video_room_container">
            <div className="video_room_header">
                <h2><Video size={20} /> MediSphere Telemedicine Consultation</h2>
                <div className="video_room_actions">
                    <button className="btn_leave_call" onClick={handleLeaveSession}>
                        <LogOut size={16} /> Leave Room
                    </button>
                    {user?.role === 'DOCTOR' && (
                        <button className="btn_end_call" onClick={handleEndSession}>
                            <PhoneOff size={16} /> End Session & Prescribe
                        </button>
                    )}
                </div>
            </div>
            
            {loading && !error && (
                <div className="loading_room">
                    <p>Connecting to secure video room...</p>
                </div>
            )}
            
            {error && (
                <div className="loading_room">
                    <p style={{ color: '#ef4444' }}>{error}</p>
                    <button className="btn_leave_call" onClick={handleLeaveSession}>Go Back</button>
                </div>
            )}
            
            <div id="jitsi-container" ref={jitsiContainerRef} style={{ display: loading || error ? 'none' : 'block' }}></div>
        </div>
    );
};

export default VideoRoom;
