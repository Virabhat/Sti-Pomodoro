import { useEffect, useRef, useState } from 'react'
import AuthDialog from './auth/AuthDialog'
import { useAuth } from './auth/useAuth'
import logo from './assets/sti-pomodoro-logo.png'
import './App.css'

const defaults = { work: 25, short: 5, long: 15 }
const sessions = [
  { id: 'work', short: 'W', name: 'WORK', label: 'WORK SESSION' },
  { id: 'short', short: 'SB', name: 'SHORT BREAK', label: 'SHORT BREAK' },
  { id: 'long', short: 'LB', name: 'LONG BREAK', label: 'LONG BREAK' },
]

function Icon({ name, size = 24 }) {
  const shapes = {
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="currentColor" />,
    pause: <><path d="M8 5v14M16 5v14" strokeWidth="3.5" /></>,
    reset: <><path d="M4 11a8 8 0 1 1 2.1 6.4" /><path d="M4 5v6h6" /></>,
    settings: <><path d="M10.3 2h3.4l.6 2.2 1.9.8 2-.9 2.4 2.4-.9 2 .8 1.9 2.2.6v3.4l-2.2.6-.8 1.9.9 2-2.4 2.4-2-.9-1.9.8-.6 2.2h-3.4l-.6-2.2-1.9-.8-2 .9-2.4-2.4.9-2-.8-1.9-2.2-.6v-3.4l2.2-.6.8-1.9-.9-2L5.8 4l2 .9 1.9-.8.6-2.1Z" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="3" fill="#202d45" stroke="none" /></>,
    close: <path d="M5 5 19 19M19 5 5 19" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}

function formatTime(total) {
  const minutes = Math.floor(total / 60)
  return `${String(minutes).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function App() {
  const { user, displayName, profileError, loading: authLoading, updateDisplayName, signOut } = useAuth()
  const [authMode, setAuthMode] = useState(null)
  const [durations, setDurations] = useState(defaults)
  const [mode, setMode] = useState('work')
  const [view, setView] = useState('pomodoro')
  const [seconds, setSeconds] = useState(defaults.work * 60)
  const [running, setRunning] = useState(false)
  const [cycle, setCycle] = useState(1)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [task, setTask] = useState('Design Sprint')
  const [focus, setFocus] = useState('Writing')
  const [notice, setNotice] = useState('')
  const markerRef = useRef(0)

  useEffect(() => {
    if (!running) return undefined
    const timer = window.setInterval(() => {
      const next = view === 'stopwatch'
        ? Math.floor((Date.now() - markerRef.current) / 1000)
        : Math.max(0, Math.ceil((markerRef.current - Date.now()) / 1000))
      setSeconds(next)
      if (next === 0 && view === 'pomodoro') {
        window.clearInterval(timer)
        setRunning(false)
        if (mode === 'work') {
          const nextMode = cycle === 4 ? 'long' : 'short'
          setNotice(nextMode === 'long' ? 'ครบเวลาทำงานแล้ว พักยาวได้เลย' : 'ครบเวลาทำงานแล้ว พักสั้นได้เลย')
          setMode(nextMode)
          setSeconds(durations[nextMode] * 60)
        } else {
          setNotice('ครบเวลาพักแล้ว กลับมาโฟกัสกัน')
          setMode('work')
          setSeconds(durations.work * 60)
          setCycle((current) => mode === 'long' ? 1 : Math.min(current + 1, 4))
        }
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [running, view, mode, cycle, durations])

  function selectMode(nextMode) {
    setNotice('')
    setRunning(false)
    setView('pomodoro')
    setMode(nextMode)
    setSeconds(durations[nextMode] * 60)
  }

  function selectView(nextView) {
    setNotice('')
    setRunning(false)
    setView(nextView)
    setSeconds(nextView === 'stopwatch' ? 0 : durations[mode] * 60)
  }

  function toggleTimer() {
    setNotice('')
    if (running) {
      setSeconds(view === 'stopwatch'
        ? Math.floor((Date.now() - markerRef.current) / 1000)
        : Math.max(0, Math.ceil((markerRef.current - Date.now()) / 1000)))
      setRunning(false)
    } else {
      markerRef.current = view === 'stopwatch' ? Date.now() - seconds * 1000 : Date.now() + seconds * 1000
      setRunning(true)
    }
  }

  function resetTimer() {
    setNotice('')
    setRunning(false)
    setSeconds(view === 'stopwatch' ? 0 : durations[mode] * 60)
  }

  function updateDuration(id, value) {
    const minutes = Math.max(1, Math.min(180, Number(value) || 1))
    setDurations((current) => ({ ...current, [id]: minutes }))
    if (mode === id && !running && view === 'pomodoro') setSeconds(minutes * 60)
  }

  const activeSession = sessions.find((session) => session.id === mode)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><img src={logo} alt="โลโก้ Sti Pomodoro" /></div>
          <span className="brand-name">Sti Pomodoro</span>
          <span className="brand-subtitle">Pomodoro Timer</span>
        </div>
        <div className="header-actions">
          <button className="view-switch" onClick={() => selectView(view === 'pomodoro' ? 'stopwatch' : 'pomodoro')}>{view === 'pomodoro' ? 'Stopwatch' : 'Pomodoro'}</button>
          <button className="auth-button" type="button" onClick={() => setAuthMode(user ? 'account' : 'login')} disabled={authLoading}>
            {authLoading ? 'กำลังโหลด...' : user ? displayName : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </header>

      <main className="workspace">
        <nav className="session-nav" aria-label="เลือกช่วงเวลา">
          {sessions.map((session) => (
            <button key={session.id} className={`session-option ${view === 'pomodoro' && mode === session.id ? 'active' : ''}`}
              onClick={() => selectMode(session.id)} aria-pressed={view === 'pomodoro' && mode === session.id}>
              <span className="session-initials">{session.short}</span>
              <strong>{session.name}</strong>
              <span>{durations[session.id]} นาที</span>
            </button>
          ))}
        </nav>

        <section className="timer-card" aria-label="ตัวจับเวลา">
          {notice && <div className="timer-notice" role="status">{notice}</div>}
          <div className="timer-center">
            <div className="time-display" role="timer" aria-live="off">{formatTime(seconds)}</div>
            <div className="timer-label">{view === 'stopwatch' ? 'STOPWATCH' : activeSession.label}</div>
            <div className="timer-controls">
              <button className="control-button primary" onClick={toggleTimer} aria-label={running ? 'พักเวลา' : 'เริ่มจับเวลา'} title={running ? 'พักเวลา' : 'เริ่มจับเวลา'}><Icon name={running ? 'pause' : 'play'} size={35} /></button>
              <button className="control-button secondary" onClick={resetTimer} aria-label="รีเซ็ตเวลา" title="รีเซ็ตเวลา"><Icon name="reset" size={32} /></button>
            </div>
            {view === 'pomodoro' && <div className="cycle-indicator" aria-label={`รอบที่ ${cycle} จาก 4`}>
              <div className="cycle-dots">{[1, 2, 3, 4].map((item) => <span key={item} className={item <= cycle ? 'filled' : ''} />)}</div>
              <span>Cycle {cycle}/4</span>
            </div>}
          </div>
        </section>
      </main>

      <footer className="bottom-bar">
        <div className="work-details">
          <label className="detail-group"><span>Tasks:</span><input value={task} onChange={(event) => setTask(event.target.value)} aria-label="งานที่กำลังทำ" /></label>
          <label className="detail-group focus-group"><span>Focus:</span><input value={focus} onChange={(event) => setFocus(event.target.value)} aria-label="สิ่งที่โฟกัส" /></label>
        </div>
        <button className="settings-button" onClick={() => setSettingsOpen(true)} aria-label="ตั้งค่าระยะเวลา" title="ตั้งค่าระยะเวลา"><Icon name="settings" size={25} /></button>
      </footer>

      {settingsOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false) }}>
        <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div className="modal-heading"><h2 id="settings-title">ตั้งค่าระยะเวลา</h2><button className="close-button" onClick={() => setSettingsOpen(false)} aria-label="ปิด"><Icon name="close" size={22} /></button></div>
          <p>กำหนดเวลาของแต่ละช่วงเป็นนาที</p>
          {sessions.map((session) => <label className="duration-row" key={session.id}><span>{session.name}</span><input type="number" min="1" max="180" value={durations[session.id]} onChange={(event) => updateDuration(session.id, event.target.value)} /></label>)}
          <button className="done-button" onClick={() => setSettingsOpen(false)}>เสร็จแล้ว</button>
        </section>
      </div>}

      {authMode && <AuthDialog
        key={authMode}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthMode(null)}
        user={user}
        displayName={displayName}
        profileError={profileError}
        onUpdateDisplayName={updateDisplayName}
        onSignOut={signOut}
      />}
    </div>
  )
}

export default App
