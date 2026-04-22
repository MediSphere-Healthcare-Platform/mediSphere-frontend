import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save, Info, CheckCircle2 } from 'lucide-react';
import './DoctorSchedule_dosched.css';

const DoctorSchedule_dosched = ({ doctorId: propDoctorId = "UD102616" }) => {
    const { doctorId: urlDoctorId } = useParams();
    
    // ID Resolution Logic
    const getActiveId = () => {
        if (urlDoctorId) {
            sessionStorage.setItem('currentDoctorId', urlDoctorId);
            return urlDoctorId;
        }
        return sessionStorage.getItem('currentDoctorId') || propDoctorId;
    };

    const currentDoctorId = getActiveId();
    const [schedule, setSchedule] = useState([
        { day: 'Monday', slots: ['09:00 AM - 12:00 PM', '02:00 PM - 05:00 PM'] },
        { day: 'Tuesday', slots: ['09:00 AM - 01:00 PM'] },
        { day: 'Wednesday', slots: ['10:00 AM - 02:00 PM', '04:00 PM - 07:00 PM'] },
        { day: 'Thursday', slots: ['09:00 AM - 12:00 PM'] },
        { day: 'Friday', slots: ['02:00 PM - 06:00 PM'] },
    ]);

    const [activeDay, setActiveDay] = useState('Monday');
    const [showAddSlot, setShowAddSlot] = useState(false);
    const [newSlot, setNewSlot] = useState({ start: '09:00', end: '10:00' });

    const heroImg = "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200";

    const removeSlot = (dayName, slotIndex) => {
        setSchedule(schedule.map(d => {
            if (d.day === dayName) {
                const newSlots = [...d.slots];
                newSlots.splice(slotIndex, 1);
                return { ...d, slots: newSlots };
            }
            return d;
        }));
    };

    const addSlot = () => {
        const slotString = `${newSlot.start} - ${newSlot.end}`;
        setSchedule(schedule.map(d => {
            if (d.day === activeDay) {
                return { ...d, slots: [...d.slots, slotString] };
            }
            return d;
        }));
        setShowAddSlot(false);
    };

    return (
        <div className="dsWrapper_dosched">
            <div className="dsHero_dosched" style={{ backgroundImage: `url(${heroImg})` }}>
                <div className="dsHeroContent_dosched">
                    <h1>Availability <span>Scheduler</span></h1>
                    <p>Define your weekly consultation hours and set breaks to optimize your clinical workflow.</p>
                </div>
                <div className="dsHeroOverlay_dosched"></div>
            </div>

            <div className="dsContainer_dosched">
                <div className="dsSidebar_dosched">
                    <h3>Weekly Overview</h3>
                    <div className="dsDayList_dosched">
                        {schedule.map((d) => (
                            <button 
                                key={d.day} 
                                className={`dsDayItem_dosched ${activeDay === d.day ? 'active' : ''}`}
                                onClick={() => setActiveDay(d.day)}
                            >
                                <span>{d.day}</span>
                                <span className="dsSlotCount_dosched">{d.slots.length} Slots</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="dsMain_dosched">
                    <div className="dsMainHeader_dosched">
                        <h2>{activeDay} Schedule</h2>
                        <button className="dsAddBtn_dosched" onClick={() => setShowAddSlot(true)}>
                            <Plus size={18} /> Add Slot
                        </button>
                    </div>

                    <div className="dsSlotList_dosched">
                        {schedule.find(d => d.day === activeDay).slots.length > 0 ? (
                            schedule.find(d => d.day === activeDay).slots.map((slot, idx) => (
                                <div key={idx} className="dsSlotCard_dosched">
                                    <div className="dsSlotInfo_dosched">
                                        <Clock size={20} className="dsSlotIcon_dosched" />
                                        <div>
                                            <span className="dsSlotTime_dosched">{slot}</span>
                                            <span className="dsSlotType_dosched">General Consultation</span>
                                        </div>
                                    </div>
                                    <button className="dsTrashBtn_dosched" onClick={() => removeSlot(activeDay, idx)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="dsNoSlots_dosched">
                                <Info size={30} />
                                <p>No availability slots set for this day.</p>
                            </div>
                        )}
                    </div>

                    <div className="dsFooter_dosched">
                        <div className="dsStatus_dosched">
                            <CheckCircle2 size={16} /> <span>Autosaved locally</span>
                        </div>
                        <button className="dsSaveBtn_dosched">
                            <Save size={18} /> Sync with Server
                        </button>
                    </div>
                </div>
            </div>

            {showAddSlot && (
                <div className="dsModalOverlay_dosched">
                    <div className="dsModal_dosched">
                        <h3>Add New Slot for {activeDay}</h3>
                        <div className="dsInputGroup_dosched">
                            <label>Start Time</label>
                            <input type="time" value={newSlot.start} onChange={(e) => setNewSlot({...newSlot, start: e.target.value})} />
                        </div>
                        <div className="dsInputGroup_dosched">
                            <label>End Time</label>
                            <input type="time" value={newSlot.end} onChange={(e) => setNewSlot({...newSlot, end: e.target.value})} />
                        </div>
                        <div className="dsModalActions_dosched">
                            <button className="dsCancel_dosched" onClick={() => setShowAddSlot(false)}>Cancel</button>
                            <button className="dsConfirm_dosched" onClick={addSlot}>Add Time Slot</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorSchedule_dosched;
