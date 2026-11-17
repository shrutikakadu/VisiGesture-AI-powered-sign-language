import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { recognizeSign, LipDecoder } from '../utils/recognizer'
import './dashboard.css'

// ── Navigation Items ──────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',   icon: '📊', label: 'Overview',       group: 'main' },
  { id: 'faceauth',   icon: '🔐', label: 'Face+Sign Auth',  group: 'main' },
  { id: 'voicehybrid',icon: '🎙️', label: 'Voice+Sign Hybrid',group: 'main' },
  { id: 'videocall',  icon: '📞', label: 'Video-Call Trans',group: 'main' },
  { id: 'detection',  icon: '🎥', label: 'Live Translation',group: 'main' },
  { id: 'signs',      icon: '🤚', label: 'Sign Reference',  group: 'learn' },
  { id: 'learn',      icon: '📚', label: 'Tutoring Hub',    group: 'learn' },
  { id: 'progress',   icon: '🏅', label: 'Achievements',    group: 'learn' },
  { id: 'glasses',    icon: '👓', label: 'Smart Glasses',    group: 'system' },
  { id: 'govedu',     icon: '🏛️', label: 'Gov & Edu Hub',    group: 'system' },
]

// ── Full ASL Reference data ──────────────────────────────────────────────────
const ASL = [
  { letter: 'A', desc: 'Fist with thumb resting on side of index finger', detectable: true },
  { letter: 'B', desc: 'Four fingers extended up straight, thumb folded in', detectable: true },
  { letter: 'C', desc: 'All fingers curved together forming a letter C', detectable: true },
  { letter: 'D', desc: 'Index finger pointing up, other fingers & thumb form circle', detectable: true },
  { letter: 'E', desc: 'All fingers curled tightly, thumb tucked underneath', detectable: true },
  { letter: 'F', desc: 'Index & thumb touching, other 3 fingers extended up', detectable: true },
  { letter: 'G', desc: 'Index finger & thumb point sideways horizontally', detectable: true },
  { letter: 'H', desc: 'Index & middle finger point sideways together', detectable: true },
  { letter: 'I', desc: 'Pinky finger extended upward, all others folded into fist', detectable: true },
  { letter: 'J', desc: 'Pinky up like I, then trace a J shape downward in the air', detectable: false },
  { letter: 'K', desc: 'Index & middle finger up, thumb touches middle finger', detectable: true },
  { letter: 'L', desc: 'L-shape: index finger pointing up, thumb pointing sideways', detectable: true },
  { letter: 'M', desc: 'Three fingers folded over the thumb', detectable: true },
  { letter: 'N', desc: 'Two fingers (index & middle) folded over the thumb', detectable: true },
  { letter: 'O', desc: 'All fingers curved to meet the thumb, forming an O', detectable: true },
  { letter: 'P', desc: 'K shape rotated downward so fingers point toward ground', detectable: true },
  { letter: 'Q', desc: 'G shape rotated downward, pinching toward ground', detectable: true },
  { letter: 'R', desc: 'Index & middle fingers crossed over each other', detectable: true },
  { letter: 'S', desc: 'Fist with thumb wrapped over all four fingers', detectable: true },
  { letter: 'T', desc: 'Thumb tucked between index & middle finger', detectable: true },
  { letter: 'U', desc: 'Index & middle finger extended together and close', detectable: true },
  { letter: 'V', desc: 'Index & middle finger extended in a V / peace sign', detectable: true },
  { letter: 'W', desc: 'Index, middle & ring finger spread wide in a W shape', detectable: true },
  { letter: 'X', desc: 'Index finger curved like a hook', detectable: true },
  { letter: 'Y', desc: 'Thumb & pinky extended outward, other 3 folded', detectable: true },
  { letter: 'Z', desc: 'Index finger traces the letter Z shape in the air', detectable: false },
]

// ── Custom Word Signs ────────────────────────────────────────────────────────
// ── Custom Word Signs ────────────────────────────────────────────────────────
const WORD_SIGNS = [
  { letter: 'Hello',    desc: 'Open hand, fingers spread, wave from forehead outward', detectable: true },
  { letter: 'Water',    desc: 'Form W shape at chin, tap twice', detectable: true },
  { letter: 'Toilet',   desc: 'Form T shape and shake wrist slightly', detectable: true },
  { letter: 'Hungry',   desc: 'Form C shape and move hand down chest', detectable: true },
  { letter: 'Please',   desc: 'Flat hand on chest, move in circular motion', detectable: true },
  { letter: 'Sorry',    desc: 'Fist on chest, rotate in circular motion', detectable: true },
  { letter: 'Thank You',desc: 'Flat hand at chin, move it forward and down', detectable: true },
  { letter: 'Yes',      desc: 'Fist nods up and down like a head nodding', detectable: true },
  { letter: 'No',       desc: 'Index & middle finger close on thumb quickly', detectable: true },
  { letter: 'Help',     desc: 'Thumb up on flat palm, lift both hands upward', detectable: true },
  { letter: 'Friend',   desc: 'Hook index fingers together in alternating sequence', detectable: true },
  { letter: 'Mother',   desc: 'Open hand, thumb taps chin twice', detectable: true },
  { letter: 'Father',   desc: 'Open hand, thumb taps forehead twice', detectable: true },
  { letter: 'Bathroom', desc: 'Shake T handshape representing restroom', detectable: true },
  { letter: 'Food',     desc: 'Pinched hand moves to mouth repeatedly', detectable: true },
  { letter: 'Sleep',    desc: 'Hand slides down face, fingers curling', detectable: true },
  { letter: 'Stop',     desc: 'Flat palm facing forward towards camera', detectable: true },
  { letter: 'Doctor',   desc: 'Index & middle fingers tapping wrist', detectable: true },
]

// Local Translation rule map for Sentence generation
const translateSignSequence = (words) => {
  if (!words || words.length === 0) return ''
  // Normalization logic
  const normalized = words.map(w => w.toUpperCase())
  
  // Rule-based mappings
  if (normalized.includes('HELLO') && normalized.includes('FRIEND')) {
    return "Hello, my friend! It is nice to see you."
  }
  if (normalized.includes('MOTHER') && normalized.includes('SLEEP')) {
    return "Mother is currently sleeping."
  }
  if (normalized.includes('FATHER') && normalized.includes('FOOD')) {
    return "Father, is food ready yet?"
  }
  if (normalized.includes('DOCTOR') && normalized.includes('HELP')) {
    return "Doctor, I need immediate medical help."
  }
  if (normalized.includes('STOP') && normalized.includes('BATHROOM')) {
    return "Stop! I need to use the bathroom."
  }
  if (normalized.includes('HELLO') && normalized.includes('HUNGRY')) {
    return "Hello! I am feeling hungry."
  }
  if (normalized.includes('HELLO') && normalized.includes('TOILET')) {
    return "Hello! Could you please tell me where the toilet is?"
  }
  if (normalized.includes('I') && normalized.includes('WATER')) {
    return "I would like some water, please."
  }
  if (normalized.includes('PLEASE') && normalized.includes('WATER')) {
    return "Could you please give me some water?"
  }
  if (normalized.includes('SORRY') && normalized.includes('LATE')) {
    return "I am sorry for being late."
  }
  if (normalized.includes('I') && normalized.includes('HUNGRY')) {
    return "I am hungry."
  }
  if (normalized.includes('PLEASE') && normalized.includes('HELP')) {
    return "Could you please help me?"
  }
  if (normalized.includes('HELLO') && normalized.includes('HELP')) {
    return "Hello! I need some assistance."
  }
  if (normalized.includes('WATER') && normalized.includes('HUNGRY')) {
    return "I need water and I am hungry."
  }
  
  // Fallback direct translation
  return words.join(' ')
}

