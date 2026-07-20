import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid, Clock, Shield, Settings, Filter, Check, Sparkles, TrendingUp,
  AlertTriangle, Info as InfoIcon, Search, Bell, CheckSquare, AlertCircle,
  HelpCircle, RefreshCw, Sun, Moon, Palette, ExternalLink, Download, X,
  ChevronDown, ChevronUp, ChevronRight, Activity, Terminal, MapPin, ArrowLeft
} from 'lucide-react';
import { initialAlarms, initialTimelineEvents } from '../mockData';

/* ── Inline Active Power Chart (same as original) ── */
function ActivePowerChart() {
  const [zoom, setZoom] = useState('5m');

  const generateChartData = (zoomLevel) => {
    const length = 25;
    if (zoomLevel === '5m') return Array.from({ length }, () => 92 + Math.random() * 10);
    if (zoomLevel === '1h') return Array.from({ length }, (_, idx) => {
      const base = 95 - Math.sin((idx / (length - 1)) * Math.PI) * 15;
      return base + Math.random() * 4;
    });
    const now = new Date(); const ch = now.getHours();
    return Array.from({ length }, (_, idx) => {
      const ph = (ch - (length - 1 - idx) + 24) % 24;
      let solar = ph >= 6 && ph <= 18 ? Math.sin(((ph - 6) / 12) * Math.PI) * 110 : 0;
      const bess = (ph > 18 || ph < 6) ? 22 + Math.sin(ph) * 3 : 6;
      return Math.max(5, solar + bess + Math.random() * 4);
    });
  };

  const [data, setData] = useState(() => generateChartData('5m'));

  useEffect(() => {
    setData(generateChartData(zoom));
    const intervalTime = zoom === '5m' ? 3000 : zoom === '1h' ? 20000 : 120000;
    const interval = setInterval(() => {
      setData(prev => {
        let nextVal;
        if (zoom === '5m') {
          const j = (Math.random() - 0.5) * 5;
          nextVal = Math.max(70, Math.min(130, prev[prev.length - 1] + j * 0.8 + (96 - prev[prev.length - 1]) * 0.1));
        } else if (zoom === '1h') {
          const j = (Math.random() - 0.5) * 2;
          nextVal = Math.max(60, Math.min(120, prev[prev.length - 1] + j + (92 - prev[prev.length - 1]) * 0.05));
        } else {
          const now = new Date(); const ph = now.getHours();
          const solar = (ph >= 6 && ph <= 18) ? Math.sin(((ph - 6) / 12) * Math.PI) * 110 : 0;
          const bess = (ph > 18 || ph < 6) ? 25 : 5;
          nextVal = Math.max(5, solar + bess + Math.random() * 4);
        }
        return [...prev.slice(1), nextVal];
      });
    }, intervalTime);
    return () => clearInterval(interval);
  }, [zoom]);

  const getXAxisLabels = () => {
    const labels = []; const now = Date.now();
    let totalMinutes = 12;
    if (zoom === '1h') totalMinutes = 60;
    if (zoom === '1d') totalMinutes = 1440;
    [totalMinutes, Math.floor(totalMinutes * 0.66), Math.floor(totalMinutes * 0.33), 0].forEach(minsAgo => {
      const d = new Date(now - minsAgo * 60 * 1000);
      let hrs = d.getHours(); const mins = d.getMinutes().toString().padStart(2, '0');
      const ampm = hrs >= 12 ? 'PM' : 'AM'; hrs = hrs % 12; hrs = hrs || 12;
      labels.push(`${hrs}:${mins} ${ampm}`);
    });
    return labels;
  };

  const xLabels = getXAxisLabels();
  const svgWidth = 220; const svgHeight = 100;
  const points = data.map((val, idx) => ({
    x: (idx / (data.length - 1)) * svgWidth,
    y: svgHeight - (val / 150) * svgHeight,
  }));
  const lineD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  const areaD = lineD ? `${lineD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z` : '';

  return (
    <div className="power-widget">
      <div className="power-header">
        <span className="power-header-title">Real - Time Active Power of Plant</span>
        <span className="power-header-icon" onClick={() => alert('Opening detail active power view...')}>
          <ExternalLink size={12} />
        </span>
      </div>
      <div className="power-body">
        <div className="power-controls">
          <div className="zoom-label-wrapper">
            <span className="zoom-label">Zoom</span>
            <div className="zoom-btn-group">
              {['5m', '1h', '1d'].map(z => (
                <button key={z} className={`zoom-btn ${zoom === z ? 'active' : ''}`} onClick={() => setZoom(z)}>
                  {z === '5m' ? '5 Min' : z === '1h' ? '1 Hour' : '1 Day'}
                </button>
              ))}
            </div>
          </div>
          <span className="download-icon-btn" onClick={() => alert('Downloading chart dataset...')}><Download size={12} /></span>
        </div>
        <div className="slider-line-container">
          <div className="slider-line-bg">
            <div className="slider-dot start" />
            <div className="slider-dot end" />
          </div>
        </div>
        <div className="chart-grid-container">
          <div className="y-axis-label">MW</div>
          <div className="chart-main">
            <div className="y-axis-vals"><span>150</span><span>75</span><span>0</span></div>
            <svg className="svg-chart-element" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="cyan-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="33.3" x2={svgWidth} y2="33.3" stroke="var(--chart-grid-line)" strokeWidth="0.75" strokeDasharray="3,3" />
              <line x1="0" y1="66.6" x2={svgWidth} y2="66.6" stroke="var(--chart-grid-line)" strokeWidth="0.75" strokeDasharray="3,3" />
              <line x1="0" y1="99" x2={svgWidth} y2="99" stroke="var(--chart-grid-line)" strokeWidth="1" />
              {areaD && <path d={areaD} fill="url(#cyan-area-grad)" />}
              {lineD && <path d={lineD} fill="none" stroke="var(--chart-line)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
          </div>
        </div>
        <div className="x-axis-labels">{xLabels.map((l, i) => <span key={i}>{l}</span>)}</div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ALARM VIEW — Full alarm console with back navigation
   ══════════════════════════════════════════════════════════ */
export default function AlarmView({ onNavigateToHems }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('gridxr-theme') || 'light');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [alarms, setAlarms] = useState(initialAlarms);
  const [timeline, setTimeline] = useState(initialTimelineEvents);

  const settingsRef = useRef(null);
  const profileRef = useRef(null);
  const inspectorBodyRef = useRef(null);

  const handleScrollInspector = (direction) => {
    if (inspectorBodyRef.current) {
      const scrollAmount = direction === 'up' ? -200 : 200;
      inspectorBodyRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  const [selectedAlarmId, setSelectedAlarmId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [resolutionReason, setResolutionReason] = useState('Equipment Restored');
  const [resolvingAlarmId, setResolvingAlarmId] = useState(null);
  const [loadingAssetDetails, setLoadingAssetDetails] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [sopCollapsed, setSopCollapsed] = useState(false);
  const [showHistorical, setShowHistorical] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedTime, setSelectedTime] = useState('1H');
  const [searchQuery, setSearchQuery] = useState('');
  const [networkContext, setNetworkContext] = useState('BSPGCL 185MW (AC) Solar + 254MWh BESS Kajra, Lakhisarai, Bihar, India');
  const [uptimeStr, setUptimeStr] = useState('142d 06h 12m');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
    localStorage.setItem('gridxr-theme', theme);
  }, [theme]);

  useEffect(() => {
    let s = 30, m = 12, h = 6, d = 142;
    const id = setInterval(() => {
      s += 1; if (s >= 60) { s = 0; m += 1; if (m >= 60) { m = 0; h += 1; if (h >= 24) { h = 0; d += 1; } } }
      setUptimeStr(`${d}d ${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m`);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettingsMenu(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileCard(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isWithinTimeWindow = (alarm) => {
    const now = new Date();
    const windowMs = selectedTime === '1H' ? 3600000 : selectedTime === '6H' ? 21600000 : 86400000;
    if (!alarm.timestamp) return true;
    const parts = alarm.timestamp.split(/[:.]/);
    const ad = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2] || 0), parseInt(parts[3] || 0));
    const diff = now - ad;
    return diff >= 0 && diff <= windowMs;
  };

  const showToast = (text, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const addTimelineEvent = (description, severity = 'info') => {
    const now = new Date();
    const ts = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
    setTimeline(prev => [{ id: Date.now() + Math.random(), timestamp: ts, description, severity, isHistorical: false }, ...prev]);
  };

  useEffect(() => {
    const handler = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') { setActiveModal(null); setDrawerOpen(false); setSelectedAlarmId(null); }
      if (!selectedAlarmId) return;
      const sel = alarms.find(a => a.id === selectedAlarmId);
      if (!sel || sel.isHistorical) return;
      if ((e.key === 'a' || e.key === 'A') && (sel.status === 'unack' || sel.status === 'active')) setActiveModal('ack');
      else if (e.key === 'i' || e.key === 'I') handleInvestigate(sel);
      else if (e.key === 'r' || e.key === 'R') setActiveModal('resolve');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedAlarmId, alarms]);

  const handleSelectRow = (alarm) => { if (!alarm.isHistorical) setSelectedAlarmId(alarm.id); };

  const handleConfirmAcknowledge = () => {
    setAlarms(prev => prev.map(a => {
      if (a.id !== selectedAlarmId) return a;
      const ts = new Date().toTimeString().slice(0, 8);
      return { ...a, status: 'ack', currentState: 'ACKNOWLEDGED', acknowledged: ts, ackOperator: 'J. Miller', lastUpdate: ts };
    }));
    const alarm = alarms.find(a => a.id === selectedAlarmId);
    addTimelineEvent(`Alarm Acknowledged: ${alarm.assetId} - ${alarm.description}`, 'resolved');
    showToast(`Alarm Acknowledged: ${alarm.assetId}`, 'success');
    setActiveModal(null);
  };

  const handleInvestigate = (alarm) => {
    if (!alarm) return;
    setLoadingAssetDetails(true);
    addTimelineEvent(`Investigation Started: ${alarm.assetId} - ${alarm.description}`, 'info');
    showToast(`Investigation Started: ${alarm.assetId}`, 'info');
    if (typeof window.onInvestigate === 'function') window.onInvestigate(alarm.assetId);
    setTimeout(() => { setLoadingAssetDetails(false); setDrawerOpen(true); }, 300);
  };

  const handleConfirmResolve = () => {
    const alarmId = selectedAlarmId;
    const alarm = alarms.find(a => a.id === alarmId);
    if (!alarm) return;
    setLoadingResolve(true);
    setTimeout(() => {
      setLoadingResolve(false);
      setAlarms(prev => prev.map(a => {
        if (a.id !== alarmId) return a;
        const ts = new Date().toTimeString().slice(0, 8);
        return { ...a, status: 'rtn', currentState: `RTN - ${resolutionReason}`, lastUpdate: ts };
      }));
      setResolvingAlarmId(alarmId);
      addTimelineEvent(`Equipment Restored: ${alarm.assetId} (${resolutionReason})`, 'resolved');
      addTimelineEvent(`Returned to Normal (RTN): ${alarm.assetId}`, 'resolved');
      showToast(`Event Resolved: ${resolutionReason}`, 'success');
      setActiveModal(null);
      setDrawerOpen(false);
      setSelectedAlarmId(null);
      setTimeout(() => {
        setAlarms(prev => prev.map(a => a.id === alarmId ? { ...a, isHistorical: true } : a));
        setResolvingAlarmId(null);
      }, 600);
    }, 800);
  };

  const handleConfirmRemoteOperation = () => {
    const alarm = alarms.find(a => a.id === selectedAlarmId);
    if (!alarm) return;
    addTimelineEvent(`Remote command sent: Reset request to ${alarm.assetId}`, 'info');
    showToast(`Remote command sent to ${alarm.assetId}`, 'info');
    setActiveModal(null);
    const ts = new Date().toTimeString().slice(0, 8);
    setAlarms(prev => prev.map(a => a.id === selectedAlarmId ? { ...a, notes: (a.notes ? a.notes + '\n' : '') + `[${ts}] Remote reset command executed by operator.`, lastUpdate: ts } : a));
  };

  const handleUpdateNotes = (text) => {
    const ts = new Date().toTimeString().slice(0, 8);
    setAlarms(prev => prev.map(a => a.id === selectedAlarmId ? { ...a, notes: text, lastUpdate: ts } : a));
  };

  const handleToggleSopStep = (idx) => {
    setAlarms(prev => prev.map(a => {
      if (a.id !== selectedAlarmId) return a;
      const ns = [...a.sopSteps]; ns[idx] = !ns[idx];
      return { ...a, sopSteps: ns, sopProgress: Math.round((ns.filter(Boolean).length / 6) * 100) };
    }));
  };

  const activeAlarmsList = alarms.filter(a => !a.isHistorical);
  const historicalAlarmsList = alarms.filter(a => a.isHistorical);

  const criticalCount = activeAlarmsList.filter(a => a.severity === 'critical' && a.status !== 'rtn').length;
  const activeCount   = activeAlarmsList.filter(a => a.status === 'active' || a.status === 'unack').length;
  const unackCount    = activeAlarmsList.filter(a => a.status === 'unack').length;

  const liveSummary = {
    critical: activeAlarmsList.filter(a => a.severity === 'critical' && a.status !== 'rtn').length,
    major:    activeAlarmsList.filter(a => a.severity === 'major'    && a.status !== 'rtn').length,
    minor:    activeAlarmsList.filter(a => a.severity === 'minor'    && a.status !== 'rtn').length,
    info:     activeAlarmsList.filter(a => a.severity === 'info'     && a.status !== 'rtn').length,
  };

  const filterAlarms = (list) => list.filter(alarm => {
    if (selectedSeverity !== 'ALL' && alarm.severity !== selectedSeverity.toLowerCase()) return false;
    if (!isWithinTimeWindow(alarm)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!alarm.assetId.toLowerCase().includes(q) && !alarm.description.toLowerCase().includes(q) && !(alarm.assetName?.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const filteredActive     = filterAlarms(activeAlarmsList);
  const filteredHistorical = filterAlarms(historicalAlarmsList);
  const selectedAlarm      = alarms.find(a => a.id === selectedAlarmId);

  const getSevColor = (s) => ({ critical: 'critical', major: 'major', minor: 'minor', info: 'info' }[s] || '');

  return (
    <div className="alarm-app-container view-enter">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item toast-${t.type}`}>
            {t.type === 'success' ? <Check size={16} color="#10b981" /> : <AlertTriangle size={16} />}
            <span className="toast-text">{t.text}</span>
          </div>
        ))}
      </div>

      {/* Loading overlay */}
      {loadingAssetDetails && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span className="loading-text">Loading Asset Details...</span>
        </div>
      )}

      {/* Inspector Modal matching Screenshots 1 & 2 */}
      {drawerOpen && selectedAlarm && (
        <div className="modal-overlay" onClick={() => { setDrawerOpen(false); setSelectedAlarmId(null); }}>
          <div className="inspector-popup-card" onClick={e => e.stopPropagation()}>
            {/* Top Header */}
            <div className="inspector-topbar">
              <h3>ALARM INSPECTOR</h3>
              <button className="inspector-close-btn" onClick={() => { setDrawerOpen(false); setSelectedAlarmId(null); }}>
                <X size={16} />
              </button>
            </div>

            {/* Operator & Last Update Banner */}
            <div className="inspector-banner">
              <div className="banner-item">
                <span className="banner-lbl">Operator</span>
                <span className="banner-val">{selectedAlarm.ackOperator || 'SYSTEM'}</span>
              </div>
              <div className="banner-item">
                <span className="banner-lbl">Last Update</span>
                <span className="banner-val">{selectedAlarm.lastUpdate || selectedAlarm.timestamp}</span>
              </div>
            </div>

            {/* Side Scroll Buttons */}
            <div className="inspector-scroll-controls">
              <button
                className="scroll-btn"
                onClick={(e) => { e.stopPropagation(); handleScrollInspector('up'); }}
                title="Scroll Up"
              >
                <ChevronUp size={18} />
              </button>
              <button
                className="scroll-btn"
                onClick={(e) => { e.stopPropagation(); handleScrollInspector('down'); }}
                title="Scroll Down"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="inspector-body" ref={inspectorBodyRef}>
              {/* Card 1: Alarm Information */}
              <div className="inspector-card">
                <div className="inspector-card-title">ALARM INFORMATION</div>
                <div className="inspector-grid">
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Timestamp</span>
                    <span className="inspector-val timestamp-val">{selectedAlarm.timestamp}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Asset ID</span>
                    <span className="inspector-val">{selectedAlarm.assetId}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Description</span>
                    <span className="inspector-val">{selectedAlarm.description}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Severity</span>
                    <span className={`severity-pill ${selectedAlarm.severity}`}>{selectedAlarm.severity.toUpperCase()}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Status</span>
                    <span className="inspector-val">{selectedAlarm.status.toUpperCase()}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Category</span>
                    <span className="inspector-val">{selectedAlarm.category || 'Protection'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Region</span>
                    <span className="inspector-val">{selectedAlarm.region || 'Kajra, Bihar, India'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Voltage Level</span>
                    <span className="inspector-val">{selectedAlarm.voltageLevel || '33 kV'}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Equipment Details */}
              <div className="inspector-card">
                <div className="inspector-card-title">EQUIPMENT DETAILS</div>
                <div className="inspector-grid">
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Asset Name</span>
                    <span className="inspector-val">{selectedAlarm.assetName || 'PCC 33kV Incomer Breaker'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Current State</span>
                    <span className="inspector-val">{selectedAlarm.currentState || 'TRIPPED / OPEN'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Voltage</span>
                    <span className="inspector-val">{selectedAlarm.voltage || '0.0 kV'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Frequency</span>
                    <span className="inspector-val">{selectedAlarm.frequency || '50.00 Hz'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Active Power</span>
                    <span className="inspector-val">{selectedAlarm.activePower || '0.0 MW'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Reactive Power</span>
                    <span className="inspector-val">{selectedAlarm.reactivePower || '0.0 MVAr'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Temperature</span>
                    <span className="inspector-val">{selectedAlarm.temperature || '34 °C'}</span>
                  </div>
                  <div className="inspector-grid-cell">
                    <span className="inspector-lbl">Comms Link</span>
                    <span className="inspector-val green-text">{selectedAlarm.commStatus || 'Connected'}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Standard Operating Procedure (SOP) */}
              <div className="inspector-card">
                <div className="inspector-card-title-row" onClick={() => setSopCollapsed(!sopCollapsed)}>
                  <span className="inspector-card-title">STANDARD OPERATING PROCEDURE (SOP)</span>
                  <span className="inspector-collapse-icon">{sopCollapsed ? 'v' : '^'}</span>
                </div>
                {!sopCollapsed && (
                  <>
                    <div className="sop-list-white">
                      {[
                        '1. Verify breaker status indication',
                        '2. Check protection relay telemetry logs',
                        '3. Confirm line voltage and sync variables',
                        '4. Verify link gateway communication status',
                        '5. Attempt remote reset/operation command',
                        '6. Escalate to maintenance if unsuccessful'
                      ].map((step, idx) => {
                        const isChecked = selectedAlarm.sopSteps?.[idx] || false;
                        return (
                          <label key={idx} className="sop-item-row" onClick={(e) => { e.stopPropagation(); handleToggleSopStep(idx); }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                            />
                            <span className="sop-item-text" style={{ textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.6 : 1 }}>
                              {step}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="sop-progress-row">
                      <span>SOP Checklist Progress</span>
                      <span>{selectedAlarm.sopProgress || 0}%</span>
                    </div>
                    <div className="sop-progress-bar-bg">
                      <div className="sop-progress-bar-fill" style={{ width: `${selectedAlarm.sopProgress || 0}%` }} />
                    </div>
                  </>
                )}
              </div>

              {/* Card 4: Operator Notes */}
              <div className="inspector-card">
                <div className="inspector-card-title">OPERATOR NOTES</div>
                <textarea
                  className="inspector-textarea"
                  placeholder="Enter investigation notes..."
                  value={selectedAlarm.notes || ''}
                  onChange={e => handleUpdateNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="inspector-footer-btns">
              <button
                className="btn-cyan-solid"
                disabled={selectedAlarm?.status !== 'unack' && selectedAlarm?.status !== 'active'}
                onClick={() => setActiveModal('ack')}
              >
                ACKNOWLEDGE
              </button>
              <button className="btn-red-outline" onClick={() => setActiveModal('resolve')}>
                RESOLVE EVENT
              </button>
              <button className="btn-dark-solid" onClick={() => { setDrawerOpen(false); setSelectedAlarmId(null); }}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACK Modal */}
      {activeModal === 'ack' && (
        <div className="modal-overlay confirm-modal-overlay">
          <div className="modal-card">
            <div className="modal-header"><AlertCircle size={18} /><h4>Confirm Acknowledge</h4></div>
            <div className="modal-body">
              <span className="modal-text">Are you sure you want to acknowledge alarm <strong>{selectedAlarm?.assetId}</strong>? This will record operator J. Miller and silence active sirens.</span>
            </div>
            <div className="modal-footer">
              <button className="btn-action-outline" style={{ height: 32 }} onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="btn-action-solid" style={{ height: 32 }} onClick={handleConfirmAcknowledge}>Acknowledge</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {activeModal === 'resolve' && (
        <div className="modal-overlay confirm-modal-overlay">
          {loadingResolve && <div className="loading-overlay"><div className="spinner" /><span className="loading-text">Processing...</span></div>}
          <div className="modal-card">
            <div className="modal-header"><CheckSquare size={18} /><h4>Resolve Event</h4></div>
            <div className="modal-body">
              <span className="modal-text">Confirm resolution for equipment <strong>{selectedAlarm?.assetId}</strong>. This will trigger Return to Normal (RTN) transition and archive the event.</span>
              <div className="modal-field">
                <span className="modal-field-label">Resolution Reason</span>
                <select className="modal-select" value={resolutionReason} onChange={e => setResolutionReason(e.target.value)}>
                  {['Equipment Restored','Remote Reset Successful','Operator Intervention','Maintenance Completed','Transient Fault','False Alarm'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-action-outline" style={{ height: 32 }} onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="btn-action-solid" style={{ height: 32 }} onClick={handleConfirmResolve}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Remote Op Modal */}
      {activeModal === 'remote' && (
        <div className="modal-overlay confirm-modal-overlay">
          <div className="modal-card">
            <div className="modal-header"><Settings size={18} /><h4>Execute Remote Command</h4></div>
            <div className="modal-body">
              <span className="modal-text">Confirm remote controller reset command to <strong>{selectedAlarm?.assetId}</strong>. This action is logged and tracked.</span>
            </div>
            <div className="modal-footer">
              <button className="btn-action-outline" style={{ height: 32 }} onClick={() => setActiveModal(null)}>Cancel</button>
              <button className="btn-action-solid" style={{ height: 32 }} onClick={handleConfirmRemoteOperation}>Execute</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <header className="alarm-app-header">
        <div className="alarm-header-left">
          <button className="alarm-back-btn" onClick={onNavigateToHems}>
            <ArrowLeft size={13} />
            Plant Overview
          </button>
          <div style={{ borderLeft: '1px solid var(--border-color)', height: 20 }} />
          <div>
            <div className="alarm-brand-name">BSPGCL</div>
            <div className="alarm-brand-sub">185MW (AC) Solar + 254MWh BESS</div>
            <div className="alarm-brand-sub">Kajra, Lakhisarai, Bihar, India</div>
          </div>
        </div>

        <div className="alarm-header-right">

          <div className="settings-menu-container" ref={settingsRef}>
            <button className="icon-btn" onClick={() => setShowSettingsMenu(!showSettingsMenu)} title="Display Settings"
              style={{ backgroundColor: showSettingsMenu ? 'var(--primary-light)' : 'transparent', color: showSettingsMenu ? 'var(--primary)' : 'var(--text-muted)' }}>
              <Settings size={17} />
            </button>
            {showSettingsMenu && (
              <div className="settings-menu">
                <div className="settings-menu-title">Console Settings</div>
                <div className="settings-item">
                  <div className="settings-item-label">Interface Theme</div>
                  <select className="settings-select" value={theme} onChange={e => setTheme(e.target.value)}>
                    <option value="light">Light Theme</option>
                    <option value="dark">Dark Theme</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="profile-menu-container" ref={profileRef}>
            <div onClick={() => setShowProfileCard(!showProfileCard)} style={{ cursor: 'pointer', width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0055ff,#00b4d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white', border: '2px solid var(--border-color)' }}>
              AM
            </div>
            {showProfileCard && (
              <div className="profile-dropdown-card">
                <div className="profile-card-header">
                  <div className="profile-card-avatar-wrapper">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#0055ff,#00b4d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>AM</div>
                  </div>
                  <div className="profile-card-main-info">
                    <h4 className="profile-card-name">Arjun Mehta</h4>
                    <span className="profile-card-role">Senior Grid Operator</span>
                  </div>
                </div>
                <div className="profile-card-divider" />
                <div className="profile-card-metadata">
                  <div className="metadata-item"><Shield size={12} className="metadata-icon" /><span className="metadata-text">GXR-8829</span></div>
                  <div className="metadata-item"><Clock size={12} className="metadata-icon" /><span className="metadata-text">Joined Oct 2022</span></div>
                  <div className="metadata-item"><MapPin size={12} className="metadata-icon" /><span className="metadata-text">Noida Office</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Console Title Bar ── */}
      <div className="console-title-bar">
        <div className="title-left">
          <div className="title-accent" />
          <h1>Alarm &amp; Event Console</h1>
          <div className="title-badges">
            <div className="badge badge-critical">Critical: {criticalCount}</div>
            <div className="badge badge-active">Active: {activeCount}</div>
            <div className="badge badge-unack">Unack: {unackCount}</div>
          </div>
        </div>
      </div>

      {/* ── Dashboard Grid ── */}
      <div className="dashboard-grid" style={{ flex: 1, overflow: 'hidden' }}>

        {/* Left Sidebar */}
        <aside className="sidebar-left">
          {/* Network Context */}
          <div className="widget">
            <div className="widget-title">Network Context</div>
            <div className="context-select-wrapper">
              <select className="context-select" value={networkContext} onChange={e => setNetworkContext(e.target.value)}>
                <option>BSPGCL 185MW (AC) Solar + 254MWh BESS Kajra, Lakhisarai, Bihar, India</option>
              </select>
            </div>
            <div className="plant-status-container">
              <div className="plant-status-group">
                <svg className="plant-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/><line x1="3" y1="21" x2="21" y2="3"/>
                  <path d="M 6.5 9 C 7.5 7.5, 8.5 7.5, 9.5 9 S 11.5 9.5, 12.5 9"/><line x1="13" y1="14" x2="17" y2="14"/>
                  <line x1="13" y1="16.5" x2="17" y2="16.5" strokeDasharray="1.5,1.5"/>
                </svg>
                <div className="plant-status-details">
                  <span className="plant-status-label">Inverter Available</span>
                  <div className="plant-status-metrics">
                    <div className="metric-box box-green">62</div>
                    <div className="metric-box box-grey">0</div>
                    <div className="metric-total"><span className="total-lbl">Total</span><span className="total-val">62</span></div>
                  </div>
                </div>
              </div>
              <div className="plant-status-divider" />
              <div className="plant-status-group">
                <svg className="plant-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  {[5,9.5,14,18.5].map((y,i) => <rect key={i} x="7" y={y} width="10" height="2.5" rx="0.5"/>)}
                </svg>
                <div className="plant-status-details">
                  <span className="plant-status-label">BMS Status</span>
                  <div className="plant-status-metrics">
                    <div className="metric-box box-green">41</div>
                    <div className="metric-box box-grey">0</div>
                    <div className="metric-total"><span className="total-lbl">Total</span><span className="total-val">41</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Summary */}
          <div className="widget">
            <div className="widget-title">Live Summary</div>
            <div className="summary-list">
              {[['CRITICAL','critical',liveSummary.critical],['MAJOR','major',liveSummary.major],['MINOR','minor',liveSummary.minor],['INFO','info',liveSummary.info]].map(([key, cls, val]) => (
                <div key={key} className={`summary-row summary-${cls} ${selectedSeverity === key ? 'active-filter' : ''}`}
                  onClick={() => setSelectedSeverity(selectedSeverity === key ? 'ALL' : key)}>
                  <span className="summary-name">{key.charAt(0) + key.slice(1).toLowerCase()}</span>
                  <span className="summary-value">{String(val).padStart(2,'0')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Power Chart */}
          <div className="widget" style={{ paddingBottom: 16 }}>
            <div className="widget-title">Real-Time Active Power of Plant</div>
            <ActivePowerChart />
          </div>
        </aside>

        {/* Center: Table */}
        <main className="main-content">
          {/* Filters */}
          <div className="filters-toolbar">
            <div className="filters-left">
              <div className="filters-title-btn"><Filter size={12} /><span>Filters</span></div>
              <div className="filter-dropdown-wrapper">
                <select className="filter-select" value={selectedSeverity} onChange={e => setSelectedSeverity(e.target.value)}>
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="MAJOR">Major</option>
                  <option value="MINOR">Minor</option>
                  <option value="INFO">Info</option>
                </select>
              </div>
              <div className="filter-dropdown-wrapper">
                <select className="filter-select" value={selectedTime} onChange={e => setSelectedTime(e.target.value)}>
                  <option value="1H">Time: Last 1h</option>
                  <option value="6H">Time: Last 6h</option>
                  <option value="24H">Time: Last 24h</option>
                </select>
              </div>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input type="text" placeholder="Search description/asset..." className="filter-select"
                style={{ paddingLeft: 24, width: 180, textTransform: 'none' }}
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <Search size={10} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Alarm Table */}
          <div className="table-wrapper">
            <table className="alarm-table">
              <thead>
                <tr>
                  <th className="col-checkbox">SEL</th>
                  <th>Timestamp</th>
                  <th>Asset ID</th>
                  <th>Event Description</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActive.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>No active alarms match the current filter criteria.</td></tr>
                ) : (
                  filteredActive.map(alarm => {
                    const isSel = selectedAlarmId === alarm.id;
                    const isRes = resolvingAlarmId === alarm.id;
                    const isFlash = alarm.status === 'unack';
                    let rowClass = isSel ? 'selected' : isRes ? 'row-resolving-rtn' : isFlash ? 'row-flashing-unack' : '';
                    return (
                      <tr key={alarm.id} className={rowClass} onClick={() => handleSelectRow(alarm)}>
                        <td className="col-checkbox" onClick={e => { e.stopPropagation(); handleSelectRow(alarm); }}>
                          <div className={`custom-checkbox ${isSel ? 'checked' : ''}`}>{isSel && <Check size={10} strokeWidth={3} />}</div>
                        </td>
                        <td className={`cell-timestamp ${getSevColor(alarm.severity)}`}>{alarm.timestamp}</td>
                        <td className="cell-asset">{alarm.assetId}</td>
                        <td className="cell-description">{alarm.description}</td>
                        <td><span className={`severity-pill ${alarm.severity}`}>{alarm.severity}</span></td>
                        <td><span className={`status-cell ${alarm.status}`}>{alarm.status}</span></td>
                      </tr>
                    );
                  })
                )}

                <tr className="historical-buffer-header-row" onClick={() => setShowHistorical(!showHistorical)}>
                  <td colSpan={6}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {showHistorical ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span>Historical Buffer ({filteredHistorical.length} Archived Events)</span>
                    </div>
                  </td>
                </tr>

                {showHistorical && (filteredHistorical.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px 0', opacity: 0.5 }}>No historical alarms logged.</td></tr>
                ) : (
                  filteredHistorical.map(alarm => (
                    <tr key={alarm.id} className="historical-row" style={{ cursor: 'not-allowed' }}>
                      <td></td>
                      <td className="cell-timestamp info" style={{ opacity: 0.6 }}>{alarm.timestamp}</td>
                      <td className="cell-asset" style={{ opacity: 0.6 }}>{alarm.assetId}</td>
                      <td className="cell-description" style={{ opacity: 0.6 }}>{alarm.description}</td>
                      <td><span className="severity-pill info" style={{ opacity: 0.6 }}>{alarm.severity}</span></td>
                      <td><span className="status-cell logged" style={{ opacity: 0.6 }}>{alarm.status}</span></td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="table-footer">
            <div className="footer-left">
              <button className="btn-action-solid" disabled={!selectedAlarmId || (selectedAlarm?.status !== 'unack' && selectedAlarm?.status !== 'active')} onClick={() => setActiveModal('ack')} style={{ height: 32 }}>
                Acknowledge Selected <span className="kbd-badge">A</span>
              </button>
              <button className="btn-action-outline" disabled={!selectedAlarmId} onClick={() => setActiveModal('resolve')} style={{ height: 32 }}>
                Resolve Event <span className="kbd-badge">R</span>
              </button>
              {selectedAlarmId && <span className="selected-count">Selected: <strong>{selectedAlarm?.assetId}</strong></span>}
            </div>
            <div className="footer-right">
              <button className="btn-action-outline" disabled={!selectedAlarmId} onClick={() => handleInvestigate(selectedAlarm)}
                style={{ height: 32, color: 'var(--primary)', borderColor: 'var(--primary)' }}>
                Investigate <span className="kbd-badge">I</span>
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-right">
          <div className="widget timeline-widget">
            <div className="widget-title">
              <span>SOE Timeline</span>
              <span className="timeline-header-badge">Buffer: 5000 Events</span>
            </div>
            <div className="timeline-container">
              {timeline.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>No timeline events recorded.</div>
              ) : (
                timeline.map((evt, idx) => {
                  const totalEvts = timeline.length;
                  const fadeStart = totalEvts - 6;
                  const isFading = idx >= fadeStart;
                  const itemOpacity = isFading ? Math.max(0.5, 1 - (idx - fadeStart + 1) * 0.07) : 1;

                  return (
                    <div key={evt.id} className="timeline-item" style={{ opacity: itemOpacity }}>
                      <div className={`timeline-dot ${evt.severity}`} />
                      <div className="timeline-content">
                        <span className={`timeline-time ${evt.severity}`}>{evt.timestamp}</span>
                        <span className={`timeline-desc ${evt.isHistorical ? 'historical' : ''}`}>{evt.description}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="widget">
            <div className="widget-title">Shift Statistics</div>
            <div className="stats-grid">
              <div className="stat-row-large"><span className="stat-name">Events Today</span><span className="stat-big-val">56</span></div>
              <div className="ratio-bar-container">
                <div className="ratio-bar">
                  <div className="ratio-fill critical" style={{ width: '6%' }} />
                  <div className="ratio-fill resolved" style={{ width: '91%' }} />
                  <div className="ratio-fill active" style={{ width: '3%' }} />
                </div>
                <div className="ratio-labels">
                  <div className="ratio-label-item critical"><span className="ratio-label-text">Active</span><span className="ratio-label-num">03</span></div>
                  <div className="ratio-label-item resolved"><span className="ratio-label-text">Resolved</span><span className="ratio-label-num">51</span></div>
                </div>
              </div>
              <div className="avg-response-wrapper"><span className="avg-response-label">Avg Response</span><span className="avg-response-val">38s</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
