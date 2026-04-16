import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, Settings, Maximize } from 'lucide-react';
import './PatientConsultation_paconsult.css';

const PatientConsultation_paconsult = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    return (
        <div className="wrapper_paconsult">
            {/* Hero Section */}
            <div className="hero_paconsult">
                <div className="heroContent_paconsult">
                    <h1>Active <span>Digital Consultation</span></h1>
                    <p>Connect securely with Dr. Sarah Smith. Ensure your camera and microphone are optimized for the best experience.</p>
                </div>
                <div className="heroOverlay_paconsult"></div>
            </div>

            <div className="container_paconsult">
            <div className="main_paconsult">
                <div className="videoGrid_paconsult">
                    {/* Doctor Video */}
                    <div className="videoCard_paconsult doctorVideo_paconsult">
                        <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=1000" alt="Doctor" />
                        <div className="videoLabel_paconsult">Dr. Sarah Smith (Consultant)</div>
                    </div>

                    {/* Patient Video (Self) */}
                    <div className="videoCard_paconsult patientVideo_paconsult">
                        <div className="selfVideo_paconsult">
                            {isVideoOff ? (
                                <div className="videoOffPlaceholder_paconsult"><VideoOff size={48} /></div>
                            ) : (
                                <div className="selfVideoMock_paconsult">You</div>
                            )}
                        </div>
                        <div className="videoLabel_paconsult">You {isMuted && '(Muted)'}</div>
                    </div>
                </div>

                <div className="controls_paconsult">
                    <button 
                        className={`controlBtn_paconsult ${isMuted ? 'active_paconsult' : ''}`}
                        onClick={() => setIsMuted(!isMuted)}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button 
                        className={`controlBtn_paconsult ${isVideoOff ? 'active_paconsult' : ''}`}
                        onClick={() => setIsVideoOff(!isVideoOff)}
                    >
                        {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                    </button>
                    <button className="controlBtn_paconsult hangup_paconsult" title="End Call">
                        <PhoneOff size={24} />
                    </button>
                    <div className="divider_paconsult"></div>
                    <button className="controlBtn_paconsult"><MessageSquare size={24} /></button>
                    <button className="controlBtn_paconsult"><Users size={24} /></button>
                    <button className="controlBtn_paconsult"><Settings size={24} /></button>
                    <button className="controlBtn_paconsult"><Maximize size={24} /></button>
                </div>
            </div>

            <div className="sidebar_paconsult">
                <div className="sidebarHeader_paconsult">
                    <h3>Consultation Chat</h3>
                </div>
                <div className="chatSpace_paconsult">
                    <div className="message_paconsult bot_paconsult">
                        <p>Welcome to your consultation with Dr. Sarah. Please wait for the doctor to join.</p>
                        <span>10:30 AM</span>
                    </div>
                    <div className="message_paconsult doctor_paconsult">
                        <p>Hello! How are you feeling today?</p>
                        <span>10:32 AM</span>
                    </div>
                </div>
                <div className="chatInput_paconsult">
                    <input type="text" placeholder="Type a message..." />
                    <button>Send</button>
                </div>
            </div>
        </div>
    </div>
    );
};

export default PatientConsultation_paconsult;