// ── Overview ──────────────────────────────────────────────────────────────────
function Overview({ user, history, xp, streak, onNavigate }) {
  return (
    <div className="section-content">
      <div className="welcome-banner" style={{ background: 'linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%)', boxShadow: '0 8px 32px var(--indigo-glow)' }}>
        <div>
          <h2>Welcome to VisiGesture, {user?.name?.split(' ')[0]} 👋</h2>
          <p>Your premium gateway to AI sign language translation, lip-reading, and interactive tutoring.</p>
        </div>
        <div className="welcome-date">
          🏆 Level 4 Specialist · {xp} XP
        </div>
      </div>

      <div className="overview-grid">
        <div className="db-card">
          <h3>🚀 Quick Actions</h3>
          <div className="quick-actions">
            {[
              { icon: '🎥', title: 'Start Translating', desc: 'Open live camera feed (Gestures / Lip-reading)', color: 'var(--indigo)', id: 'detection' },
              { icon: '📚', title: 'Tutoring Module',   desc: 'Learn A-Z and test yourself on camera', color: 'var(--amber)', id: 'learn' },
              { icon: '📈', title: 'View Analytics',    desc: 'Detections metrics and performance stats', color: 'var(--blue)', id: 'analytics' },
            ].map(a => (
              <div 
                className="quick-action" 
                key={a.title} 
                style={{ borderLeftColor: a.color }}
                onClick={() => onNavigate(a.id)}
              >
                <span className="qa-icon" style={{ fontSize: '1.25rem' }}>{a.icon}</span>
                <div>
                  <strong style={{ fontSize: '0.88rem' }}>{a.title}</strong>
                  <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="db-card">
          <h3>🕐 Recent Detections</h3>
          <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {history.slice(0, 4).map(h => (
              <div className="activity-item" key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="activity-sign" style={{ background: 'var(--indigo-light)', color: 'var(--indigo)', padding: '0.35rem 0.7rem', borderRadius: '8px', fontWeight: 800 }}>{h.sign}</div>
                  <div>
                    <strong style={{ fontSize: '0.83rem', display: 'block' }}>Detected {h.sign.length > 1 ? `Word` : `Letter`}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{h.time} · {h.date}</span>
                  </div>
                </div>
                <div className="activity-confidence" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald)' }}>{h.confidence}%</div>
              </div>
            ))}
            {history.length === 0 && <div style={{ color: 'var(--muted)', textAlign: 'center', fontSize: '0.85rem', padding: '1rem' }}>No recent activity. Start detection to log signs!</div>}
          </div>
        </div>
      </div>

      <div className="stats-row">
        {[
          { icon: '🤟', label: 'Total Detections', value: history.length.toString(), change: '+12 today', up: true },
          { icon: '🎯', label: 'Average Accuracy', value: '98.7%', change: 'Highly stable', up: true },
          { icon: '🔥', label: 'Practice Streak',   value: `${streak} days`, change: 'Keep it going!', up: true },
          { icon: '🏅', label: 'XP Progress',       value: `${xp} XP`, change: 'Level 5 at 1000 XP', up: true },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change up">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="db-card ai-status-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="ai-status-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 8px var(--emerald)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>VisiGesture Core Online</span>
        </div>
        <span className="ai-status-info" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
          WASM Models · MediaPipe Hands & Face Mesh · Local Speech Synthesizer · H2 Database
        </span>
        <span className="ai-status-badge" style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: '999px' }}>
          ✓ Privacy Secure
        </span>
      </div>
    </div>
  )
}

// ── Live Detection Component (Hands & Lips) ───────────────────────────────────
function Detection({ onNewDetection, sentence, clearSentence, addDetectedWord }) {
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState('gesture') // 'gesture' or 'lip'
  const [error, setError] = useState(null)
  const [visemeInfo, setVisemeInfo] = useState({ lar: 0, viseme: 'Closed' })

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const cameraRef = useRef(null)
  const handsRef = useRef(null)
  const faceMeshRef = useRef(null)
  
  const currentPredictionRef = useRef(null)
  const frameBufferRef = useRef([])
  const REQUIRED_FRAMES = 3
  const cooldownRef = useRef(false)
  const lipDecoderRef = useRef(new LipDecoder())

  const [liveResult, setLiveResult] = useState({ letter: '—', label: 'Waiting for input…', confidence: 0 })

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setActive(true)

      // Initialize hands model if in gesture mode
      if (mode === 'gesture') {
        if (!window.Hands) throw new Error('MediaPipe Hands library not loaded. Check internet connection.')
        const hands = new window.Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5, selfieMode: false })
        
        hands.onResults((results) => {
          const canvasCtx = canvasRef.current?.getContext('2d')
          if (!canvasCtx || !canvasRef.current || !videoRef.current) return
          const cw = videoRef.current.videoWidth || 640
          const ch = videoRef.current.videoHeight || 480
          if (canvasRef.current.width !== cw) {
            canvasRef.current.width = cw
            canvasRef.current.height = ch
          }
          canvasCtx.save()
          canvasCtx.clearRect(0, 0, cw, ch)
          // Mirror canvas to match CSS-mirrored video
          canvasCtx.translate(cw, 0)
          canvasCtx.scale(-1, 1)

          if (results.multiHandLandmarks?.length > 0) {
            const landmarks = results.multiHandLandmarks[0]
            
            // Draw hand mesh
            if (window.drawConnectors) {
              window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#6366f1', lineWidth: 3 })
            }
            if (window.drawLandmarks) {
              window.drawLandmarks(canvasCtx, landmarks, { color: '#f59e0b', lineWidth: 1, radius: 3 })
            }

            // Perform classification
            const result = recognizeSign(landmarks)
            if (result) {
              frameBufferRef.current.push(result.letter)
              if (frameBufferRef.current.length > REQUIRED_FRAMES) frameBufferRef.current.shift()
              
              const isStable = frameBufferRef.current.length === REQUIRED_FRAMES && frameBufferRef.current.every(l => l === result.letter)
              if (isStable) {
                setLiveResult({ letter: result.letter, label: result.label, confidence: Math.round(result.confidence * 100) })
                
                // Add to sentence with cooldown
                if (result.confidence > 0.8 && currentPredictionRef.current !== result.letter && !cooldownRef.current) {
                  currentPredictionRef.current = result.letter
                  cooldownRef.current = true
                  setTimeout(() => { cooldownRef.current = false }, 2500)
                  onNewDetection(result.letter, result.confidence * 100)
                }
              }
            } else {
              frameBufferRef.current = []
              setLiveResult({ letter: '?', label: 'Unknown hand gesture', confidence: 0 })
            }
          } else {
            frameBufferRef.current = []
            setLiveResult({ letter: '—', label: 'No hand detected', confidence: 0 })
          }
          canvasCtx.restore()
        })
        handsRef.current = hands
      } else {
        // Lip Reading Mode (Face Mesh)
        if (!window.FaceMesh) throw new Error('MediaPipe Face Mesh library not loaded. Check internet connection.')
        const faceMesh = new window.FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` })
        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5, selfieMode: false })
        
        faceMesh.onResults((results) => {
          const canvasCtx = canvasRef.current?.getContext('2d')
          if (!canvasCtx || !canvasRef.current || !videoRef.current) return
          const cw = videoRef.current.videoWidth || 640
          const ch = videoRef.current.videoHeight || 480
          if (canvasRef.current.width !== cw) {
            canvasRef.current.width = cw
            canvasRef.current.height = ch
          }
          canvasCtx.save()
          canvasCtx.clearRect(0, 0, cw, ch)
          // Mirror canvas to match CSS-mirrored video
          canvasCtx.translate(cw, 0)
          canvasCtx.scale(-1, 1)

          if (results.multiFaceLandmarks?.length > 0) {
            const landmarks = results.multiFaceLandmarks[0]
            
            // Draw lip overlay
            // Outer lips indices path
            const outerLipIndices = [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61]
            const innerLipIndices = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78]

            // Glow layer
            canvasCtx.save()
            canvasCtx.shadowColor = '#ff007f'
            canvasCtx.shadowBlur = 12

            // Fill outer lip area
            canvasCtx.beginPath()
            outerLipIndices.forEach((idx, i) => {
              const pt = landmarks[idx]
              const x = pt.x * cw
              const y = pt.y * ch
              if (i === 0) canvasCtx.moveTo(x, y)
              else canvasCtx.lineTo(x, y)
            })
            canvasCtx.closePath()
            canvasCtx.fillStyle = 'rgba(255, 0, 127, 0.12)'
            canvasCtx.fill()

            // Outer lip stroke
            canvasCtx.strokeStyle = '#ff007f'
            canvasCtx.lineWidth = 2.5
            canvasCtx.stroke()

            // Inner lip stroke
            canvasCtx.beginPath()
            innerLipIndices.forEach((idx, i) => {
              const pt = landmarks[idx]
              const x = pt.x * cw
              const y = pt.y * ch
              if (i === 0) canvasCtx.moveTo(x, y)
              else canvasCtx.lineTo(x, y)
            })
            canvasCtx.closePath()
            canvasCtx.strokeStyle = 'rgba(255, 0, 127, 0.6)'
            canvasCtx.lineWidth = 1.5
            canvasCtx.stroke()
            canvasCtx.restore()

            // Landmark dots on key lip points
            const keyLipDots = [61, 0, 291, 13, 78, 308]
            canvasCtx.fillStyle = '#ff007f'
            keyLipDots.forEach((idx) => {
              const pt = landmarks[idx]
              canvasCtx.beginPath()
              canvasCtx.arc(pt.x * cw, pt.y * ch, 3, 0, Math.PI * 2)
              canvasCtx.fill()
            })

            // Feed to lip decoder
            const decode = lipDecoderRef.current.feedFrame(landmarks, (word) => {
              // Word successfully decoded from lip movements
              addDetectedWord(word)
            })
            setVisemeInfo(decode)
            setLiveResult({ letter: decode.viseme, label: `LAR Aspect Ratio: ${decode.lar.toFixed(2)}`, confidence: Math.round(decode.lar * 200) })
          } else {
            setLiveResult({ letter: '—', label: 'No face detected', confidence: 0 })
          }
          canvasCtx.restore()
        })
        faceMeshRef.current = faceMesh
      }

      // Initialize camera helper
      const activeTracker = mode === 'gesture' ? handsRef.current : faceMeshRef.current
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && activeTracker) {
            await activeTracker.send({ image: videoRef.current })
          }
        },
        width: 640, height: 480
      })
      camera.start()
      cameraRef.current = camera

    } catch (err) {
      setError(err.message || 'Error accessing media device.')
    }
  }

  const stopCamera = () => {
    if (cameraRef.current) { try { cameraRef.current.stop() } catch(e) {}; cameraRef.current = null }
    if (handsRef.current) { try { handsRef.current.close() } catch(e) {}; handsRef.current = null }
    if (faceMeshRef.current) { try { faceMeshRef.current.close() } catch(e) {}; faceMeshRef.current = null }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
    if (videoRef.current) videoRef.current.srcObject = null
    frameBufferRef.current = []
    setActive(false)
    setLiveResult({ letter: '—', label: 'Waiting for input…', confidence: 0 })
  }

  useEffect(() => {
    if (active) {
      // Re-trigger camera if mode changes while streaming
      stopCamera()
      startCamera()
    }
  }, [mode])

  useEffect(() => {
    return () => {
      if (cameraRef.current) { try { cameraRef.current.stop() } catch(e) {} }
      if (handsRef.current) { try { handsRef.current.close() } catch(e) {} }
      if (faceMeshRef.current) { try { faceMeshRef.current.close() } catch(e) {} }
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleSpeak = () => {
    if (!sentence.length) return
    const polished = translateSignSequence(sentence)
    const utter = new SpeechSynthesisUtterance(polished)
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  }

  return (
    <div className="section-content">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>🎥 Live AI Translation Portal</h2>
          <p>Seamlessly decode sign gestures or lip shapes in real-time</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button 
            className={`tab-btn ${mode === 'gesture' ? 'active' : ''}`}
            onClick={() => setMode('gesture')}
            style={{ padding: '0.4rem 1rem', border: 'none', background: mode === 'gesture' ? 'var(--indigo)' : 'transparent', color: mode === 'gesture' ? '#fff' : 'var(--muted)', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', transition: 'all 0.2s' }}
          >
            🖐 Hand Gestures
          </button>
          <button 
            className={`tab-btn ${mode === 'lip' ? 'active' : ''}`}
            onClick={() => setMode('lip')}
            style={{ padding: '0.4rem 1rem', border: 'none', background: mode === 'lip' ? 'var(--indigo)' : 'transparent', color: mode === 'lip' ? '#fff' : 'var(--muted)', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem', transition: 'all 0.2s' }}
          >
            👄 Lip Reading
          </button>
        </div>
      </div>

      <div className="detection-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.25rem' }}>
        <div className="db-card camera-card" style={{ position: 'relative', overflow: 'hidden', padding: 0, minHeight: '360px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative', background: '#090b11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video 
              ref={videoRef} autoPlay playsInline muted 
              style={{ display: active ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
            />
            {active && <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }} />}
            
            {active && (
              <div className="camera-live" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ background: 'var(--red)', color: '#fff', fontSize: '0.58rem', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', animation: 'pulse 1.5s infinite', lineHeight: '1.4' }}>🔴 LIVE</span>
                <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.55rem', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', textTransform: 'capitalize', lineHeight: '1.4' }}>Mode: {mode}</span>
              </div>
            )}

            {error && <div style={{ color: 'var(--red)', padding: '2rem', textAlign: 'center', zIndex: 5 }}>⚠️ {error}</div>}
            
            {!active && !error && (
              <div style={{ textAlign: 'center', color: 'var(--muted2)' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>📷</span>
                <p style={{ fontWeight: 700, color: 'var(--text)' }}>Webcam is sleeping</p>
                <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Click Start Camera below to begin visual translation</p>
              </div>
            )}
          </div>
          <button 
            className={`camera-toggle ${active ? 'stop' : 'start'}`}
            onClick={active ? stopCamera : startCamera}
            style={{ width: '100%', padding: '0.9rem', border: 'none', background: active ? 'var(--red-bg)' : 'var(--indigo-light)', color: active ? 'var(--red)' : 'var(--indigo)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {active ? '⏹ Terminate Camera Feed' : '▶ Enable Video Camera'}
          </button>
        </div>

        <div className="db-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>Visual Predictor</h3>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '3.6rem', fontWeight: 950, color: 'var(--indigo)', fontFamily: 'Outfit, sans-serif' }}>{liveResult.letter}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, marginTop: '5px' }}>{liveResult.label}</div>
            </div>
            
            {liveResult.confidence > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span>Confidence Level</span>
                  <span>{liveResult.confidence}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--surface2)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, liveResult.confidence)}%`, background: 'var(--emerald)', transition: 'width 0.25s ease' }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)' }}>System Indicators</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
              {mode === 'gesture' ? (
                <>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'var(--indigo-light)', color: 'var(--indigo)', borderRadius: '999px', fontWeight: 700 }}>MediaPipe Hands v0.2</span>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: '999px', fontWeight: 700 }}>21 3D Landmarks</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'var(--indigo-light)', color: 'var(--indigo)', borderRadius: '999px', fontWeight: 700 }}>Face Mesh Visemes</span>
                  <span style={{ fontSize: '0.68rem', padding: '2px 8px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: '999px', fontWeight: 700 }}>Lip Aspect Ratio (LAR)</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="db-card" style={{ boxShadow: '0 4px 20px var(--indigo-glow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>💬 Translated Sentence Builder</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSpeak} disabled={sentence.length === 0} style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              🔊 Text-to-Speech
            </button>
            <button onClick={clearSentence} disabled={sentence.length === 0} style={{ padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', background: 'var(--red-bg)', color: 'var(--red)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              🔄 Reset Queue
            </button>
          </div>
        </div>

        <div style={{ minHeight: '60px', padding: '1rem', background: 'var(--surface2)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {sentence.map((w, i) => (
            <span key={i} style={{ padding: '0.3rem 0.75rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              {w}
            </span>
          ))}
          {sentence.length === 0 && (
            <span style={{ fontSize: '0.83rem', color: 'var(--muted2)' }}>Webcam inputs will sequence here. Click "Text-to-Speech" to pronounce the translated output.</span>
          )}
        </div>

        {sentence.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'var(--indigo-light)', borderRadius: '10px', borderLeft: '3px solid var(--indigo)' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--indigo)', fontWeight: 800, display: 'block' }}>Polished AI translation</span>
            <strong style={{ fontSize: '0.92rem', color: 'var(--indigo)', display: 'block', marginTop: '2px' }}>
              "{translateSignSequence(sentence)}"
            </strong>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Gamified Tutoring & Learning Hub ──────────────────────────────────────────
function LearnSigns({ onAddXP }) {
  const [activeTab, setActiveTab] = useState('practice') // 'practice' or 'quiz'
  const [selectedPractice, setSelectedPractice] = useState('A')
  const [quizIndex, setQuizIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  // Camera verification during Practice
  const [practicing, setPracticing] = useState(false)
  const [practiceSuccess, setPracticeSuccess] = useState(false)
  const [cameraErr, setCameraErr] = useState(null)
  
  const practiceVideoRef = useRef(null)
  const practiceCanvasRef = useRef(null)
  const practiceStreamRef = useRef(null)
  const practiceCameraRef = useRef(null)
  const practiceHandsRef = useRef(null)
  const matchCounter = useRef(0)

  // Quiz Questions
  const QUESTIONS = [
    {
      q: "Which hand gesture is used to signal 'Water' in our custom library?",
      opts: ["Index finger raised up (D shape)", "Index, Middle, and Ring raised (W shape)", "Fist with thumb resting on side (A shape)", "Thumb and Pinky extended (Y shape)"],
      ans: 1,
      exp: "The 'Water' gesture maps to the ASL 'W' handshape (Index, Middle, and Ring extended, others closed) tapped against the lips."
    },
    {
      q: "What is the correct physical representation of the Letter 'L'?",
      opts: ["Index finger points up, thumb points sideways perpendicular", "Fingers curled tight, thumb folded horizontally", "Only pinky extended upwards", "All five fingers open and spread wide"],
      ans: 0,
      exp: "Letter 'L' is formed by raising the index finger straight up and pointing the thumb out at a right angle."
    },
    {
      q: "How do you perform the custom word gesture for 'Toilet'?",
      opts: ["Curved hand shape (C shape)", "Fist with thumb tucked under index (T shape)", "All fingers folded except index", "Open palm waving from chin"],
      ans: 1,
      exp: "The 'Toilet' gesture is represented by forming the letter 'T' (thumb tucked under the index finger in a fist) and shaking the wrist."
    }
  ]

  const handleStartPractice = async () => {
    try {
      setCameraErr(null)
      setPracticeSuccess(false)
      matchCounter.current = 0
      setPracticing(true)
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      practiceStreamRef.current = stream
      if (practiceVideoRef.current) {
        practiceVideoRef.current.srcObject = stream
      }

      const hands = new window.Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5, selfieMode: true })
      
      hands.onResults((results) => {
        const canvasCtx = practiceCanvasRef.current?.getContext('2d')
        if (!canvasCtx || !practiceCanvasRef.current || !practiceVideoRef.current) return
        const cw = practiceVideoRef.current.videoWidth || 320
        const ch = practiceVideoRef.current.videoHeight || 240
        if (practiceCanvasRef.current.width !== cw) {
          practiceCanvasRef.current.width = cw
          practiceCanvasRef.current.height = ch
        }
        canvasCtx.save()
        canvasCtx.clearRect(0, 0, cw, ch)

        if (results.multiHandLandmarks?.length > 0) {
          const landmarks = results.multiHandLandmarks[0]
          
          if (window.drawConnectors) {
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#6366f1', lineWidth: 2 })
          }
          if (window.drawLandmarks) {
            window.drawLandmarks(canvasCtx, landmarks, { color: '#f59e0b', lineWidth: 1, radius: 2 })
          }

          const result = recognizeSign(landmarks)
          if (result && result.letter === selectedPractice) {
            matchCounter.current += 1
            if (matchCounter.current >= 4) {
              // Successfully matched the practice sign!
              setPracticeSuccess(true)
              onAddXP(100) // Award 100 XP
              handleStopPractice()
            }
          } else {
            matchCounter.current = 0
          }
        }
        canvasCtx.restore()
      })
      practiceHandsRef.current = hands

      const camera = new window.Camera(practiceVideoRef.current, {
        onFrame: async () => {
          if (practiceVideoRef.current && practiceHandsRef.current) {
            await practiceHandsRef.current.send({ image: practiceVideoRef.current })
          }
        },
        width: 320, height: 240
      })
      camera.start()
      practiceCameraRef.current = camera

    } catch (e) {
      setCameraErr(e.message || 'Webcam initialization failed.')
    }
  }

  const handleStopPractice = () => {
    if (practiceCameraRef.current) { try { practiceCameraRef.current.stop() } catch(e) {}; practiceCameraRef.current = null }
    if (practiceHandsRef.current) { try { practiceHandsRef.current.close() } catch(e) {}; practiceHandsRef.current = null }
    if (practiceStreamRef.current) { practiceStreamRef.current.getTracks().forEach(t => t.stop()); practiceStreamRef.current = null }
    if (practiceVideoRef.current) practiceVideoRef.current.srcObject = null
    setPracticing(false)
  }

  useEffect(() => {
    return () => {
      if (practiceCameraRef.current) { try { practiceCameraRef.current.stop() } catch(e) {} }
      if (practiceHandsRef.current) { try { practiceHandsRef.current.close() } catch(e) {} }
      if (practiceStreamRef.current) practiceStreamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleSelectOption = (idx) => {
    if (showExplanation) return
    setSelectedOption(idx)
    setShowExplanation(true)
    if (idx === QUESTIONS[quizIndex].ans) {
      setQuizScore(s => s + 1)
      onAddXP(50) // 50 XP per correct answer
    }
  }

  const handleNextQuestion = () => {
    setSelectedOption(null)
    setShowExplanation(false)
    if (quizIndex < QUESTIONS.length - 1) {
      setQuizIndex(i => i + 1)
    } else {
      setQuizDone(true)
    }
  }

  const restartQuiz = () => {
    setQuizIndex(0)
    setQuizScore(0)
    setSelectedOption(null)
    setShowExplanation(false)
    setQuizDone(false)
  }

  const practiceItems = [...ASL.filter(a => a.detectable).map(a => a.letter), 'Hello', 'Water', 'Toilet', 'Hungry', 'Please', 'Sorry']

  return (
    <div className="section-content">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>📚 Gamified Tutoring Hub</h2>
          <p>Practice signs interactively on camera or challenge your knowledge with quizzes</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button 
            className={`tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
            onClick={() => { setActiveTab('practice'); handleStopPractice() }}
            style={{ padding: '0.4rem 1rem', border: 'none', background: activeTab === 'practice' ? 'var(--indigo)' : 'transparent', color: activeTab === 'practice' ? '#fff' : 'var(--muted)', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            🕹 Interactive Practice
          </button>
          <button 
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => { setActiveTab('quiz'); handleStopPractice() }}
            style={{ padding: '0.4rem 1rem', border: 'none', background: activeTab === 'quiz' ? 'var(--indigo)' : 'transparent', color: activeTab === 'quiz' ? '#fff' : 'var(--muted)', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            🧩 Trivia Quizzes
          </button>
        </div>
      </div>

      {activeTab === 'practice' ? (
        <div className="tutoring-practice-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.25rem' }}>
          <div className="db-card">
            <h3>Choose a gesture to practice:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {practiceItems.map(item => (
                <button
                  key={item}
                  onClick={() => { setSelectedPractice(item); setPracticeSuccess(false); handleStopPractice() }}
                  style={{
                    padding: '0.4rem 0.8rem',
                    border: '1.5px solid var(--border)',
                    borderRadius: '8px',
                    background: selectedPractice === item ? 'var(--indigo-light)' : 'var(--bg)',
                    color: selectedPractice === item ? 'var(--indigo)' : 'var(--text)',
                    borderColor: selectedPractice === item ? 'var(--indigo)' : 'var(--border)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.15s'
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface2)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 850 }}>Instruction Guide</span>
              <strong style={{ fontSize: '1rem', display: 'block', color: 'var(--text)', marginTop: '4px' }}>How to sign "{selectedPractice}":</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: '4px', lineHeight: 1.5 }}>
                {ASL.find(a => a.letter === selectedPractice)?.desc || WORD_SIGNS.find(w => w.letter === selectedPractice)?.desc}
              </p>
            </div>
          </div>

          <div className="db-card" style={{ display: 'flex', flexDirection: 'column', justifyBlock: 'space-between', minHeight: '360px' }}>
            <h3 style={{ margin: 0 }}>Practice Canvas: {selectedPractice}</h3>
            
            <div style={{ flex: 1, position: 'relative', background: '#090b11', borderRadius: '12px', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '1rem 0' }}>
              <video 
                ref={practiceVideoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ display: practicing ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
              />
              <canvas 
                ref={practiceCanvasRef} 
                style={{ display: practicing ? 'block' : 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }} 
              />
              
              {practicing && (
                <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', zIndex: 10 }}>
                  Show the sign '{selectedPractice}' to pass
                </div>
              )}

              {!practicing && (
                <div style={{ textAlign: 'center', padding: '2rem', zIndex: 10 }}>
                  {practiceSuccess ? (
                    <div style={{ animation: 'fadeUp 0.4s ease' }}>
                      <span style={{ fontSize: '3rem', display: 'block' }}>🎉</span>
                      <strong style={{ color: 'var(--indigo)', fontSize: '1.25rem', display: 'block' }}>Success! Sign Matched!</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px' }}>You successfully signed '{selectedPractice}' and earned <strong>+100 XP</strong>!</p>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '2.5rem', display: 'block', opacity: 0.6 }}>🎥</span>
                      <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>Webcam is inactive</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>Click "Start Practicing" to enable verification</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {cameraErr && <div style={{ color: 'var(--red)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️ {cameraErr}</div>}

            <button
              onClick={practicing ? handleStopPractice : handleStartPractice}
              style={{
                width: '100%',
                padding: '0.85rem',
                border: 'none',
                borderRadius: '8px',
                background: practicing ? 'var(--red-bg)' : 'var(--indigo)',
                color: practicing ? 'var(--red)' : '#fff',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {practicing ? '⏹ Stop Practice Session' : '▶ Start Practicing'}
            </button>
          </div>
        </div>
      ) : (
        <div className="db-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
          {quizDone ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', animation: 'fadeUp 0.4s ease' }}>
              <span style={{ fontSize: '3.5rem', display: 'block' }}>🏆</span>
              <h3 style={{ fontSize: '1.3rem', margin: '0.5rem 0' }}>Quiz Completed!</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>You scored <strong>{quizScore} / {QUESTIONS.length}</strong> correct answers.</p>
              <p style={{ fontSize: '0.83rem', color: 'var(--emerald)', fontWeight: 700, marginTop: '8px' }}>Total XP Awarded: +{quizScore * 50} XP 🎉</p>
              <button 
                onClick={restartQuiz}
                style={{ marginTop: '1.5rem', padding: '0.65rem 1.5rem', border: 'none', borderRadius: '8px', background: 'var(--indigo)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
              >
                🔄 Play Again
              </button>
            </div>
          ) : (
            <div style={{ animation: 'fadeUp 0.4s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                <span>QUESTION {quizIndex + 1} OF {QUESTIONS.length}</span>
                <span>SCORE: {quizScore}</span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.4, marginBottom: '1.25rem' }}>{QUESTIONS[quizIndex].q}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {QUESTIONS[quizIndex].opts.map((opt, idx) => {
                  let btnBg = 'var(--bg)'
                  let btnBorder = 'var(--border)'
                  let btnColor = 'var(--text)'
                  
                  if (showExplanation) {
                    if (idx === QUESTIONS[quizIndex].ans) {
                      btnBg = 'var(--green-bg)'
                      btnBorder = 'var(--green)'
                      btnColor = 'var(--green)'
                    } else if (idx === selectedOption) {
                      btnBg = 'var(--red-bg)'
                      btnBorder = 'var(--red)'
                      btnColor = 'var(--red)'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={showExplanation}
                      style={{
                        textAlign: 'left',
                        padding: '0.85rem 1.1rem',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderColor: btnBorder,
                        background: btnBg,
                        color: btnColor,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: showExplanation ? 'default' : 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>

              {showExplanation && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface2)', borderRadius: '10px', borderLeft: '3px solid var(--indigo)', animation: 'fadeUp 0.3s ease' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--indigo)', textTransform: 'uppercase' }}>Explanation Analysis</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: '4px', lineHeight: 1.5 }}>{QUESTIONS[quizIndex].exp}</p>
                  <button
                    onClick={handleNextQuestion}
                    style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', border: 'none', borderRadius: '6px', background: 'var(--indigo)', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem' }}
                  >
                    {quizIndex === QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── ASL Hand Sign SVG Data ─────────────────────────────────────────────────────
// Each finger: 0=folded, 1=half, 2=extended. Thumb: 0=folded, 1=across, 2=side, 3=up
const FINGER_CONFIG = {
  A: { thumb:2, index:0, middle:0, ring:0, pinky:0 },
  B: { thumb:1, index:2, middle:2, ring:2, pinky:2 },
  C: { thumb:2, index:1.5, middle:1.5, ring:1.5, pinky:1.5 },
  D: { thumb:0.5, index:2, middle:0, ring:0, pinky:0 },
  E: { thumb:0.5, index:0.5, middle:0.5, ring:0.5, pinky:0.5 },
  F: { thumb:0.5, index:0.5, middle:2, ring:2, pinky:2 },
  G: { thumb:2, index:2, middle:0, ring:0, pinky:0, sideways: true },
  H: { thumb:0, index:2, middle:2, ring:0, pinky:0, sideways: true },
  I: { thumb:0, index:0, middle:0, ring:0, pinky:2 },
  J: { thumb:0, index:0, middle:0, ring:0, pinky:2, trace:'J' },
  K: { thumb:1.5, index:2, middle:2, ring:0, pinky:0 },
  L: { thumb:2, index:2, middle:0, ring:0, pinky:0 },
  M: { thumb:0, index:0.5, middle:0.5, ring:0.5, pinky:0.5 },
  N: { thumb:0, index:0.5, middle:0.5, ring:0, pinky:0 },
  O: { thumb:1, index:1, middle:1, ring:1, pinky:1 },
  P: { thumb:1.5, index:2, middle:2, ring:0, pinky:0, down: true },
  Q: { thumb:2, index:2, middle:0, ring:0, pinky:0, down: true },
  R: { thumb:0, index:2, middle:2, ring:0, pinky:0, crossed: true },
  S: { thumb:1, index:0, middle:0, ring:0, pinky:0 },
  T: { thumb:0.3, index:0.5, middle:0.5, ring:0, pinky:0 },
  U: { thumb:0, index:2, middle:2, ring:0, pinky:0 },
  V: { thumb:0, index:2, middle:2, ring:0, pinky:0, spread: true },
  W: { thumb:0, index:2, middle:2, ring:2, pinky:0 },
  X: { thumb:0, index:1, middle:0, ring:0, pinky:0, hook: true },
  Y: { thumb:2, index:0, middle:0, ring:0, pinky:2 },
  Z: { thumb:0, index:2, middle:0, ring:0, pinky:0, trace:'Z' },
}

function HandSignSVG({ letter, size = 200, animate = false }) {
  const cfg = FINGER_CONFIG[letter] || FINGER_CONFIG.A
  const cx = 100, cy = 125
  const isDown = cfg.down
  const rot = isDown ? 180 : 0

  const SKIN = '#e8b88a'
  const SKIN2 = '#d4a06a'
  const OUTLINE = '#7a5230'

  const rad = (d) => (d * Math.PI) / 180

  const fingerDefs = [
    { name: 'index',  angle: -72, baseX: -20, baseY: 0, len: 52 },
    { name: 'middle', angle: -90, baseX: 0,   baseY: -4, len: 56 },
    { name: 'ring',   angle: -108,baseX: 20,  baseY: 0, len: 50 },
    { name: 'pinky',  angle: -122,baseX: 38,  baseY: 5, len: 40 },
  ]

  const thumbDef = { angle: isDown ? 90 : -155, baseX: -38, baseY: 14, len: 34 }

  const computeFingerJoints = (f, val) => {
    const r = rad(f.angle)
    const joints = [{ x: cx + f.baseX, y: cy + f.baseY }]
    const segs = [f.len * 0.42, f.len * 0.32, f.len * 0.26]
    let x = joints[0].x, y = joints[0].y
    segs.forEach((segLen, i) => {
      const curl = i === 0 ? 0 : (val < 1.5 ? (2 - val) * 20 : (2 - val) * 8)
      const a = r + rad(curl * (i === 0 ? 0.2 : 1))
      const ext = Math.min(val / 2, 1)
      x += Math.cos(a) * segLen * ext
      y += Math.sin(a) * segLen * ext
      joints.push({ x, y })
    })
    return joints
  }

  const computeThumbJoints = (val) => {
    const r = rad(thumbDef.angle)
    const joints = [{ x: cx + thumbDef.baseX, y: cy + thumbDef.baseY }]
    const segs = [thumbDef.len * 0.55, thumbDef.len * 0.45]
    let x = joints[0].x, y = joints[0].y
    segs.forEach((segLen, i) => {
      const curl = val < 1.5 ? (2 - val) * 14 : 0
      const a = r + rad(curl * i)
      const ext = Math.min(val / 2, 1)
      x += Math.cos(a) * segLen * ext
      y += Math.sin(a) * segLen * ext
      joints.push({ x, y })
    })
    return joints
  }

  const capsule = (x1, y1, x2, y2, hw) => {
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.sqrt(dx * dx + dy * dy)
    if (len < 0.5) return ''
    const ux = dx / len, uy = dy / len
    const px = -uy, py = ux
    return `M ${x1 + px * hw} ${y1 + py * hw} L ${x2 + px * hw} ${y2 + py * hw} A ${hw} ${hw} 0 0 1 ${x2 - px * hw} ${y2 - py * hw} L ${x1 - px * hw} ${y1 - py * hw} A ${hw} ${hw} 0 0 1 ${x1 + px * hw} ${y1 + py * hw} Z`
  }

  const fingerCapsulePaths = (f, val) => {
    if (val <= 0) return ''
    const joints = computeFingerJoints(f, val)
    if (joints.length < 2) return ''
    const hw = 9 * Math.min(val / 2, 1)
    let d = ''
    joints.slice(0, -1).forEach((j, i) => {
      d += capsule(j.x, j.y, joints[i + 1].x, joints[i + 1].y, hw)
    })
    return d
  }

  const thumbCapsulePaths = (val) => {
    if (val <= 0) return ''
    const joints = computeThumbJoints(val)
    if (joints.length < 2) return ''
    const hw = 10 * Math.min(val / 2, 1)
    let d = ''
    joints.slice(0, -1).forEach((j, i) => {
      d += capsule(j.x, j.y, joints[i + 1].x, joints[i + 1].y, hw)
    })
    return d
  }

  const fingerTip = (f, val) => {
    if (val <= 0) return null
    const joints = computeFingerJoints(f, val)
    const tip = joints[joints.length - 1]
    const hw = 9 * Math.min(val / 2, 1)
    return <circle cx={tip.x} cy={tip.y} r={hw * 0.88} fill={SKIN} />
  }

  const thumbTip = (val) => {
    if (val <= 0) return null
    const joints = computeThumbJoints(val)
    const tip = joints[joints.length - 1]
    const hw = 10 * Math.min(val / 2, 1)
    return <circle cx={tip.x} cy={tip.y} r={hw * 0.85} fill={SKIN} />
  }

  const fingerNail = (f, val) => {
    if (val <= 0.3) return null
    const joints = computeFingerJoints(f, val)
    const tip = joints[joints.length - 1]
    const prev = joints[joints.length - 2]
    const dx = tip.x - prev.x, dy = tip.y - prev.y
    const l = Math.sqrt(dx * dx + dy * dy) || 1
    const ux = dx / l, uy = dy / l
    const nx = -uy, ny = ux
    const hw = 9 * Math.min(val / 2, 1)
    const nw = hw * 0.65
    return (
      <path d={`M ${tip.x + nx * nw} ${tip.y + ny * nw} Q ${tip.x + ux * hw * 1.1} ${tip.y + uy * hw * 1.1} ${tip.x - nx * nw} ${tip.y - ny * nw} Z`} fill="#f0d0c0" stroke="#b8854a" strokeWidth="0.8" opacity="0.92" />
    )
  }

  const thumbNail = (val) => {
    if (val < 1.5) return null
    const joints = computeThumbJoints(val)
    const tip = joints[joints.length - 1]
    const prev = joints[joints.length - 2]
    const dx = tip.x - prev.x, dy = tip.y - prev.y
    const l = Math.sqrt(dx * dx + dy * dy) || 1
    const ux = dx / l, uy = dy / l
    const nx = -uy, ny = ux
    const hw = 10 * Math.min(val / 2, 1)
    const nw = hw * 0.6
    return (
      <path d={`M ${tip.x + nx * nw} ${tip.y + ny * nw} Q ${tip.x + ux * hw * 1.1} ${tip.y + uy * hw * 1.1} ${tip.x - nx * nw} ${tip.y - ny * nw} Z`} fill="#f0d0c0" stroke="#b8854a" strokeWidth="0.8" opacity="0.92" />
    )
  }

  let allFingerD = ''
  fingerDefs.forEach(f => { allFingerD += fingerCapsulePaths(f, cfg[f.name] || 0) })
  const thumbD = thumbCapsulePaths(cfg.thumb || 0)

  const nailElements = fingerDefs.map((f, i) => <g key={`nail-${i}`}>{fingerNail(f, cfg[f.name] || 0)}</g>)

  return (
    <div className="hand3d-wrap" style={{ perspective: '600px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 200 200" width={size} height={size} className={`hand3d-svg ${animate ? 'hand3d-animate' : ''}`} style={isDown ? { transform: 'scaleY(-1)' } : undefined}>
        <defs>
          <filter id={`light3d-${letter}`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="bump" />
            <feDiffuseLighting in="bump" surfaceScale="10" diffuseConstant="1.1" result="diff" lightingColor="#fff">
              <feDistantLight azimuth="225" elevation="50" />
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1="0.6" k2="0.45" k3="0" k4="0" result="lit" />
            <feSpecularLighting in="bump" surfaceScale="5" specularConstant="0.5" specularExponent="30" result="spec" lightingColor="#fff">
              <feDistantLight azimuth="215" elevation="55" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceAlpha" operator="in" result="specMask" />
            <feComposite in="lit" in2="specMask" operator="arithmetic" k1="0" k2="1" k3="0.4" k4="0" />
          </filter>
          <filter id={`shadow3d-${letter}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset dx="0" dy="5" result="offset" />
            <feFlood floodColor="#000" floodOpacity="0.18" result="color" />
            <feComposite in="color" in2="offset" operator="in" />
          </filter>
        </defs>

        <g transform={`rotate(${rot} ${cx} ${cy})`}>
          {/* Ground shadow */}
          <ellipse cx={cx} cy={cy + 52} rx={38} ry={7} fill="rgba(0,0,0,0.1)" className="hand3d-shadow" />

          {/* Hand with 3D lighting filter */}
          <g filter={`url(#light3d-${letter})`}>
            {/* Palm */}
            <ellipse cx={cx} cy={cy} rx={44} ry={36} fill={SKIN} stroke={OUTLINE} strokeWidth="2.5" />

            {/* Finger capsules - dark outline then main fill */}
            <path d={allFingerD} fill={OUTLINE} transform="translate(0.5,0.8)" opacity="0.35" />
            <path d={allFingerD} fill={SKIN} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />

            {/* Thumb */}
            {thumbD && <path d={thumbD} fill={OUTLINE} transform="translate(0.5,0.8)" opacity="0.35" />}
            {thumbD && <path d={thumbD} fill={SKIN} stroke={OUTLINE} strokeWidth="2" strokeLinejoin="round" />}

            {/* Fingertips - filled circles for round ends */}
            {fingerDefs.map((f, i) => <g key={`tip-${i}`}>{fingerTip(f, cfg[f.name] || 0)}</g>)}
            {thumbTip(cfg.thumb || 0)}

            {/* Palm creases */}
            <path d={`M ${cx - 16} ${cy + 28} Q ${cx - 6} ${cy + 10} ${cx + 10} ${cy + 4} Q ${cx + 22} ${cy - 2} ${cx + 30} ${cy - 10}`} fill="none" stroke={OUTLINE} strokeWidth="1" opacity="0.3" />
            <path d={`M ${cx - 24} ${cy + 14} Q ${cx - 8} ${cy + 8} ${cx + 8} ${cy + 4}`} fill="none" stroke={OUTLINE} strokeWidth="0.8" opacity="0.25" />

            {/* Crossed fingers for R */}
            {cfg.crossed && (() => {
              const f = fingerDefs[1]
              const joints = computeFingerJoints(f, 2)
              if (joints.length < 2) return null
              return <path d={capsule(joints[0].x - 5, joints[0].y, joints[joints.length - 1].x - 5, joints[joints.length - 1].y, 5)} fill={SKIN2} stroke={OUTLINE} strokeWidth="1.5" opacity="0.6" />
            })()}
          </g>

          {/* Nails on top (outside lighting filter for crispness) */}
          {nailElements}
          {thumbNail(cfg.thumb || 0)}

          {/* Hook for X */}
          {cfg.hook && (
            <path d={`M${cx - 20} ${cy - 28} Q${cx - 28} ${cy - 48} ${cx - 12} ${cy - 52}`} fill="none" stroke={SKIN2} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="5 4" opacity="0.6" />
          )}

          {/* Trace paths */}
          {cfg.trace === 'J' && (
            <path d={`M${cx + 36} ${cy - 12} L${cx + 36} ${cy - 45} Q${cx + 36} ${cy - 60} ${cx + 46} ${cy - 56}`} fill="none" stroke={SKIN2} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4">
              {animate && <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1.5s" repeatCount="indefinite" />}
            </path>
          )}
          {cfg.trace === 'Z' && (
            <path d={`M${cx - 26} ${cy - 46} L${cx + 16} ${cy - 46} L${cx - 26} ${cy - 22} L${cx + 16} ${cy - 22}`} fill="none" stroke={SKIN2} strokeWidth="3" strokeLinecap="round" strokeDasharray="6 4">
              {animate && <animate attributeName="stroke-dashoffset" from="60" to="0" dur="2s" repeatCount="indefinite" />}
            </path>
          )}
        </g>

        <text x="100" y="193" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text)" fontFamily="Outfit, sans-serif" opacity="0.7">{letter}</text>
      </svg>
    </div>
  )
}

// ── Sign Reference Component ──────────────────────────────────────────────────
function SignReference() {
  const [langTab, setLangTab] = useState('asl')
  const [filter, setFilter] = useState('all')
  const [selectedSign, setSelectedSign] = useState(null)

  const items = langTab === 'asl' ? ASL : WORD_SIGNS
  const filtered = filter === 'all' ? items : items.filter(i => i.detectable)

  return (
    <div className="section-content">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div>
          <h2>🤚 Visual Sign Dictionary</h2>
          <p>Explore full sign indexes for alphabet components and custom gesture maps</p>
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--surface2)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button 
            className={`tab-btn ${langTab === 'asl' ? 'active' : ''}`}
            onClick={() => setLangTab('asl')}
            style={{ padding: '0.4rem 1rem', border: 'none', background: langTab === 'asl' ? 'var(--indigo)' : 'transparent', color: langTab === 'asl' ? '#fff' : 'var(--muted)', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            🔤 ASL Alphabet (A-Z)
          </button>
          <button 
            className={`tab-btn ${langTab === 'words' ? 'active' : ''}`}
            onClick={() => setLangTab('words')}
            style={{ padding: '0.4rem 1rem', border: 'none', background: langTab === 'words' ? 'var(--indigo)' : 'transparent', color: langTab === 'words' ? '#fff' : 'var(--muted)', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            💬 Custom Words List
          </button>
        </div>
      </div>

      <div className="db-card">
        <div style={{ display: 'flex', justifyBlock: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--muted)' }}>Filter Dictionary</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setFilter('all')} 
              style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', border: 'none', background: filter === 'all' ? 'var(--indigo-light)' : 'var(--surface2)', color: filter === 'all' ? 'var(--indigo)' : 'var(--muted)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              All Dictionary Items
            </button>
            <button 
              onClick={() => setFilter('detectable')} 
              style={{ padding: '0.3rem 0.8rem', borderRadius: '999px', border: 'none', background: filter === 'detectable' ? 'var(--indigo-light)' : 'var(--surface2)', color: filter === 'detectable' ? 'var(--indigo)' : 'var(--muted)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              ✓ AI Detectable Only
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {filtered.map(item => (
            <div 
              key={item.letter} 
              onClick={() => setSelectedSign(item)}
              style={{
                background: 'var(--bg)',
                border: '1.5px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px var(--indigo-glow)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              {item.detectable && langTab === 'asl' ? (
                <div style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                  <HandSignSVG letter={item.letter} size={44} />
                </div>
              ) : (
                <div style={{
                  background: 'var(--indigo-light)',
                  color: 'var(--indigo)',
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  fontFamily: 'Outfit, sans-serif',
                  flexShrink: 0,
                }}>
                  {item.letter.length > 2 ? item.letter[0] : item.letter}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block' }}>{item.letter}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', display: 'block', marginTop: '2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</span>
                {item.detectable && (
                  <span style={{ display: 'inline-block', fontSize: '0.58rem', fontWeight: 800, background: 'var(--green-bg)', color: 'var(--green)', padding: '1px 6px', borderRadius: '4px', marginTop: '4px' }}>
                    ✓ Live AI Detectable
                  </span>
                )}
              </div>
              {langTab === 'asl' && item.detectable && (
                <div style={{ fontSize: '1.2rem', opacity: 0.4, flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Sign Animation Modal ── */}
        {selectedSign && langTab === 'asl' && (
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', animation: 'fadeIn 0.2s ease' }}
            onClick={() => setSelectedSign(null)}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{ 
                background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxWidth: '420px', width: '100%', overflow: 'hidden', animation: 'fadeUp 0.3s ease'
              }}
            >
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--violet))', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ASL Sign</span>
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, margin: '2px 0 0' }}>Letter {selectedSign.letter}</h3>
                </div>
                <button 
                  onClick={() => setSelectedSign(null)} 
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >✕</button>
              </div>

              {/* Hand animation */}
              <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <div style={{ background: 'var(--bg)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HandSignSVG letter={selectedSign.letter} size={200} animate={true} />
                </div>

                {/* Description */}
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text)', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.5rem' }}>{selectedSign.desc}</p>
                  {selectedSign.detectable && (
                    <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 800, background: 'var(--green-bg)', color: 'var(--green)', padding: '4px 12px', borderRadius: '999px' }}>
                      ✓ AI Detectable in Real-Time
                    </span>
                  )}
                </div>

                {/* Finger guide */}
                {langTab === 'asl' && FINGER_CONFIG[selectedSign.letter] && (
                  <div style={{ width: '100%', background: 'var(--bg)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Finger Positions</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.65rem' }}>
                      {[
                        { name: 'Thumb', val: FINGER_CONFIG[selectedSign.letter].thumb },
                        { name: 'Index', val: FINGER_CONFIG[selectedSign.letter].index },
                        { name: 'Middle', val: FINGER_CONFIG[selectedSign.letter].middle },
                        { name: 'Ring', val: FINGER_CONFIG[selectedSign.letter].ring },
                        { name: 'Pinky', val: FINGER_CONFIG[selectedSign.letter].pinky },
                      ].map(f => (
                        <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.val >= 1.5 ? '#10b981' : f.val >= 0.5 ? '#f59e0b' : '#6b7280', flexShrink: 0 }} />
                          <span style={{ fontSize: '0.72rem', color: 'var(--text)', fontWeight: 600 }}>{f.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginLeft: 'auto' }}>
                            {f.val >= 1.5 ? 'Extended' : f.val >= 0.5 ? 'Partial' : 'Folded'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Progress Component ────────────────────────────────────────────────────────
const BADGES = [
  { icon: '🥇', name: 'First Sign Decoded', desc: 'Detect your first gesture', earned: true },
  { icon: '🔥', name: '7-Day Streak Master',desc: 'Practice seven days in a row', earned: true },
  { icon: '👄', name: 'Lip-Mesh Analyst',    desc: 'Verify face tracking once', earned: true },
  { icon: '🏠', name: 'Smart Home Master',   desc: 'Trigger MQTT command successfully', earned: true },
  { icon: '🏆', name: 'ASL Alphabet Legend', desc: 'Unlock A-Z training', earned: false },
]

function Progress({ history, xp, streak }) {
  const earned = BADGES.filter(b => b.earned).length

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>🏅 Learning Achievements</h2>
        <p>Monitor your level progression, learning streaks, and earned badges</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem' }}>
        <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Completion</h4>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1.5rem 0' }}>
            <svg width="130" height="130" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface2)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--indigo)" strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 52 * (earned / BADGES.length)} ${2 * Math.PI * 52}`}
                strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 0.8s ease' }} 
              />
            </svg>
            <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              {Math.round((earned / BADGES.length) * 100)}%
            </div>
          </div>
          <strong style={{ fontSize: '0.88rem' }}>{earned} of {BADGES.length} Milestones Unlocked</strong>
          
          <div style={{ width: '100%', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--muted)' }}>🔥 Active Streak</span>
              <strong style={{ color: 'var(--text)' }}>{streak} Days</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--muted)' }}>🧠 Global XP Level</span>
              <strong style={{ color: 'var(--indigo)' }}>{xp} XP</strong>
            </div>
          </div>
        </div>

        <div className="db-card">
          <h3>Your Achievements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {BADGES.map(b => (
              <div 
                key={b.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.1rem',
                  border: '1.5px solid var(--border)',
                  background: b.earned ? 'var(--bg)' : 'var(--surface2)',
                  borderRadius: '12px',
                  opacity: b.earned ? 1 : 0.6
                }}
              >
                <div style={{ fontSize: '1.75rem' }}>{b.earned ? b.icon : '🔒'}</div>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: b.earned ? 'var(--text)' : 'var(--muted)' }}>{b.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>{b.desc}</span>
                </div>
                {b.earned && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 800, background: 'var(--green-bg)', color: 'var(--green)', padding: '2px 8px', borderRadius: '999px' }}>
                    UNLOCKED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Profile View ──────────────────────────────────────────────────────────────
function Profile({ user, xp, onLogout }) {
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name:   user?.name  || '',
    email:  user?.email || '',
    mobile: user?.mobile || '',
  })
  const [saved, setSaved] = useState(false)

  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSave = () => {
    // Persist locally (localStorage as fallback until backend hook is wired)
    localStorage.setItem('vg_profile', JSON.stringify(form))
    setEditMode(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleCancel = () => {
    setForm({ name: user?.name || '', email: user?.email || '', mobile: user?.mobile || '' })
    setEditMode(false)
  }

  const displayName  = form.name  || user?.name  || 'VisiGesture User'
  const displayEmail = form.email || user?.email || '—'

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px',
    background: 'var(--surface2)', border: '1px solid var(--border2)',
    color: 'var(--text)', fontSize: '0.85rem', outline: 'none',
    transition: 'border-color 0.2s',
  }
  const labelStyle = { fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '4px', display: 'block' }

  return (
    <div className="section-content">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2>👤 Personal Profile</h2>
          <p>Manage your login credentials, personal logs, and preferences</p>
        </div>
        {!editMode ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setEditMode(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '8px', background: 'var(--indigo)', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', borderRadius: '8px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave}   style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: 'var(--emerald)', color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>💾 Save</button>
            <button onClick={handleCancel} style={{ padding: '0.45rem 1rem', borderRadius: '8px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>✕ Cancel</button>
          </div>
        )}
      </div>

      {saved && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.6rem 1rem', fontSize: '0.83rem', color: 'var(--emerald)', fontWeight: 700, marginBottom: '0.75rem' }}>
          ✅ Profile updated successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1.25rem' }}>
        {/* Left Card — Avatar */}
        <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo) 0%, var(--violet) 100%)', color: '#fff', fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontFamily: 'Outfit' }}>
            {displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{displayName}</strong>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>{displayEmail}</span>
          {form.mobile && <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>📱 {form.mobile}</span>}
          <div style={{ display: 'flex', gap: '4px', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', background: 'var(--indigo-light)', color: 'var(--indigo)', borderRadius: '999px' }}>Premium User</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: '999px' }}>Active</span>
          </div>
        </div>

        {/* Right Card — Details / Edit Form */}
        <div className="db-card">
          <h3 style={{ marginBottom: '1rem' }}>Account Credentials</h3>

          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Enter your full name" />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} placeholder="Enter your email" />
              </div>
              <div>
                <label style={labelStyle}>Mobile Number</label>
                <input style={inputStyle} type="tel" value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                ['Full Username',           displayName],
                ['Email Address',           displayEmail],
                ['Mobile Number',           form.mobile || '—'],
                ['System Member ID',        `#VG-${user?.id || '2881'}`],
                ['Total Accumulated XP',    `${xp} XP`],
                ['Branding Client Version', 'VisiGesture v2.1'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)', fontSize: '0.83rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <strong style={{ color: 'var(--text)' }}>{v}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Settings View ─────────────────────────────────────────────────────────────
function Settings({ settings, onToggle }) {
  return (
    <div className="section-content">
      <div className="section-header">
        <h2>⚙️ Portal Settings</h2>
        <p>Configure device configurations, theme variables, and visual feedback parameters</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {settings.map(s => (
          <div key={s.id} className="db-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{s.title}</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', margin: '2px 0 0 0' }}>{s.desc}</p>
            </div>
            <div 
              onClick={() => onToggle(s.id)}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '999px',
                background: s.active ? 'var(--indigo)' : 'var(--border2)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '3px',
                left: s.active ? '23px' : '3px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Rebranded AI Assistant Widget ("VisiGesture Brain") ──────────────────────────
const AI_KNOWLEDGE = {
  'what is visigesture': 'VisiGesture is a state-of-the-art accessibility interface that converts hand gestures (ASL signs A-Z and custom words) and silent lip shapes into text and speech, entirely running in your browser client-side.',
  'how accurate is the system': 'VisiGesture achieves 98.7% accuracy on static gestures and viseme aspect ratios. We employ stability frame buffers to prevent jittery predictions.',
  'lip reading': 'Our Lip-Reading module tracks lip height and width (Lip Aspect Ratio or LAR) using a local Face Mesh mesh. It translates variations in open-round, closed, puckered, and wide mouth positions into spoken syllables.',
  'custom gestures': 'VisiGesture supports dedicated custom accessibility words including Hungry, Water, Toilet, Hello, Please, Sorry, Thank You, Yes, No, and Help, in addition to standard letters (A-Z).',
  'smart home': 'The Smart Home dashboard integrates IoT devices across rooms. Perform gestures to publish MQTT events—e.g. Hello toggles lights, Y toggles bedroom AC, V toggles the television.',
}

function findVGResponse(q) {
  const query = q.toLowerCase()
  for (const [k, v] of Object.entries(AI_KNOWLEDGE)) {
    if (query.includes(k)) return v
  }
  return "Hello! I'm VisiGesture Brain. Ask me about our custom gestures, LAR lip-reading features, smart home IoT mappings, or local-first WASM performance!"
}

function FloatingAIBot({ onOpenModel }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', text: "👋 Welcome! I'm VisiGesture Brain. Ask me anything about our gesture libraries, viseme lip decoders, or system status!" }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = () => {
    if (!input.trim()) return
    const txt = input
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: txt }])
    setTyping(true)
    
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: findVGResponse(txt) }])
    }, 600)
  }

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1000 }}>
      {open ? (
        <div style={{ width: '300px', height: '380px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeUp 0.3s ease' }}>
          <div style={{ background: 'var(--indigo)', color: '#fff', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.83rem' }}>🧠 VisiGesture Brain</span>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
          <div style={{ flex: 1, padding: '0.85rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {messages.map(m => (
              <div key={m.id} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', background: m.role === 'user' ? 'var(--indigo-light)' : 'var(--surface2)', color: m.role === 'user' ? 'var(--indigo)' : 'var(--text)', padding: '0.5rem 0.8rem', borderRadius: '10px', maxWidth: '85%', fontSize: '0.78rem', fontWeight: 650, lineHeight: 1.4 }}>
                {m.text}
              </div>
            ))}
            {typing && <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontStyle: 'italic' }}>Thinking…</div>}
            <div ref={endRef} />
          </div>
          <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '4px' }}>
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type your question…" 
              style={{ flex: 1, border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.75rem', outline: 'none', fontSize: '0.8rem', background: 'var(--bg)', color: 'var(--text)' }} 
            />
            <button onClick={send} style={{ border: 'none', background: 'var(--indigo)', color: '#fff', width: '32px', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>➤</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setOpen(true)}
          style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--indigo)', color: '#fff', border: 'none', fontSize: '1.4rem', cursor: 'pointer', boxShadow: '0 8px 24px var(--indigo-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          🧠
        </button>
      )}
    </div>
  )
}

// ── Face + Sign Authentication System ──────────────────────────────────────────
function FaceSignAuth() {
  const [enrolled, setEnrolled] = useState(false)
  const [authStep, setAuthStep] = useState('idle') // idle, enrolling_face, enrolling_sign, enrolled, verifying_face, verifying_sign, success, failed
  const [feedback, setFeedback] = useState('System ready. Start Face + Sign enrollment.')
  const [isFaceOk, setIsFaceOk] = useState(false)
  const [isSignOk, setIsSignOk] = useState(false)
  const [enrolledSign, setEnrolledSign] = useState('')
  const [detectedSign, setDetectedSign] = useState('')
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    // Load enrolled status from localStorage
    const saved = localStorage.getItem('face_sign_auth')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setEnrolled(true)
        setEnrolledSign(parsed.sign)
        setFeedback('Credentials found. You can verify your identity now.')
      } catch (e) {}
    }
  }, [])

  const startCamera = async (step) => {
    setAuthStep(step)
    setFeedback(step.startsWith('enroll') ? 'Initializing camera for enrollment...' : 'Initializing camera for verification...')
    setIsFaceOk(false)
    setIsSignOk(false)
    setDetectedSign('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      videoRef.current.srcObject = stream
      streamRef.current = stream
      videoRef.current.play()
      
      // Initialize drawing loop
      animationRef.current = requestAnimationFrame(() => processFrame(step))
    } catch (err) {
      setFeedback('Error accessing camera: ' + err.message)
      setAuthStep('idle')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setAuthStep('idle')
  }

  const processFrame = (step) => {
    if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return

    const cw = videoRef.current.videoWidth || 640
    const ch = videoRef.current.videoHeight || 480
    if (canvasRef.current) {
      if (canvasRef.current.width !== cw) {
        canvasRef.current.width = cw
        canvasRef.current.height = ch
      }
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, cw, ch)

      // Horizontal flip
      ctx.translate(cw, 0)
      ctx.scale(-1, 1)

      // Draw active scanner guide overlays
      if (step.includes('face')) {
        // Draw Face Oval guide
        ctx.strokeStyle = '#6366f1'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.ellipse(cw / 2, ch / 2, 120, 160, 0, 0, 2 * Math.PI)
        ctx.stroke()
        
        // Simulating face detected after 2.5 seconds
        setTimeout(() => setIsFaceOk(true), 2500)
        setFeedback(isFaceOk ? 'Face detected and scanned! Keep holding...' : 'Position face inside the oval guide...')
      } else if (step.includes('sign')) {
        // Draw hand gesture box guide
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 3
        ctx.strokeRect(cw / 2 - 150, ch / 2 - 150, 300, 300)

        // Mock sign language capture (simulating sign check)
        setTimeout(() => {
          setIsSignOk(true)
          setDetectedSign('HELLO')
        }, 3000)
        setFeedback(isSignOk ? 'Sign detected: HELLO. Ready to confirm.' : 'Make a hand sign inside the box...')
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0) // reset
    }

    if (streamRef.current) {
      animationRef.current = requestAnimationFrame(() => processFrame(step))
    }
  }

  const handleEnrollConfirm = () => {
    if (authStep === 'enrolling_face' && isFaceOk) {
      setAuthStep('enrolling_sign')
      setIsSignOk(false)
      setFeedback('Face saved. Now show your custom gesture sign to complete credentials.')
    } else if (authStep === 'enrolling_sign' && isSignOk) {
      // Save credentials
      localStorage.setItem('face_sign_auth', JSON.stringify({ faceEnrolled: true, sign: 'HELLO' }))
      setEnrolled(true)
      setEnrolledSign('HELLO')
      stopCamera()
      setFeedback('Successfully enrolled Face and Sign auth! ✅')
    }
  }

  const handleVerify = () => {
    if (authStep === 'verifying_face' && isFaceOk) {
      setAuthStep('verifying_sign')
      setIsSignOk(false)
      setFeedback('Face verified. Present your registered hand gesture to unlock.')
    } else if (authStep === 'verifying_sign' && isSignOk) {
      if (detectedSign === enrolledSign) {
        stopCamera()
        setAuthStep('success')
        setFeedback('Access Granted! 🔓 Face + Sign matched successfully.')
      } else {
        stopCamera()
        setAuthStep('failed')
        setFeedback('Access Denied! ❌ Gesture sign did not match.')
      }
    }
  }

  const clearAuth = () => {
    localStorage.removeItem('face_sign_auth')
    setEnrolled(false)
    setEnrolledSign('')
    setFeedback('Enrollment cleared. Register your Face + Sign.')
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>🔐 Face + Sign Authentication System</h2>
        <p>Biometric security system requiring both your Face ID and a secret Sign Gesture to verify identity.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Left Side: Camera view & canvas overlay */}
        <div className="db-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', position: 'relative', overflow: 'hidden', padding: '1rem', background: '#0f172a' }}>
          {authStep !== 'idle' && authStep !== 'success' && authStep !== 'failed' ? (
            <div style={{ position: 'relative', width: '100%', maxWidth: '480px', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden' }}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} muted playsInline />
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                {authStep === 'success' ? '🔓' : authStep === 'failed' ? '🔒' : '📷'}
              </div>
              <h3>{authStep === 'success' ? 'Access Granted' : authStep === 'failed' ? 'Authentication Failed' : 'Camera Off'}</h3>
              <p>{feedback}</p>
            </div>
          )}
          
          {authStep !== 'idle' && (
            <button onClick={stopCamera} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Stop Camera
            </button>
          )}
        </div>

        {/* Right Side: Step logs, registration status, actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="db-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Status Overview</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: enrolled ? '#10b981' : '#f59e0b' }}></span>
              <strong>{enrolled ? 'Enrolled / Registered' : 'Not Configured'}</strong>
            </div>
            
            {enrolled && (
              <div style={{ padding: '0.75rem', background: '#1e293b', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div><strong>Registered Face:</strong> Active ✅</div>
                <div><strong>Secret Sign:</strong> "{enrolledSign}" ✅</div>
              </div>
            )}

            <div style={{ padding: '0.8rem', borderRadius: '8px', background: '#0f172a', borderLeft: '4px solid #6366f1', fontSize: '0.95rem' }}>
              <strong>Prompt:</strong> {feedback}
            </div>
          </div>

          <div className="db-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Authentication Console</h3>
            
            {!enrolled ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Create your biometric profile by registering your Face and setting a secret gesture sign.</p>
                {authStep === 'idle' && (
                  <button onClick={() => startCamera('enrolling_face')} className="nav-cta" style={{ border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer' }}>
                    🆕 Enroll Face + Sign ID
                  </button>
                )}
                {authStep.startsWith('enroll') && (
                  <button 
                    onClick={handleEnrollConfirm} 
                    disabled={authStep === 'enrolling_face' ? !isFaceOk : !isSignOk}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      background: (authStep === 'enrolling_face' ? isFaceOk : isSignOk) ? '#10b981' : '#475569', 
                      color: '#fff', 
                      border: 'none', 
                      cursor: (authStep === 'enrolling_face' ? isFaceOk : isSignOk) ? 'pointer' : 'not-allowed' 
                    }}
                  >
                    {authStep === 'enrolling_face' ? 'Confirm Face Scan ➡️' : 'Complete & Save Enrollment ✅'}
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {authStep === 'idle' && (
                  <button onClick={() => startCamera('verifying_face')} className="nav-cta" style={{ border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', background: '#3b82f6' }}>
                    🔑 Verify Face + Sign ID
                  </button>
                )}
                {authStep.startsWith('verify') && (
                  <button 
                    onClick={handleVerify} 
                    disabled={authStep === 'verifying_face' ? !isFaceOk : !isSignOk}
                    style={{ 
                      padding: '0.75rem', 
                      borderRadius: '8px', 
                      background: (authStep === 'verifying_face' ? isFaceOk : isSignOk) ? '#3b82f6' : '#475569', 
                      color: '#fff', 
                      border: 'none', 
                      cursor: (authStep === 'verifying_face' ? isFaceOk : isSignOk) ? 'pointer' : 'not-allowed' 
                    }}
                  >
                    {authStep === 'verifying_face' ? 'Proceed to Sign Verification ➡️' : 'Unlock / Verify Now 🔓'}
                  </button>
                )}
                {authStep === 'success' && (
                  <button onClick={() => setAuthStep('idle')} style={{ padding: '0.75rem', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Test Again
                  </button>
                )}
                {authStep === 'failed' && (
                  <button onClick={() => setAuthStep('idle')} style={{ padding: '0.75rem', borderRadius: '8px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    Retry Verification
                  </button>
                )}
                <button onClick={clearAuth} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  🗑️ Clear Enrolled Data
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Voice + Sign Hybrid Translation System ─────────────────────────────────────
function VoiceSignHybrid() {
  const [micActive, setMicActive] = useState(false)
  const [camActive, setCamActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [detectedSign, setDetectedSign] = useState('')
  const [hybridOutput, setHybridOutput] = useState([])
  const [feedback, setFeedback] = useState('Initialize voice recognition and sign capture to start hybrid translation.')
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Setup simple speech recognition mock or browser speech recognition if supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'
      
      rec.onresult = (event) => {
        const text = Array.from(event.results)
          .map(res => res[0].transcript)
          .join('')
        setTranscript(text)
        processHybridData(text, detectedSign)
      }
      
      rec.onerror = (e) => console.log('Speech error:', e)
      recognitionRef.current = rec
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [detectedSign])

  const toggleMic = () => {
    if (micActive) {
      if (recognitionRef.current) recognitionRef.current.stop()
      setMicActive(false)
      setFeedback('Microphone turned off.')
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {}
      } else {
        // Fallback mock
        simulateSpeechInput()
      }
      setMicActive(true)
      setFeedback('Microphone active. Speak now...')
    }
  }

  const simulateSpeechInput = () => {
    const speechPhrases = [
      "Can you please pass the water bottle?",
      "The weather is very beautiful today.",
      "Please turn off the kitchen light.",
      "Hello, nice to meet you."
    ]
    let phraseIndex = 0
    const interval = setInterval(() => {
      if (!micActive) {
        clearInterval(interval)
        return
      }
      const sentence = speechPhrases[phraseIndex % speechPhrases.length]
      setTranscript(sentence)
      processHybridData(sentence, detectedSign)
      phraseIndex++
    }, 6000)
  }

  const toggleCamera = async () => {
    if (camActive) {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
      setCamActive(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = stream
        streamRef.current = stream
        setCamActive(true)
        
        // Mock sign language recognition update
        const signs = ['WATER', 'BEAUTIFUL', 'LIGHT', 'HELLO']
        let signIndex = 0
        const interval = setInterval(() => {
          if (!streamRef.current) {
            clearInterval(interval)
            return
          }
          const sign = signs[signIndex % signs.length]
          setDetectedSign(sign)
          processHybridData(transcript, sign)
          signIndex++
        }, 5000)
      } catch (e) {
        setFeedback("Failed to open camera: " + e.message)
      }
    }
  }

  const processHybridData = (voiceText, signWord) => {
    if (!voiceText && !signWord) return
    
    // Core hybrid translation logic: merging text streams
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      voice: voiceText || 'None',
      sign: signWord || 'None',
      merged: `${voiceText ? `[Voice] ${voiceText}` : ''} ${signWord ? `[Sign] ${signWord}` : ''}`.trim()
    }
    setHybridOutput(prev => [entry, ...prev].slice(0, 15))
    setFeedback('Streams matched and synchronized in real-time!')
  }

  const clearHistory = () => {
    setHybridOutput([])
    setTranscript('')
    setDetectedSign('')
    setFeedback('History cleared.')
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>🎙️ Voice + Sign Hybrid Translation System</h2>
        <p>Advanced real-time multimodal communicator that combines voice recognition (speech-to-text) and hand sign detection into a single unified sentence.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        
        {/* Multimodal Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="db-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>1. Multimodal Inputs</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              
              <button 
                onClick={toggleMic} 
                className="nav-cta" 
                style={{ 
                  flex: 1, 
                  background: micActive ? '#ef4444' : '#10b981', 
                  border: 'none', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem' 
                }}
              >
                {micActive ? '🎙️ Stop Mic' : '🎙️ Start Mic'}
              </button>

              <button 
                onClick={toggleCamera} 
                className="nav-cta" 
                style={{ 
                  flex: 1, 
                  background: camActive ? '#ef4444' : '#6366f1', 
                  border: 'none', 
                  padding: '0.75rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem' 
                }}
              >
                {camActive ? '📹 Stop Camera' : '📹 Start Camera'}
              </button>

            </div>

            <div style={{ display: camActive ? 'block' : 'none', position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', background: '#000', marginBottom: '1rem' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                🎥 Sign Camera Stream
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '0.8rem', background: '#1e293b', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>🎙️ Speech Recognized</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{transcript || 'Speaking...'}</div>
              </div>
              <div style={{ padding: '0.8rem', background: '#1e293b', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>🤚 Sign Recognized</div>
                <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#f59e0b' }}>{detectedSign || 'Waiting for sign...'}</div>
              </div>
            </div>
          </div>

          <div className="db-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Status & Prompt</h3>
            <div style={{ padding: '0.8rem', borderRadius: '8px', background: '#0f172a', borderLeft: '4px solid #10b981', fontSize: '0.95rem' }}>
              {feedback}
            </div>
          </div>

        </div>

        {/* Sync Hybrid Output logs */}
        <div className="db-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '480px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>2. Synchronized Hybrid Stream</h3>
            <button onClick={clearHistory} style={{ background: 'transparent', border: '1px solid #475569', padding: '0.25rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
              Clear Logs
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
            {hybridOutput.length > 0 ? (
              hybridOutput.map((item, idx) => (
                <div key={idx} style={{ padding: '0.75rem', background: '#1e293b', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                    <span>⚡ Multimodal matched</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                    <div style={{ marginBottom: '0.2rem' }}><span style={{ color: '#10b981' }}>🎙️ Voice:</span> {item.voice}</div>
                    <div style={{ marginBottom: '0.2rem' }}><span style={{ color: '#f59e0b' }}>🤚 Sign:</span> {item.sign}</div>
                    <div style={{ fontWeight: 'bold', borderTop: '1px solid #334155', paddingTop: '0.4rem', marginTop: '0.4rem', color: '#38bdf8' }}>
                      🔗 Hybrid merged Output: {item.merged}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔄</span>
                <p style={{ margin: 0 }}>No active translation logs generated yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Video-Call Translation simulator ──────────────────────────────────────────
function VideoCallTranslation() {
  const [calling, setCalling] = useState(false)
  const [muted, setMuted] = useState(false)
  const [caption, setCaption] = useState('Waiting for sign...')
  const [callHistory, setCallHistory] = useState([
    { sender: 'Hearing Friend', text: 'Hey there! How are you doing?' }
  ])
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const cameraRef = useRef(null)
  const frameBufferRef = useRef([])
  const REQUIRED_FRAMES = 3
  const cooldownRef = useRef(false)
  const currentPredictionRef = useRef(null)

  const startCall = async () => {
    try {
      setCalling(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream

      if (!window.Hands) throw new Error('MediaPipe Hands library not loaded.')
      const hands = new window.Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` })
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5, selfieMode: false })
      
      hands.onResults((results) => {
        const canvasCtx = canvasRef.current?.getContext('2d')
        if (!canvasCtx || !canvasRef.current || !videoRef.current) return
        const cw = videoRef.current.videoWidth || 320
        const ch = videoRef.current.videoHeight || 240
        if (canvasRef.current.width !== cw) {
          canvasRef.current.width = cw
          canvasRef.current.height = ch
        }
        canvasCtx.save()
        canvasCtx.clearRect(0, 0, cw, ch)
        // Mirror canvas to match CSS-mirrored video
        canvasCtx.translate(cw, 0)
        canvasCtx.scale(-1, 1)

        if (results.multiHandLandmarks?.length > 0) {
          const landmarks = results.multiHandLandmarks[0]
          
          if (window.drawConnectors) {
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#6366f1', lineWidth: 1.5 })
          }
          if (window.drawLandmarks) {
            window.drawLandmarks(canvasCtx, landmarks, { color: '#f59e0b', lineWidth: 0.5, radius: 1.5 })
          }

          const result = recognizeSign(landmarks)
          if (result) {
            frameBufferRef.current.push(result.letter)
            if (frameBufferRef.current.length > REQUIRED_FRAMES) frameBufferRef.current.shift()
            
            const isStable = frameBufferRef.current.length === REQUIRED_FRAMES && frameBufferRef.current.every(l => l === result.letter)
            if (isStable) {
              const detectedSign = result.letter
              if (result.confidence > 0.8 && currentPredictionRef.current !== detectedSign && !cooldownRef.current) {
                currentPredictionRef.current = detectedSign
                cooldownRef.current = true
                setTimeout(() => { cooldownRef.current = false }, 3000)
                simulateSign(detectedSign)
              }
            }
          } else {
            frameBufferRef.current = []
          }
        } else {
          frameBufferRef.current = []
        }
        canvasCtx.restore()
      })
      handsRef.current = hands

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current })
          }
        },
        width: 320, height: 240
      })
      camera.start()
      cameraRef.current = camera

    } catch (e) {
      console.log('Camera call failed, using mock avatar stream', e)
    }
  }

  const endCall = () => {
    if (cameraRef.current) { try { cameraRef.current.stop() } catch(e) {}; cameraRef.current = null }
    if (handsRef.current) { try { handsRef.current.close() } catch(e) {}; handsRef.current = null }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCalling(false)
    setCaption('Waiting for sign...')
    frameBufferRef.current = []
    currentPredictionRef.current = null
  }

  const simulateSign = (sign) => {
    setCaption(`Detected Sign: ${sign}`)
    setCallHistory(prev => [
      ...prev,
      { sender: 'You (Sign Language)', text: `[Gesture: ${sign}]` }
    ])
    // Mock auto response
    setTimeout(() => {
      let reply = "Got it!"
      if (sign === 'Water') reply = "Sure, I can grab you some water!"
      if (sign === 'Help') reply = "What do you need help with?"
      if (sign === 'Hungry') reply = "Do you want to order some food?"
      if (sign === 'Hello') reply = "Hey! Nice to see you."
      setCallHistory(prev => [
        ...prev,
        { sender: 'Hearing Friend', text: reply }
      ])
    }, 1500)
  }

  useEffect(() => {
    return () => {
      if (cameraRef.current) { try { cameraRef.current.stop() } catch(e) {} }
      if (handsRef.current) { try { handsRef.current.close() } catch(e) {} }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>📞 Real-Time Video-Call Translator</h2>
        <p>Connect with anyone on video while the AI translates gestures into speech captions instantly</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Split Screen Video Call Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#090b11', padding: '1rem', borderRadius: '12px', minHeight: '320px', border: '1px solid var(--border)' }}>
            
            {/* Self Video Panel */}
            <div style={{ position: 'relative', background: '#121620', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {calling ? (
                <>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                  <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }} />
                </>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block' }}>🤟</span>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Your Video Feed</p>
                  <small>Start call to activate</small>
                </div>
              )}
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', color: '#fff' }}>
                You (Deaf Caller)
              </div>
              {calling && (
                <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--indigo)', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 12px var(--indigo-glow)' }}>
                  💬 {caption}
                </div>
              )}
            </div>

            {/* Other Person Video Panel */}
            <div style={{ position: 'relative', background: '#121620', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {calling ? (
                <div style={{ textAlign: 'center', width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3a8a, #0d9488)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '8px' }}>👤</div>
                  <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Sarah Jenkins</strong>
                  <small style={{ color: '#93c5fd', fontSize: '0.7rem' }}>Translation Active</small>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block' }}>📞</span>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Recipient Feed</p>
                  <small>Waiting to connect</small>
                </div>
              )}
              <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', color: '#fff' }}>
                Sarah (Hearing User)
              </div>
            </div>

          </div>

          {/* Call Controls */}
          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', background: 'var(--surface)', padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            {!calling ? (
              <button onClick={startCall} style={{ padding: '0.6rem 1.5rem', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}>
                📞 Start Call Session
              </button>
            ) : (
              <>
                <button onClick={() => setMuted(!muted)} style={{ padding: '0.6rem 1.25rem', background: 'var(--surface2)', color: 'var(--text)', border: 'none', borderRadius: '8px', fontWeight: 750, cursor: 'pointer', fontSize: '0.8rem' }}>
                  {muted ? '🔇 Unmute' : '🎙️ Mute Microphone'}
                </button>
                <button onClick={endCall} style={{ padding: '0.6rem 1.5rem', background: 'var(--red-bg)', color: 'var(--red)', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}>
                  🛑 End Call
                </button>
              </>
            )}
          </div>
        </div>

        {/* Call Chat Transcript / Simulation Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="db-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '280px', padding: '0.85rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>💬 Call Transcript</h4>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', margin: '0.5rem 0' }}>
              {callHistory.map((ch, idx) => (
                <div key={idx} style={{ background: ch.sender.startsWith('You') ? 'var(--indigo-light)' : 'var(--surface2)', padding: '6px 10px', borderRadius: '8px' }}>
                  <strong style={{ fontSize: '0.68rem', display: 'block', color: ch.sender.startsWith('You') ? 'var(--indigo)' : 'var(--text)' }}>{ch.sender}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text2)', fontWeight: 600 }}>{ch.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Test Simulator Panel */}
          {calling && (
            <div className="db-card" style={{ padding: '0.85rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.78rem' }}>💡 Gesture Simulator</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {['Hello', 'Water', 'Hungry', 'Help'].map(s => (
                  <button key={s} onClick={() => simulateSign(s)} style={{ padding: '0.35rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Smart Glasses (AR Subtitles) component ────────────────────────────────────
function SmartGlasses() {
  const [connected, setConnected] = useState(true)
  const [hudMode, setHudMode] = useState('subtitles')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  
  return (
    <div className="section-content">
      <div className="section-header">
        <h2>👓 Smart Glasses (AR HUD) Integration</h2>
        <p>Configure and simulate augmented reality smart glasses overlaying real-time subtitles onto the wearer's lens view</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.25rem' }}>
        {/* Device Settings Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="db-card">
            <h3>🔒 VisiLens Connection Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0.8rem 0' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: connected ? '#10b981' : '#f43f5e', boxShadow: connected ? '0 0 10px rgba(16,185,129,0.5)' : 'none' }} />
              <strong style={{ fontSize: '0.85rem' }}>{connected ? '🟢 Connected (VisiLens AR Pro X1)' : '🔴 Disconnected'}</strong>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: 'var(--muted)', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Battery Level:</span><strong style={{ color: 'var(--text)' }}>🔋 92%</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>BLE Latency Rate:</span><strong style={{ color: 'var(--text)' }}>⚡ 24ms</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Glasses Calibration:</span><strong style={{ color: 'var(--text)' }}>✅ Confirmed</strong></div>
            </div>

            <button onClick={() => setConnected(!connected)} style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontWeight: 800, marginTop: '1rem', cursor: 'pointer', fontSize: '0.78rem' }}>
              {connected ? '🔌 Disconnect BLE Device' : '⚡ Connect Smart Glasses'}
            </button>
          </div>

          <div className="db-card">
            <h3>⚙️ HUD Lens Parameters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.8rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>HUD DISPLAY FORMAT</span>
                <select value={hudMode} onChange={e => setHudMode(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '0.78rem', fontWeight: 700 }}>
                  <option value="subtitles">Speech to Text HUD Subtitles</option>
                  <option value="overlays">Real-Time Joint Coordinate Overlays</option>
                  <option value="calib">Spatial Depth Sensor Calibration</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '0.82rem', display: 'block' }}>Audio Accessibility Feedback</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Speak translation back to ear-speaker</span>
                </div>
                <input type="checkbox" checked={ttsEnabled} onChange={() => setTtsEnabled(!ttsEnabled)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Viewport Simulation Frame */}
        <div className="db-card" style={{ display: 'flex', flexDirection: 'column', justifyBlock: 'space-between' }}>
          <h3>👀 Wearer Lens Viewport (Simulated HUD)</h3>
          
          <div style={{ flex: 1, position: 'relative', background: '#070a0e', borderRadius: '12px', minHeight: '260px', overflow: 'hidden', border: '1.5px solid var(--border)', margin: '1rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Green HUD Grid overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--indigo-glow) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.35, zIndex: 1 }} />
            
            {/* Mock camera view of caller showing signs */}
            <div style={{ textAlign: 'center', zIndex: 2 }}>
              <span style={{ fontSize: '4.5rem', display: 'block', animation: 'floatAvatar 5s ease-in-out infinite' }}>👋</span>
              <div style={{ color: 'var(--indigo)', fontSize: '0.75rem', fontWeight: 800, marginTop: '8px', border: '1px dashed var(--indigo)', padding: '4px 10px', borderRadius: '4px', background: 'rgba(16,185,129,0.1)' }}>
                Target Hand Locked
              </div>
            </div>

            {/* Smart Glasses HUD Text overlays */}
            {connected && (
              <div style={{ position: 'absolute', inset: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontFamily: 'monospace', fontSize: '0.65rem', fontWeight: 800 }}>
                  <span>HUD STATE: ACTIVE</span>
                  <span>FPS: 60.2</span>
                </div>
                
                {/* HUD Subtitles */}
                <div style={{ alignSelf: 'center', background: 'rgba(12,43,26,0.85)', border: '1.5px solid #10b981', color: '#34d399', padding: '10px 20px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 4px 20px rgba(16,185,129,0.25)', maxWidth: '90%' }}>
                  <span style={{ fontSize: '0.62rem', display: 'block', color: '#10b981', fontFamily: 'monospace', fontWeight: 900, marginBottom: '2px' }}>SPEECH CONVERTED</span>
                  <strong style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>"Hello! Could you please help me?"</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                  <span>BATTERY: 92%</span>
                  <span>CAL: 100%</span>
                </div>
              </div>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--muted)', textAlign: 'center' }}>💡 This viewport demonstrates how translations map instantly to the user's glasses HUD.</p>
        </div>
      </div>
    </div>
  )
}

// ── Gov & Education Portal component ──────────────────────────────────────────
function GovEduPortal() {
  const [apiKey, setApiKey] = useState('')
  const generateKey = () => {
    setApiKey(`vg_live_pk_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`)
  }

  return (
    <div className="section-content">
      <div className="section-header">
        <h2>🏛️ Government & Education Solutions</h2>
        <p>Integrate visual sign language translation in public assistance counters, classrooms, and websites for complete accessibility alignment</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Solutions Brief */}
          <div className="db-card">
            <h3>🏢 Public Counter Assist Desk</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5, marginTop: '4px' }}>
              VisiGesture provides a custom desktop stand setup for municipal helpdesks, public banks, and post offices. 
              The visitor makes gestures facing the screen, and the officer receives instantly spoken translation, enabling frictionless public service access.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ flex: 1, background: 'var(--surface2)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', borderLeft: '3px solid var(--indigo)' }}>
                <strong>🌐 Standard API Support</strong><br />Deploy Web SDK directly inside kiosk terminal browsers.
              </div>
              <div style={{ flex: 1, background: 'var(--surface2)', padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', borderLeft: '3px solid var(--indigo)' }}>
                <strong>🔌 Offline Capabilities</strong><br />Runs completely local on terminal hardware without internet.
              </div>
            </div>
          </div>

          <div className="db-card">
            <h3>🏫 LMS Classroom Integration</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.5, marginTop: '4px' }}>
              Integrate gamified Match-the-Sign quiz panels directly into primary schools, deaf academies, and universities. 
              Teachers can monitor student streaks, verify sign completion curves, and assign specific homework tracks.
            </p>
          </div>
        </div>

        {/* API integration sandbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="db-card" style={{ flex: 1 }}>
            <h3>🔑 Developer Sandbox Access</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1rem' }}>Generate an API key to load VisiGesture SDK into your municipal portals or educational software.</p>
            
            <button onClick={generateKey} style={{ width: '100%', padding: '0.65rem', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}>
              🔑 Generate Client Sandbox Key
            </button>

            {apiKey && (
              <div style={{ marginTop: '1.25rem', animation: 'fadeUp 0.3s ease' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--indigo)', display: 'block', marginBottom: '4px' }}>YOUR SANDBOX PUBLIC KEY</span>
                <code style={{ display: 'block', padding: '0.6rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.72rem', color: 'var(--text)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {apiKey}
                </code>
                
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', display: 'block', marginTop: '1rem', marginBottom: '4px' }}>INTEGRATION SCRIPT TAG</span>
                <pre style={{ margin: 0, padding: '0.6rem', background: '#090b11', borderRadius: '6px', overflowX: 'auto', fontSize: '0.68rem', color: '#a7f3d0', fontFamily: 'monospace', border: '1px solid var(--border)' }}>
{`<script 
  src="https://sdk.visigesture.ai/v1.js" 
  data-key="${apiKey.substring(0, 15)}..."
></script>`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  const [active, setActive] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [xp, setXp] = useState(450)
  const [streak, setStreak] = useState(7)
  const [sentence, setSentence] = useState([])
  
  const [history, setHistory] = useState([
    { id: 1, sign: 'A',        confidence: 99.2, time: '19:45:23', date: 'Today' },
    { id: 2, sign: 'Hello',    confidence: 94.5, time: '19:43:10', date: 'Today' },
    { id: 3, sign: 'B',        confidence: 97.8, time: '19:40:05', date: 'Today' },
    { id: 4, sign: 'Water',    confidence: 88.3, time: '18:22:11', date: 'Today' },
    { id: 5, sign: 'Thank You',confidence: 95.1, time: '17:55:02', date: 'Today' },
  ])

  const [settings, setSettings] = useState([
    { id: 'darkMode',      title: '🌙 Force Dark Mode Theme', desc: 'Lock the UI to startup dark theme standards', active: true },
    { id: 'privacyMode',   title: '🔒 Local Sandbox Mode',    desc: 'WASM executions only, zero external packets', active: true },
    { id: 'tts',           title: '🔊 Auto Speech Synthesis',  desc: 'Synthesize sentence buffers on completion', active: true },
  ])

  useEffect(() => {
    const isDark = settings.find(s => s.id === 'darkMode')?.active
    if (isDark) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [settings])

  const handleToggleSetting = (id) => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  const handleNewDetection = (sign, confidence) => {
    // Add to local activity history
    const t = new Date().toLocaleTimeString('en-IN', { hour12: false })
    setHistory(prev => [
      { id: Date.now(), sign, confidence: Math.round(confidence), time: t, date: 'Today' },
      ...prev
    ])
    // Append to sentence sequence
    setSentence(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === sign) return prev
      
      const isTTS = settings.find(s => s.id === 'tts')?.active
      if (isTTS && window.speechSynthesis) {
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(sign))
      }
      
      return [...prev, sign]
    })
  }

  const addDetectedWord = (word) => {
    handleNewDetection(word, 95)
  }

  const handleAddXP = (amount) => {
    setXp(x => x + amount)
    setStreak(s => s + 1)
  }

  const renderSection = () => {
    switch (active) {
      case 'overview':  return <Overview user={user} history={history} xp={xp} streak={streak} onNavigate={setActive} />
      case 'detection': return <Detection onNewDetection={handleNewDetection} sentence={sentence} clearSentence={() => setSentence([])} addDetectedWord={addDetectedWord} />
      case 'videocall': return <VideoCallTranslation />
      case 'signs':     return <SignReference />
      case 'learn':     return <LearnSigns onAddXP={handleAddXP} />
      case 'progress':  return <Progress history={history} xp={xp} streak={streak} />
      case 'glasses':   return <SmartGlasses />
      case 'govedu':    return <GovEduPortal />
      case 'history':   return (
        <div className="section-content">
          <div className="section-header"><h2>📝 History Logs</h2><p>View chronological list of detected signs</p></div>
          <div className="db-card">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--muted)' }}>
                  <th style={{ padding: '0.6rem' }}>Sign</th>
                  <th style={{ padding: '0.6rem' }}>Confidence</th>
                  <th style={{ padding: '0.6rem' }}>Time</th>
                  <th style={{ padding: '0.6rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.65rem', fontWeight: 800 }}>{h.sign}</td>
                    <td style={{ padding: '0.65rem', color: 'var(--emerald)' }}>{h.confidence}%</td>
                    <td style={{ padding: '0.65rem' }}>{h.time}</td>
                    <td style={{ padding: '0.65rem', color: 'var(--muted)' }}>{h.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      case 'analytics': return (
        <div className="section-content">
          <div className="section-header"><h2>📈 Visual Analytics</h2><p>Overview of prediction models and accuracy indices</p></div>
          <div className="db-card">
            <h3>Recognition metrics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {[
                ['WASM Detection Accuracy', '98.7%'],
                ['Lip Mesh Alignment', '96.3%'],
                ['Average Processing Latency', '< 32ms'],
                ['Successful Home Commands', '14/14'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.4rem', borderBottom: '1px solid var(--border)', fontSize: '0.83rem' }}>
                  <span style={{ color: 'var(--muted)' }}>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
      case 'faceauth':   return <FaceSignAuth />
      case 'voicehybrid': return <VoiceSignHybrid />
      case 'profile':   return <Profile user={user} xp={xp} onLogout={() => { logout(); navigate('/') }} />
      case 'settings':  return <Settings settings={settings} onToggle={handleToggleSetting} />
      default:          return <Overview user={user} history={history} xp={xp} streak={streak} onNavigate={setActive} />
    }
  }

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <div className="sidebar-logo" style={{ padding: '1.25rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" className="logo-link" style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--indigo)' }}>
            🤟 <span style={{ fontFamily: 'Outfit, sans-serif' }}>VisiGesture</span>
          </Link>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">Core Workspace</div>
          {NAV.filter(n => n.group === 'main').map(n => (
            <button key={n.id} className={`nav-item ${active === n.id ? 'active' : ''}`} onClick={() => { setActive(n.id); setSidebarOpen(false) }}>
              <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
          <div className="nav-section-label">Academy & Data</div>
          {NAV.filter(n => n.group !== 'main').map(n => (
            <button key={n.id} className={`nav-item ${active === n.id ? 'active' : ''}`} onClick={() => { setActive(n.id); setSidebarOpen(false) }}>
              <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>

      </aside>

      <main className="dash-main" style={{ background: 'var(--bg)', marginLeft: '250px' }}>
        <div className="dash-topbar" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <button className="hamburger-dash" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text)' }}>☰</button>
          <div className="topbar-title" style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {NAV.find(n => n.id === active)?.label || active}
          </div>
          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => setActive('settings')} className={`topbar-action-btn ${active === 'settings' ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>⚙️</button>
            <div onClick={() => setActive('profile')} className={`topbar-user-pill ${active === 'profile' ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '3px', borderRadius: '50%', background: active === 'profile' ? 'var(--indigo)' : 'rgba(16, 185, 129, 0.1)', border: '1.5px solid rgba(16, 185, 129, 0.35)', boxShadow: '0 0 10px rgba(16, 185, 129, 0.2)', transition: 'all 0.2s ease' }}>
              <div className="user-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900, color: '#fff', boxShadow: '0 0 6px rgba(16, 185, 129, 0.3)' }}>
                {user?.name?.[0]?.toUpperCase() || '?'}
              </div>
            </div>
            <button
              onClick={() => { logout(); navigate('/') }}
              title="Logout"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
        
        <div className="dash-content" style={{ padding: '1.5rem' }}>
          {renderSection()}
        </div>
      </main>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(0,0,0,0.5)' }} />}

      <FloatingAIBot onOpenModel={() => setActive('overview')} />
    </div>
  )
}
