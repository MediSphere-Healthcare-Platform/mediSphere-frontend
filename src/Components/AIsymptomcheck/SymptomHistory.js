import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { symptomApi } from '../../services/api';
import {
    Brain, History, Trash2, ChevronDown, ChevronUp, Calendar,
    Activity, Stethoscope, Lightbulb, AlertTriangle, Loader2,
    CheckCircle, ShieldAlert, TrendingUp, Plus, Info, X
} from 'lucide-react';
import './SymptomHistory.css';

const URGENCY_CONFIG = {
    LOW:    { label: 'Low',    className: 'urg_low',    icon: CheckCircle },
    MEDIUM: { label: 'Medium', className: 'urg_medium', icon: TrendingUp  },
    HIGH:   { label: 'High',   className: 'urg_high',   icon: ShieldAlert },
};

const SymptomHistory = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [clearingAll, setClearingAll] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);

    // ── Fetch ──────────────────────────────────────────
    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await symptomApi.get('/symptoms/history');
            setHistory(res.data || []);
        } catch (err) {
            setError('Failed to load history. Make sure the AI service is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // ── Delete one ─────────────────────────────────────
    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await symptomApi.delete(`/symptoms/history/${id}`);
            setHistory(prev => prev.filter(h => h.id !== id));
            if (expandedId === id) setExpandedId(null);
        } catch (err) {
            alert('Failed to delete record. ' + (err.response?.data?.message || ''));
        } finally {
            setDeletingId(null);
        }
    };

    // ── Clear all ──────────────────────────────────────
    const handleClearAll = async () => {
        setClearingAll(true);
        try {
            await symptomApi.delete('/symptoms/history');
            setHistory([]);
            setConfirmClear(false);
        } catch (err) {
            alert('Failed to clear history. ' + (err.response?.data?.message || ''));
        } finally {
            setClearingAll(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const formatDate = (ts) => {
        if (!ts) return 'N/A';
        return new Date(ts).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="container_symhistory">
            {/* Hero */}
            <div className="hero_symhistory">
                <div className="hero_symhistory_content">
                    <div className="hero_symhistory_badge">
                        <History size={13} /> Check History
                    </div>
                    <h1>Your Symptom History</h1>
                    <p>Review all your past AI symptom assessments in one place.</p>
                </div>
                <div className="hero_symhistory_actions">
                    <button
                        className="btn_symhistory_new"
                        onClick={() => navigate(`/symptom-check/${patientId}`)}
                    >
                        <Plus size={16} /> New Check
                    </button>
                    {history.length > 0 && (
                        <button
                            className="btn_symhistory_clearall"
                            onClick={() => setConfirmClear(true)}
                        >
                            <Trash2 size={15} /> Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Confirm clear-all modal */}
            {confirmClear && (
                <div className="symhistory_modal_overlay" onClick={() => setConfirmClear(false)}>
                    <div className="symhistory_modal" onClick={e => e.stopPropagation()}>
                        <div className="symhistory_modal_icon">
                            <AlertTriangle size={24} />
                        </div>
                        <h3>Clear All History?</h3>
                        <p>This will permanently delete all {history.length} symptom check records. This cannot be undone.</p>
                        <div className="symhistory_modal_actions">
                            <button className="btn_modal_cancel_sym" onClick={() => setConfirmClear(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn_modal_confirm_sym"
                                onClick={handleClearAll}
                                disabled={clearingAll}
                            >
                                {clearingAll ? <><Loader2 size={15} className="sh_spin" /> Clearing…</> : 'Yes, Clear All'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="symhistory_error">
                    <AlertTriangle size={15} /> {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="symhistory_loading">
                    <Loader2 size={36} className="sh_spin" />
                    <p>Loading your history…</p>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && history.length === 0 && (
                <div className="symhistory_empty">
                    <Brain size={56} className="empty_brain" />
                    <h3>No History Yet</h3>
                    <p>Your symptom check history will appear here. Start your first check below.</p>
                    <button
                        className="btn_empty_check"
                        onClick={() => navigate(`/symptom-check/${patientId}`)}
                    >
                        <Brain size={16} /> Start Symptom Check
                    </button>
                </div>
            )}

            {/* History list */}
            {!loading && history.length > 0 && (
                <div className="symhistory_list">
                    <div className="symhistory_count">
                        {history.length} record{history.length !== 1 ? 's' : ''}
                    </div>
                    {history.map(record => {
                        const urg = URGENCY_CONFIG[record.urgencyLevel] || URGENCY_CONFIG.LOW;
                        const UrgIcon = urg.icon;
                        const isExpanded = expandedId === record.id;

                        return (
                            <div key={record.id} className={`symhistory_card ${isExpanded ? 'card_expanded' : ''}`}>
                                {/* Card header */}
                                <div
                                    className="symhistory_card_header"
                                    onClick={() => toggleExpand(record.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => e.key === 'Enter' && toggleExpand(record.id)}
                                >
                                    <div className="symhistory_card_left">
                                        <div className={`symhistory_urgency_dot ${urg.className}`}>
                                            <UrgIcon size={14} />
                                        </div>
                                        <div className="symhistory_card_info">
                                            <div className="symhistory_symptoms_preview">
                                                {(record.symptoms || []).slice(0, 4).map((s, i) => (
                                                    <span key={i} className="sh_symptom_tag">{s}</span>
                                                ))}
                                                {(record.symptoms || []).length > 4 && (
                                                    <span className="sh_symptom_more">
                                                        +{record.symptoms.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                            <div className="symhistory_meta">
                                                <span className="sh_meta_item">
                                                    <Calendar size={12} />
                                                    {formatDate(record.checkedAt)}
                                                </span>
                                                <span className="sh_meta_item">
                                                    Age {record.age} · {record.gender}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="symhistory_card_right">
                                        <span className={`sh_urgency_badge ${urg.className}`}>
                                            {urg.label} Risk
                                        </span>
                                        <button
                                            className="btn_sh_delete"
                                            onClick={e => { e.stopPropagation(); handleDelete(record.id); }}
                                            disabled={deletingId === record.id}
                                            title="Delete record"
                                        >
                                            {deletingId === record.id
                                                ? <Loader2 size={14} className="sh_spin" />
                                                : <Trash2 size={14} />
                                            }
                                        </button>
                                        <div className="sh_expand_icon">
                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded detail */}
                                {isExpanded && (
                                    <div className="symhistory_card_body">
                                        {/* All symptoms */}
                                        <div className="sh_detail_section">
                                            <h5><Activity size={13} /> Symptoms Reported</h5>
                                            <div className="sh_detail_chips">
                                                {(record.symptoms || []).map((s, i) => (
                                                    <span key={i} className="sh_symptom_tag">{s}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Possible conditions */}
                                        <div className="sh_detail_section">
                                            <h5><Brain size={13} /> Possible Conditions</h5>
                                            <div className="sh_detail_chips">
                                                {(record.possibleConditions || []).map((c, i) => (
                                                    <span key={i} className="sh_condition_tag">{c}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Specialties */}
                                        <div className="sh_detail_section">
                                            <h5><Stethoscope size={13} /> Recommended Specialties</h5>
                                            <div className="sh_detail_chips">
                                                {(record.recommendedSpecialties || []).map((s, i) => (
                                                    <span key={i} className="sh_specialty_tag">{s}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* General advice */}
                                        <div className="sh_detail_section">
                                            <h5><Lightbulb size={13} /> General Advice</h5>
                                            <ul className="sh_advice_list">
                                                {(record.generalAdvice || []).map((a, i) => (
                                                    <li key={i}>
                                                        <CheckCircle size={13} className="sh_advice_check" /> {a}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Additional info */}
                                        {record.additionalInfo && (
                                            <div className="sh_detail_section">
                                                <h5><Info size={13} /> Additional Info Provided</h5>
                                                <p className="sh_additional_info">{record.additionalInfo}</p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="sh_card_actions">
                                            <button
                                                className="btn_sh_book"
                                                onClick={() => navigate(`/book/${patientId}`)}
                                            >
                                                <Calendar size={14} /> Book Appointment
                                            </button>
                                            <button
                                                className="btn_sh_delete_full"
                                                onClick={() => handleDelete(record.id)}
                                                disabled={deletingId === record.id}
                                            >
                                                {deletingId === record.id
                                                    ? <><Loader2 size={14} className="sh_spin" /> Deleting…</>
                                                    : <><Trash2 size={14} /> Delete Record</>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SymptomHistory;
