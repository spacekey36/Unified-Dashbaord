import React, { useState, useEffect } from 'react';
import { Bell, ArrowRight, X, AlertTriangle } from 'lucide-react';

/**
 * NewAlarmPopup
 * Slides in from bottom-right when a new unacknowledged alarm is detected.
 * Props:
 *   alarm           – The latest unacknowledged alarm object
 *   criticalCount   – Total critical alarm count
 *   majorCount      – Total major alarm count
 *   unackCount      – Total unacknowledged count
 *   onNavigate      – Called when user clicks "View Alarm Console"
 *   onDismiss       – Called when user clicks "×" or timer expires
 *   autoDismissMs   – Auto-dismiss after this many ms (default 12000)
 */
export default function NewAlarmPopup({
  alarm,
  criticalCount,
  majorCount,
  unackCount,
  onNavigate,
  onDismiss,
  autoDismissMs = 12000,
}) {
  const [progress, setProgress] = useState(100);

  // Countdown progress bar
  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / autoDismissMs) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        requestAnimationFrame(tick);
      } else {
        onDismiss();
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoDismissMs, onDismiss]);

  const handleNavigate = () => {
    onNavigate();
  };

  return (
    <div className="alarm-popup-overlay">
      <div className="alarm-popup-card">
        {/* Dismiss button */}
        <button className="popup-dismiss-btn" onClick={onDismiss} title="Dismiss">
          <X size={14} />
        </button>

        {/* Top row: pulsing dot + label + severity */}
        <div className="popup-top-row">
          <div className="popup-pulse-dot" />
          <div className="popup-label">
            <Bell size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            New Alarm
          </div>
          <span className="popup-severity-badge">
            {alarm?.severity?.toUpperCase() ?? 'CRITICAL'}
          </span>
        </div>

        {/* Asset & description */}
        <div className="popup-asset-id">
          {alarm?.assetId ?? 'PCC-33KV-BKR01'}
        </div>
        <div className="popup-description">
          {alarm?.description ?? 'Breaker TRIPPED – PCC 33 kV Incomer'}
        </div>

        {/* Meta */}
        <div className="popup-meta-row">
          <div className="popup-meta-item">
            <div className="popup-meta-dot" style={{ background: '#38bdf8' }} />
            <span>{alarm?.category ?? 'Protection'}</span>
          </div>
          <div className="popup-meta-item">
            <AlertTriangle size={9} />
            <span>{alarm?.timestamp ?? '--:--:--'}</span>
          </div>
          <div className="popup-meta-item">
            <div className="popup-meta-dot" style={{ background: '#ff3333' }} />
            <span>Unacknowledged</span>
          </div>
        </div>

        {/* Counts */}
        <div className="popup-count-row">
          <div className="popup-count-chip chip-critical">
            <div className="chip-num">{String(criticalCount).padStart(2, '0')}</div>
            <div className="chip-lbl">Critical</div>
          </div>
          <div className="popup-count-chip chip-major">
            <div className="chip-num">{String(majorCount).padStart(2, '0')}</div>
            <div className="chip-lbl">Major</div>
          </div>
          <div className="popup-count-chip chip-unack">
            <div className="chip-num">{String(unackCount).padStart(2, '0')}</div>
            <div className="chip-lbl">Unack</div>
          </div>
        </div>

        {/* Actions */}
        <div className="popup-actions">
          <button className="popup-btn-primary" onClick={handleNavigate}>
            View Alarm Console
            <ArrowRight size={16} />
          </button>
          <button className="popup-btn-secondary" onClick={onDismiss}>
            Later
          </button>
        </div>

        {/* Progress bar */}
        <div
          className="popup-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
