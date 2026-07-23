import React, { useState, useEffect, useCallback } from 'react';
import HemsView from './components/HemsView.jsx';
import AlarmView from './components/AlarmView.jsx';
import NewAlarmPopup from './components/NewAlarmPopup.jsx';
import { initialAlarms } from './mockData.js';

// Derived alarm counts from mock data (for HEMS display)
function getAlarmCounts(alarms) {
  const active = alarms.filter(a => !a.isHistorical);
  return {
    critical: active.filter(a => a.severity === 'critical' && a.status !== 'rtn').length,
    major:    active.filter(a => a.severity === 'major'    && a.status !== 'rtn').length,
    minor:    active.filter(a => a.severity === 'minor'    && a.status !== 'rtn').length,
    unack:    active.filter(a => a.status === 'unack').length,
    total:    active.filter(a => a.status === 'active' || a.status === 'unack').length,
  };
}

export default function App() {
  // 'hems' | 'alarms'
  const [currentView, setCurrentView] = useState('hems');

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupAlarm, setPopupAlarm] = useState(null);

  // Shared alarm state (drives HEMS badge counts)
  const [alarms] = useState(initialAlarms);
  const alarmCounts = getAlarmCounts(alarms);

  // Zoom / UI Scaling state
  const [zoom, setZoom] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlZoom = params.get('zoom') || params.get('scale');
    if (urlZoom) {
      const val = parseFloat(urlZoom);
      if (!isNaN(val) && val >= 0.5 && val <= 3) {
        localStorage.setItem('app-zoom', val.toString());
        return val.toString();
      }
    }
    const savedZoom = localStorage.getItem('app-zoom');
    if (savedZoom) return savedZoom;
    
    // Auto-detect Vuplex user agent to scale up by default (e.g. 1.5x)
    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().includes('vuplex')) {
      return '1.5';
    }
    return '1.0';
  });

  useEffect(() => {
    document.body.style.zoom = zoom;
  }, [zoom]);

  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
    localStorage.setItem('app-zoom', newZoom);
  };

  // Show the popup after a 2s delay on initial load (on HEMS page only)
  useEffect(() => {
    // Find the most critical unacknowledged alarm
    const firstCritical = alarms.find(a => a.status === 'unack' && a.severity === 'critical' && !a.isHistorical);
    const firstUnack    = alarms.find(a => a.status === 'unack' && !a.isHistorical);
    const alarmToShow   = firstCritical || firstUnack;

    if (!alarmToShow) return;

    const timer = setTimeout(() => {
      setPopupAlarm(alarmToShow);
      setShowPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []); // Only on mount

  // Simulate new alarm arriving every 10s while on HEMS view
  useEffect(() => {
    if (currentView !== 'hems') return;

    const id = setInterval(() => {
      const unackAlarms = alarms.filter(a => a.status === 'unack' && !a.isHistorical);
      if (unackAlarms.length > 0) {
        const randomAlarm = unackAlarms[Math.floor(Math.random() * unackAlarms.length)];
        setPopupAlarm(randomAlarm);
        setShowPopup(true);
      }
    }, 10000);

    return () => clearInterval(id);
  }, [currentView, alarms]);

  const navigateToAlarms = useCallback(() => {
    setShowPopup(false);
    setCurrentView('alarms');
  }, []);

  const navigateToHems = useCallback(() => {
    setCurrentView('hems');
  }, []);

  const dismissPopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  return (
    <>
      {currentView === 'hems' && (
        <HemsView
          onNavigateToAlarms={navigateToAlarms}
          alarmCounts={alarmCounts}
          zoom={zoom}
          setZoom={handleZoomChange}
        />
      )}

      {currentView === 'alarms' && (
        <AlarmView
          onNavigateToHems={navigateToHems}
          zoom={zoom}
          setZoom={handleZoomChange}
        />
      )}

      {/* New Alarm Popup — only visible on HEMS page */}
      {showPopup && currentView === 'hems' && popupAlarm && (
        <NewAlarmPopup
          alarm={popupAlarm}
          criticalCount={alarmCounts.critical}
          majorCount={alarmCounts.major}
          unackCount={alarmCounts.unack}
          onNavigate={navigateToAlarms}
          onDismiss={dismissPopup}
          autoDismissMs={12000}
        />
      )}
    </>
  );
}
