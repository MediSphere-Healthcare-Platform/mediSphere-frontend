import React, { useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { symptomApi } from '../../services/api';
import {
    Brain, AlertTriangle, CheckCircle, Stethoscope, Lightbulb,
    X, Plus, Loader2, History, Calendar, ChevronRight, Info,
    ShieldAlert, TrendingUp, Activity
} from 'lucide-react';
import './SymptomChecker.css';

const URGENCY_CONFIG = {
    LOW:    { label: 'Low Urgency',    color: 'urgency_low',    icon: CheckCircle,   tip: 'Monitor symptoms. Self-care may be sufficient.' },
    MEDIUM: { label: 'Medium Urgency', color: 'urgency_medium', icon: TrendingUp,    tip: 'Consider scheduling a doctor visit soon.' },
    HIGH:   { label: 'High Urgency',   color: 'urgency_high',   icon: ShieldAlert,   tip: 'Please seek medical attention promptly.' },
};

const SymptomChecker = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    // Form state
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [symptoms, setSymptoms] = useState([]);
    const [symptomInput, setSymptomInput] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    // ── Tag input logic ────────────────────────────────
    const addSymptom = useCallback(() => {
        const val = symptomInput.trim();
        if (val && !symptoms.includes(val)) {
            setSymptoms(prev => [...prev, val]);
        }
        setSymptomInput('');
    }, [symptomInput, symptoms]);

    const handleSymptomKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addSymptom();
        } else if (e.key === 'Backspace' && !symptomInput && symptoms.length > 0) {
            setSymptoms(prev => prev.slice(0, -1));
        }
    };

    const removeSymptom = (sym) => {
        setSymptoms(prev => prev.filter(s => s !== sym));
    };

    // ── Submit ─────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Commit any pending tag input
        const finalSymptoms = symptomInput.trim()
            ? [...new Set([...symptoms, symptomInput.trim()])]
            : symptoms;

        if (finalSymptoms.length === 0) {
            setError('Please add at least one symptom.');
            inputRef.current?.focus();
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            const res = await symptomApi.post('/symptoms/check', {
                age,
                gender,
                symptoms: finalSymptoms,
                additionalInfo: additionalInfo.trim() || undefined
            });
            setResult(res.data);
            setSymptomInput('');
            setSymptoms(finalSymptoms);
            // Scroll to results
            setTimeout(() => {
                document.getElementById('symptom_results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to analyze symptoms. Please try again.';
            setError(typeof msg === 'string' ? msg : 'Failed to analyze symptoms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setResult(null);
        setError('');
        setAge('');
        setGender('');
        setSymptoms([]);
        setSymptomInput('');
        setAdditionalInfo('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const urgency = result ? (URGENCY_CONFIG[result.urgencyLevel] || URGENCY_CONFIG.LOW) : null;

    return (
        <div className="container_symptom">
            {/* Hero */}
            <div className="hero_symptom">
                <div className="hero_symptom_content">
                    <div className="hero_symptom_badge">
                        <Brain size={13} /> AI-Powered
                    </div>
                    <h1>Symptom Checker</h1>
                    <p>
                        Describe your symptoms and get an AI-powered preliminary assessment.
                        Powered by Llama 3.3 — always consult a doctor for a definitive diagnosis.
                    </p>
                </div>
                <div className="hero_symptom_actions">
                    <button
                        className="hero_symptom_history_btn"
                        onClick={() => navigate(`/symptom-history/${patientId}`)}
                    >
                        <History size={16} /> View History <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="symptom_layout">
                {/* ── Form ── */}
                <div className="symptom_form_card">
                    <div className="symptom_form_header">
                        <div className="symptom_form_icon"><Activity size={18} /></div>
                        <div>
                            <h3>Enter Your Details</h3>
                            <p>All fields help improve accuracy</p>
                        </div>
                    </div>

                    {error && (
                        <div className="symptom_error_banner">
                            <AlertTriangle size={15} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="symptom_form_row">
                            <div className="symptom_form_group">
                                <label>Age <span className="req_star">*</span></label>
                                <input
                                    type="number"
                                    placeholder="e.g. 28"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    min="1" max="120"
                                    required
                                />
                            </div>
                            <div className="symptom_form_group">
                                <label>Gender <span className="req_star">*</span></label>
                                <select value={gender} onChange={e => setGender(e.target.value)} required>
                                    <option value="">— Select —</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </div>
                        </div>

                        {/* Tag input for symptoms */}
                        <div className="symptom_form_group">
                            <label>
                                Symptoms <span className="req_star">*</span>
                                <span className="symptom_label_hint"> — press Enter or comma to add each</span>
                            </label>
                            <div
                                className={`symptom_tag_input ${symptoms.length > 0 ? 'has_tags' : ''}`}
                                onClick={() => inputRef.current?.focus()}
                            >
                                {symptoms.map(sym => (
                                    <span key={sym} className="symptom_tag">
                                        {sym}
                                        <button
                                            type="button"
                                            className="symptom_tag_remove"
                                            onClick={(e) => { e.stopPropagation(); removeSymptom(sym); }}
                                            tabIndex={-1}
                                        >
                                            <X size={11} />
                                        </button>
                                    </span>
                                ))}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    className="symptom_tag_text_input"
                                    placeholder={symptoms.length === 0 ? 'e.g. headache, fever, sore throat…' : 'Add more…'}
                                    value={symptomInput}
                                    onChange={e => setSymptomInput(e.target.value)}
                                    onKeyDown={handleSymptomKeyDown}
                                    onBlur={addSymptom}
                                />
                            </div>
                            {symptoms.length === 0 && (
                                <div className="symptom_quick_adds">
                                    {['Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea'].map(s => (
                                        <button
                                            key={s} type="button"
                                            className="quick_add_chip"
                                            onClick={() => !symptoms.includes(s) && setSymptoms(prev => [...prev, s])}
                                            disabled={symptoms.includes(s)}
                                        >
                                            <Plus size={11} /> {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="symptom_form_group">
                            <label>Additional Information <span className="opt_label">(optional)</span></label>
                            <textarea
                                rows={3}
                                placeholder="Duration, existing conditions, medications, or any other relevant context…"
                                value={additionalInfo}
                                onChange={e => setAdditionalInfo(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn_symptom_submit"
                            disabled={loading || !age || !gender}
                        >
                            {loading
                                ? <><Loader2 size={18} className="symptom_spin" /> Analyzing with AI…</>
                                : <><Brain size={18} /> Analyze Symptoms</>
                            }
                        </button>
                    </form>
                </div>

                {/* ── Results ── */}
                <div className="symptom_results_area" id="symptom_results">
                    {loading && (
                        <div className="symptom_results_card results_loading_state">
                            <div className="results_loading_spinner"></div>
                            <h3>Analyzing Your Symptoms</h3>
                            <p>Our AI is reviewing your information…</p>
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="symptom_placeholder_card">
                            <Brain size={56} className="placeholder_brain_icon" />
                            <h3>Ready to Analyze</h3>
                            <p>Fill in your details and symptoms on the left to get an instant AI assessment.</p>
                            <div className="placeholder_features">
                                <div className="placeholder_feature">
                                    <CheckCircle size={16} />
                                    <span>Possible conditions</span>
                                </div>
                                <div className="placeholder_feature">
                                    <Stethoscope size={16} />
                                    <span>Specialist recommendations</span>
                                </div>
                                <div className="placeholder_feature">
                                    <Lightbulb size={16} />
                                    <span>General health advice</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && result && urgency && (
                        <div className="symptom_results_card">
                            {/* Urgency banner */}
                            <div className={`urgency_banner ${urgency.color}`}>
                                <div className="urgency_banner_left">
                                    <urgency.icon size={22} />
                                    <div>
                                        <span className="urgency_label">{urgency.label}</span>
                                        <span className="urgency_tip">{urgency.tip}</span>
                                    </div>
                                </div>
                                <span className="urgency_level_pill">{result.urgencyLevel}</span>
                            </div>

                            {/* Possible conditions */}
                            <div className="result_section">
                                <h4><Activity size={15} /> Possible Conditions</h4>
                                <div className="condition_chips">
                                    {(result.possibleConditions || []).map((c, i) => (
                                        <span key={i} className="condition_chip">{c}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Recommended specialties */}
                            <div className="result_section">
                                <h4><Stethoscope size={15} /> Recommended Specialties</h4>
                                <div className="specialty_chips">
                                    {(result.recommendedSpecialties || []).map((s, i) => (
                                        <span key={i} className="specialty_chip">{s}</span>
                                    ))}
                                </div>
                            </div>

                            {/* General advice */}
                            <div className="result_section">
                                <h4><Lightbulb size={15} /> General Advice</h4>
                                <ul className="advice_list">
                                    {(result.generalAdvice || []).map((a, i) => (
                                        <li key={i}>
                                            <CheckCircle size={14} className="advice_check" />
                                            {a}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Disclaimer */}
                            {result.disclaimer && (
                                <div className="result_disclaimer">
                                    <Info size={13} />
                                    <p>{result.disclaimer}</p>
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="result_actions">
                                <button
                                    className="btn_result_history"
                                    onClick={() => navigate(`/symptom-history/${patientId}`)}
                                >
                                    <History size={15} /> View History
                                </button>
                                <button
                                    className="btn_result_book"
                                    onClick={() => navigate(`/book/${patientId}`)}
                                >
                                    <Calendar size={15} /> Book Appointment
                                </button>
                                <button className="btn_result_reset" onClick={handleReset}>
                                    <X size={15} /> New Check
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SymptomChecker;
