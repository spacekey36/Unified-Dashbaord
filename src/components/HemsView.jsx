import React, { useState } from 'react';
import { Sliders } from 'lucide-react';

/* ──────────────────────────────────────────────
   Exact Static SVG Line Chart matching screenshot
   ────────────────────────────────────────────── */
function SvgChart({
  data = [],
  lineColor = '#00e5ff',
  lineColor2 = '#0055ff',
  data2,
  minY = 0,
  maxY = 100,
  yTicks = [],
  rightYTicks = false,
  showArea = false,
  legend1 = '',
  legend2 = '',
  legend1Hollow = false,
  legend1Color,
  xTicks = [
    '11:30 AM', '11:33 AM', '11:36 AM', '11:39 AM', '11:42 AM', '11:45 AM',
    '11:48 AM', '11:51 AM', '11:54 AM', '11:57 AM', '11:60 AM', '11:63 AM',
    '11:66 AM', '11:69 AM', '11:72 AM', '11:75 AM', '11:78 AM'
  ]
}) {
  const W = 460;
  const H = 170;
  const padL = yTicks.length > 0 ? 40 : 10;
  const padR = rightYTicks ? 32 : 12;
  const padT = 12;
  const padB = 42;

  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const range = (maxY - minY) || 1;

  const toPoint = (val, idx, arr) => {
    const x = padL + (idx / Math.max(1, arr.length - 1)) * chartW;
    const y = padT + chartH - ((val - minY) / range) * chartH;
    return { x, y };
  };

  const pts1 = data.map(toPoint);
  const d1 = pts1.reduce((acc, p, i) => (i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`), '');

  const areaPath = showArea && pts1.length ? `${d1} L ${pts1[pts1.length - 1].x.toFixed(1)} ${(padT + chartH).toFixed(1)} L ${pts1[0].x.toFixed(1)} ${(padT + chartH).toFixed(1)} Z` : '';

  const pts2 = data2 ? data2.map(toPoint) : [];
  const d2 = pts2.reduce((acc, p, i) => (i === 0 ? `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`), '');

  const gradId = `chart-grad-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div className="hems-chart-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          {showArea && (
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
              </linearGradient>
            </defs>
          )}

          {/* Left Y-axis vertical line */}
          {padL > 10 && (
            <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#1b3457" strokeWidth="1" />
          )}

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tickVal) => {
            const numericVal = typeof tickVal === 'number' ? tickVal : parseFloat(tickVal);
            const yPos = padT + chartH - ((numericVal - minY) / range) * chartH;
            const displayLabel = String(tickVal);
            return (
              <g key={tickVal}>
                <line x1={padL} y1={yPos} x2={W - padR} y2={yPos} stroke="#11243b" strokeWidth="1" strokeDasharray="3,3" />
                {padL > 10 && (
                  <text x={padL - 6} y={yPos + 3} fill="#54759e" fontSize="8.5" textAnchor="end" fontFamily="sans-serif">
                    {displayLabel}
                  </text>
                )}
                {rightYTicks && (
                  <text x={W - padR + 6} y={yPos + 3} fill="#54759e" fontSize="8.5" textAnchor="start" fontFamily="sans-serif">
                    {displayLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* Area Fill */}
          {showArea && areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

          {/* Primary Line */}
          {d1 && <path d={d1} fill="none" stroke={lineColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Secondary Line */}
          {d2 && <path d={d2} fill="none" stroke={lineColor2} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />}

          {/* X-axis Rotated Ticks */}
          {xTicks.map((xLabel, idx) => {
            const xPos = padL + (idx / Math.max(1, xTicks.length - 1)) * chartW;
            const yPos = padT + chartH + 10;
            return (
              <text
                key={idx}
                x={xPos}
                y={yPos}
                fill="#54759e"
                fontSize="8.5"
                fontFamily="sans-serif"
                transform={`rotate(-45, ${xPos}, ${yPos})`}
                textAnchor="end"
              >
                {xLabel}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chart Legend Footer */}
      {(legend1 || legend2) && (
        <div className="hems-chart-legend" style={{ display: 'flex', justifyContent: 'center', gap: '16px', paddingTop: '4px', paddingBottom: '2px', fontSize: '9.5px', color: '#6e8ca8' }}>
          {legend1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  display: 'inline-block',
                  border: legend1Hollow ? `1.5px solid ${legend1Color || lineColor2}` : 'none',
                  background: legend1Hollow ? 'transparent' : (legend1Color || lineColor2),
                  borderRadius: 1
                }}
              />
              <span>{legend1}</span>
            </div>
          )}
          {legend2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  width: 9,
                  height: 9,
                  display: 'inline-block',
                  background: lineColor,
                  borderRadius: 1
                }}
              />
              <span>{legend2}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── EXACT STATIC CHART DATA MATCHING SCREENSHOTS ── */
const STATIC_ACTIVE_POWER_SETPOINT = Array(17).fill(100.0);
const STATIC_ACTIVE_POWER_MEAS = [92.5, 95.0, 96.2, 95.8, 95.2, 96.0, 94.1, 88.0, 87.5, 86.2, 90.0, 92.4, 94.0, 95.2, 93.5, 94.2, 91.8];

const STATIC_REACTIVE_POWER_SETPOINT = Array(17).fill(0.0);
const STATIC_REACTIVE_POWER_MEAS = Array(17).fill(0.0);

/* Solar Capability high-density waveform tracing screenshot */
const STATIC_SOLAR_CAPABILITY = [
  160.45, 160.18, 160.30, 161.75, 161.40, 161.00, 162.22, 161.20, 160.60, 160.82,
  159.72, 160.05, 158.00, 158.00, 158.45, 158.00, 158.00, 158.35, 158.55, 160.30,
  160.95, 160.20, 160.85, 161.05, 161.75, 161.65, 161.20, 161.00, 160.40, 159.20,
  158.50, 158.68, 158.00, 158.00, 158.42, 158.12, 158.60, 159.60, 160.95, 161.15,
  161.18, 161.70, 161.55, 162.15, 161.50, 161.05
];

const STATIC_BESS_ACTIVE_MEAS = [12.0, 14.5, 15.2, 14.0, 12.5, 10.0, 7.5, 4.0, 0.0, -3.5, -8.0, -12.5, -15.0, -14.2, -10.0, -4.5, 0.0];
const STATIC_BESS_REACTIVE_MEAS = [1.5, 2.0, 2.8, 2.2, 1.0, 0.0, -1.0, -2.5, -3.0, -2.8, -1.5, 0.0, 1.2, 2.5, 3.0, 2.2, 1.0];

export default function HemsView({ onNavigateToAlarms, alarmCounts }) {
  const [setpointsOpen, setSetpointsOpen] = useState(false);

  // Setpoint Form State
  const [modeOfOp, setModeOfOp] = useState('Auto');
  const [dispatchPriority, setDispatchPriority] = useState('Active Power');
  const [controlMode, setControlMode] = useState('Direct Active Power Mode');
  const [activePowerSp, setActivePowerSp] = useState('185.00');
  const [reactivePowerSp, setReactivePowerSp] = useState('');
  const [pfSp, setPfSp] = useState('0');
  const [socSp, setSocSp] = useState('');
  const [voltageSp, setVoltageSp] = useState('0.00');
  const [freqDroop, setFreqDroop] = useState(true);

  // Setpoint Footer Toggles
  const [energyTimeShift, setEnergyTimeShift] = useState(false);
  const [schedulesChecked, setSchedulesChecked] = useState(true);
  const [batteryPriority, setBatteryPriority] = useState(true);

  const handleReset = () => {
    setModeOfOp('Auto');
    setDispatchPriority('Active Power');
    setControlMode('Direct Active Power Mode');
    setActivePowerSp('185.00');
    setReactivePowerSp('');
    setPfSp('0');
    setSocSp('');
    setVoltageSp('0.00');
    setFreqDroop(true);
    setEnergyTimeShift(false);
    setSchedulesChecked(true);
    setBatteryPriority(true);
  };

  const handleSet = () => {
    setSetpointsOpen(false);
  };

  return (
    <div className="hems-layout view-enter">
      {/* ── HEADER ── */}
      <header className="hems-header">
        <div className="hems-header-left">
          {/* Logo completely removed per request */}
          <div className="hems-brand-info">
            <h1 className="hems-brand-title">BSPGCL</h1>
            <div className="hems-brand-subtitle">
              185MW (AC) Solar + 254MWh BESS<br />Kajra, Lakhisarai, Bihar, India
            </div>
          </div>
          <div className="hems-header-divider" />
          <h2 className="hems-main-title">Hybrid Energy Management System</h2>
        </div>

        <div className="hems-header-right">
          <div className="hems-clock-block">
            <div className="hems-clock-time">11:50:00 AM</div>
            <div className="hems-clock-date">22-Apr-2026</div>
          </div>

          {/* Alarm Count Badges matching screenshot boxes */}
          <div className="hems-badge-boxes">
            <div className="hems-badge-box badge-red" onClick={onNavigateToAlarms} title="Critical Alarms">
              0
            </div>
            <div className="hems-badge-box badge-orange" onClick={onNavigateToAlarms} title="Major Alarms">
              10
            </div>
            <div className="hems-badge-box badge-blue" onClick={onNavigateToAlarms}>
              0
            </div>
            <div className="hems-badge-box badge-blue" onClick={onNavigateToAlarms}>
              0
            </div>
            <div className="hems-badge-box badge-blue" onClick={onNavigateToAlarms} title="Total Alarms">
              10
            </div>
          </div>

          <div className="hems-header-subtext">
            Digital Energy Solutions<br />Power Transmission &amp; Distribution
          </div>

          <div className="hems-user-avatar">
            NC
          </div>
        </div>
      </header>

      {/* ── TOOLBAR / SUB-BAR ── */}
      <div className="hems-toolbar">
        <div className="hems-toolbar-left">
          <button className="hems-nav-tab active">
            HEMSCONTROLLER
          </button>

          <div className="hems-toolbar-stats">
            <div className="hems-toolbar-stat-group">
              <span className="hems-stat-label">P Set: <strong className="hems-stat-val">185.00 MW</strong></span>
              <span className="hems-stat-label">P Meas: <strong className="hems-stat-val">92.39 MW</strong></span>
            </div>
            <div className="hems-toolbar-stat-group">
              <span className="hems-stat-label">Q Set: <strong className="hems-stat-val">0.00 MVAr</strong></span>
              <span className="hems-stat-label">Q Meas: <strong className="hems-stat-val">37.58 MVAr</strong></span>
            </div>
            <div className="hems-toolbar-stat-group">
              <span className="hems-stat-label">Plant Mode of Operation</span>
              <span className="hems-mode-val">Auto</span>
            </div>
          </div>
        </div>

        <div className="hems-toolbar-right">
          <div className="hems-toggle-item">
            <i className="fa-solid fa-toggle-on" style={{ color: '#0055ff', fontSize: 13 }} /> BESS
          </div>
          <div className="hems-toggle-item">
            <i className="fa-solid fa-toggle-on" style={{ color: '#0055ff', fontSize: 13 }} /> Solar PV
          </div>
          <div className="hems-status-item">
            <i className="fa-solid fa-bolt" style={{ color: '#00e5ff', fontSize: 11 }} /> Inverter Available: <strong style={{ color: '#fff', marginLeft: 3 }}>62</strong>
          </div>
          <div className="hems-status-item">
            <i className="fa-solid fa-server" style={{ color: '#00e5ff', fontSize: 11 }} /> BMS Status: <strong style={{ color: '#fff', marginLeft: 3 }}>41</strong>
          </div>

          <button className="hems-btn-setpoints" onClick={() => setSetpointsOpen(true)}>
            <Sliders size={16} /> Setpoints
          </button>

          <button className="hems-btn-power" title="Power Off">
            <i className="fa-solid fa-power-off" />
          </button>
        </div>
      </div>

      {/* ── DASHBOARD GRID (3-Column Layout) ── */}
      <main className="hems-dashboard-grid">
        {/* ── COLUMN 1 (LEFT) ── */}
        <div className="hems-grid-col">
          {/* Panel 1: Real Time Active Power of Plant */}
          <div className="hems-panel">
            <div className="hems-panel-header">
              <span className="hems-panel-title">Real Time Active Power of Plant</span>
              <div className="hems-panel-controls">
                <span className="hems-zoom-text">Zoom: <strong style={{ color: '#fff' }}>5 Min</strong> | 1 Hour | 1 Day</span>
                <i className="fa-solid fa-download hems-icon-btn" />
              </div>
            </div>
            <div className="hems-panel-body">
              <SvgChart
                data={STATIC_ACTIVE_POWER_MEAS}
                lineColor="#00e5ff"
                data2={STATIC_ACTIVE_POWER_SETPOINT}
                lineColor2="#0055ff"
                minY={0}
                maxY={150}
                yTicks={[150, 100, 50, 0]}
                legend1="Active Power Setpoint (MW)"
                legend1Hollow={true}
                legend2="PPC01_ActivePower_Meas (MW)"
              />
            </div>
          </div>

          {/* Panel 2: Solar Capability */}
          <div className="hems-panel">
            <div className="hems-panel-header">
              <span className="hems-panel-title">Solar Capability</span>
              <div className="hems-panel-controls">
                <i className="fa-solid fa-download hems-icon-btn" />
              </div>
            </div>
            <div className="hems-panel-body">
              <SvgChart
                data={STATIC_SOLAR_CAPABILITY}
                lineColor="#00e5ff"
                showArea={true}
                minY={158.0}
                maxY={163.0}
                yTicks={['163.0', '162.5', '162.0', '161.5', '161.0', '160.5', '160.0', '159.5', '159.0', '158.5', '158.0']}
              />
            </div>
          </div>
        </div>

        {/* ── COLUMN 2 (CENTER) ── */}
        <div className="hems-grid-col">
          {/* Panel 3: Real Time Reactive Power of Plant */}
          <div className="hems-panel">
            <div className="hems-panel-header">
              <span className="hems-panel-title">Real Time Reactive Power of Plant</span>
              <div className="hems-panel-controls">
                <span className="hems-zoom-text">Zoom: <strong style={{ color: '#fff' }}>5 Min</strong> | 1 Hour | 1 Day</span>
                <i className="fa-solid fa-download hems-icon-btn" />
              </div>
            </div>
            <div className="hems-panel-body">
              <SvgChart
                data={STATIC_REACTIVE_POWER_MEAS}
                lineColor="#00e5ff"
                data2={STATIC_REACTIVE_POWER_SETPOINT}
                lineColor2="#0055ff"
                minY={-100}
                maxY={100}
                yTicks={[100, 50, 0, -50, -100]}
                legend1="Reactive Power Setpoint (MVAR)"
                legend1Hollow={true}
                legend2="Reactive Power Meas (MVAR)"
              />
            </div>
          </div>

          {/* Panel 4 & 5 Stacked: BESS System Status + Key Alerts */}
          <div className="hems-col-substack">
            {/* BESS System Status */}
            <div className="hems-panel" style={{ flex: 1.2 }}>
              <div className="hems-panel-header">
                <span className="hems-panel-title">BESS System Status</span>
                <div className="hems-tab-pills">
                  <span className="hems-pill active">Real Time</span>
                  <span className="hems-pill">Statistics</span>
                </div>
              </div>
              <div className="hems-panel-body">
                <SvgChart
                  data={STATIC_BESS_ACTIVE_MEAS}
                  lineColor="#0055ff"
                  data2={STATIC_BESS_REACTIVE_MEAS}
                  lineColor2="#00e5ff"
                  minY={-75}
                  maxY={75}
                  yTicks={['75', '0', '-75']}
                  rightYTicks={true}
                  legend1="BESS Active Power Meas (MW)"
                  legend1Hollow={false}
                  legend1Color="#0055ff"
                  legend2="BESS Reactive Power Meas (MVAR)"
                />
              </div>
            </div>

            {/* Key Alerts Panel */}
            <div className="hems-panel" style={{ flex: 0.8 }}>
              <div className="hems-panel-header">
                <span className="hems-panel-title">Key Alerts</span>
              </div>
              <div className="hems-panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, color: '#5d7b9c' }}>No active alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMN 3 (RIGHT) ── */}
        <div className="hems-grid-col">
          {/* Panel 6: Real Time Key Measurements */}
          <div className="hems-panel hems-panel-measurements">
            <div className="hems-panel-header">
              <span className="hems-panel-title">Real Time Key Measurements</span>
              <i className="fa-solid fa-expand hems-icon-btn" />
            </div>
            <div className="hems-panel-body hems-measurements-body">
              <div className="hems-meas-row">
                <div className="hems-meas-item">
                  <div className="hems-meas-value cyan">33.10</div>
                  <div className="hems-meas-label">Voltage (kV)</div>
                </div>
                <div className="hems-meas-item">
                  <div className="hems-meas-value green">0.97</div>
                  <div className="hems-meas-label">Power Factor</div>
                </div>
              </div>
              <div className="hems-meas-main">
                <div className="hems-meas-value-lg green">49.84</div>
                <div className="hems-meas-label">Frequency (Hz)</div>
              </div>
            </div>
          </div>

          {/* Panel 7: Plant KPI */}
          <div className="hems-panel hems-panel-kpi">
            <div className="hems-panel-header">
              <span className="hems-panel-title">Plant KPI</span>
            </div>
            <div className="hems-panel-body hems-kpi-body">
              <div className="hems-kpi-box">
                <div className="hems-kpi-label">Outgoing ABTMeter01</div>
                <div className="hems-kpi-value-green">53.89 MW</div>
              </div>
              <div className="hems-kpi-box">
                <div className="hems-kpi-label">Outgoing ABTMeter02</div>
                <div className="hems-kpi-value-green">55.44 MW</div>
              </div>
              <div className="hems-kpi-box">
                <div className="hems-kpi-label">ICR1 &amp; ICR3</div>
                <div className="hems-kpi-value-green">20.80 MW</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── SETPOINTS MODAL ── */}
      {setpointsOpen && (
        <div className="hems-modal-overlay" onClick={() => setSetpointsOpen(false)}>
          <div className="hems-modal-card" onClick={e => e.stopPropagation()}>
            {/* Topbar */}
            <div className="hems-modal-topbar">
              <button className="hems-modal-xbtn" onClick={() => setSetpointsOpen(false)}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="hems-modal-body-white">
              {/* Col 1: Mode of Operation */}
              <div className="hems-modal-col">
                <h4 className="hems-modal-col-title">Mode of Operation</h4>
                {['Maintenance', 'Manual', 'Auto'].map(mode => (
                  <label key={mode} className="hems-radio-label">
                    <input
                      type="radio"
                      name="modeOfOp"
                      checked={modeOfOp === mode}
                      onChange={() => setModeOfOp(mode)}
                    />
                    <span className="hems-radio-custom" />
                    {mode}
                  </label>
                ))}
              </div>

              {/* Col 2: Power Dispatch Priority */}
              <div className="hems-modal-col">
                <h4 className="hems-modal-col-title">Power Dispatch Priority</h4>
                {['Active Power', 'Reactive Power'].map(prio => (
                  <label key={prio} className="hems-radio-label">
                    <input
                      type="radio"
                      name="dispatchPriority"
                      checked={dispatchPriority === prio}
                      onChange={() => setDispatchPriority(prio)}
                    />
                    <span className="hems-radio-custom" />
                    {prio}
                  </label>
                ))}
              </div>

              {/* Col 3: Control Mode */}
              <div className="hems-modal-col">
                <h4 className="hems-modal-col-title">Control Mode</h4>
                <div className="hems-select-wrapper">
                  <select
                    value={controlMode}
                    onChange={e => setControlMode(e.target.value)}
                    className="hems-select-input"
                  >
                    <option value="Direct Active Power Mode">Direct Active Power Mode</option>
                    <option value="Manual Mode">Manual Mode</option>
                  </select>
                </div>
              </div>

              {/* Col 4: Setpoint Inputs */}
              <div className="hems-modal-col hems-col-setpoints">
                <h4 className="hems-modal-col-title">Setpoint</h4>

                <div className="hems-input-row">
                  <label>Active Power Setpoint (MW) *</label>
                  <input
                    type="text"
                    value={activePowerSp}
                    onChange={e => setActivePowerSp(e.target.value)}
                    className="hems-text-input"
                  />
                </div>

                <div className="hems-input-row">
                  <label>Reactive Power Setpoint (MVAr) *</label>
                  <input
                    type="text"
                    value={reactivePowerSp}
                    onChange={e => setReactivePowerSp(e.target.value)}
                    className="hems-text-input"
                  />
                </div>

                <div className="hems-input-row">
                  <label>Power Factor Setpoint</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <select className="hems-select-input-sm">
                      <option></option>
                      <option>Lead</option>
                      <option>Lag</option>
                    </select>
                    <input
                      type="text"
                      value={pfSp}
                      onChange={e => setPfSp(e.target.value)}
                      className="hems-text-input-sm"
                    />
                  </div>
                </div>

                <div className="hems-input-row">
                  <label>SoC Setpoint</label>
                  <input
                    type="text"
                    value={socSp}
                    onChange={e => setSocSp(e.target.value)}
                    className="hems-text-input"
                  />
                </div>

                <div className="hems-input-row">
                  <label>Voltage Setpoint (kV) *</label>
                  <input
                    type="text"
                    value={voltageSp}
                    onChange={e => setVoltageSp(e.target.value)}
                    className="hems-text-input"
                  />
                </div>

                <div className="hems-input-row hems-toggle-row">
                  <label>Frequency Droop</label>
                  <div className="hems-switch-inline">
                    <span className="hems-toggle-text">Disable</span>
                    <label className="hems-switch">
                      <input
                        type="checkbox"
                        checked={freqDroop}
                        onChange={e => setFreqDroop(e.target.checked)}
                      />
                      <span className="hems-slider round pink" />
                    </label>
                    <span className="hems-toggle-text">Enable</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="hems-modal-footer-white">
              <div className="hems-footer-left">
                <div className="hems-footer-item">
                  <span>Energy Time Shift Mode</span>
                  <label className="hems-switch">
                    <input
                      type="checkbox"
                      checked={energyTimeShift}
                      onChange={e => setEnergyTimeShift(e.target.checked)}
                    />
                    <span className="hems-slider round gray" />
                  </label>
                </div>

                <label className="hems-radio-label" style={{ marginBottom: 0 }}>
                  <input
                    type="radio"
                    checked={schedulesChecked}
                    onChange={e => setSchedulesChecked(e.target.checked)}
                  />
                  <span className="hems-radio-custom" />
                  Schedules
                </label>

                <div className="hems-vdivider" />

                <div className="hems-footer-item">
                  <span>Battery Priority Enable</span>
                  <label className="hems-switch">
                    <input
                      type="checkbox"
                      checked={batteryPriority}
                      onChange={e => setBatteryPriority(e.target.checked)}
                    />
                    <span className="hems-slider round blue" />
                  </label>
                </div>
              </div>

              <div className="hems-footer-right">
                <button className="hems-btn-outline-blue" onClick={handleReset}>
                  <i className="fa-solid fa-rotate-right" /> Reset
                </button>
                <button className="hems-btn-outline-gray" onClick={() => setSetpointsOpen(false)}>
                  ✕ Cancel
                </button>
                <button className="hems-btn-solid-blue" onClick={handleSet}>
                  <i className="fa-solid fa-floppy-disk" /> Set
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
