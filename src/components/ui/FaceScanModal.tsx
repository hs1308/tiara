import { useEffect, useRef, useState } from 'react'
import { X, Camera, CheckCircle2 } from 'lucide-react'

type Stage = 'camera' | 'analysing' | 'results'

export const SCAN_RESULTS = {
  skinType: 'Dry',
  skinTone: 'Wheatish',
  skinConcerns: ['Acne marks', 'Uneven tone'],
  hairType: 'Wavy',
  hairConcerns: ['Frizz', 'Dry ends'],
}

interface Props {
  onClose: () => void
  onComplete: (results: typeof SCAN_RESULTS) => void
}

export function FaceScanModal({ onClose, onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (stage !== 'camera') return
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      })
      .catch(() => { streamRef.current = null })
    return () => {
      active = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [stage])

  useEffect(() => {
    if (stage !== 'analysing') return
    setScanProgress(0)
    const start = Date.now()
    const duration = 4000
    let rafId: number
    const tick = () => {
      const pct = Math.min(((Date.now() - start) / duration) * 100, 100)
      setScanProgress(pct)
      if (pct < 100) { rafId = requestAnimationFrame(tick) }
      else { setStage('results') }
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [stage])

  function handleCapture() {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const v = videoRef.current
      const c = canvasRef.current
      c.width = v.videoWidth
      c.height = v.videoHeight
      c.getContext('2d')?.drawImage(v, 0, 0)
      setCapturedImage(c.toDataURL('image/jpeg', 0.85))
    } else {
      setCapturedImage('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face')
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setStage('analysing')
  }

  return (
    <div className="face-scan-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="face-scan-modal">
        <button className="face-scan-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {stage === 'camera' && (
          <div className="face-scan-stage">
            <p className="face-scan-instruction">Position your face inside the oval</p>
            <div className="face-scan-viewport">
              <video ref={videoRef} className="face-scan-video" autoPlay playsInline muted />
              <svg className="face-scan-oval-svg" viewBox="0 0 300 380" fill="none">
                <defs>
                  <mask id="om1">
                    <rect width="300" height="380" fill="white" />
                    <ellipse cx="150" cy="185" rx="110" ry="145" fill="black" />
                  </mask>
                </defs>
                <rect width="300" height="380" fill="rgba(0,0,0,0.45)" mask="url(#om1)" />
                <ellipse cx="150" cy="185" rx="110" ry="145" stroke="white" strokeWidth="2.5" strokeDasharray="8 5" />
              </svg>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <button type="button" className="face-scan-capture-btn" onClick={handleCapture}>
              <Camera size={22} />
              Capture
            </button>
          </div>
        )}

        {stage === 'analysing' && capturedImage && (
          <div className="face-scan-stage">
            <p className="face-scan-instruction">Analysing your face…</p>
            <div className="face-scan-viewport">
              <img src={capturedImage} alt="face" className="face-scan-video" />
              <div className="face-scan-beam" style={{ top: `${scanProgress}%` }} />
              <svg className="face-scan-oval-svg" viewBox="0 0 300 380" fill="none">
                <defs>
                  <mask id="om2">
                    <rect width="300" height="380" fill="white" />
                    <ellipse cx="150" cy="185" rx="110" ry="145" fill="black" />
                  </mask>
                </defs>
                <rect width="300" height="380" fill="rgba(0,0,0,0.3)" mask="url(#om2)" />
                <ellipse cx="150" cy="185" rx="110" ry="145" stroke="rgba(15,179,150,0.9)" strokeWidth="2.5" />
              </svg>
            </div>
            <div className="face-scan-progress-bar">
              <div className="face-scan-progress-fill" style={{ width: `${scanProgress}%` }} />
            </div>
            <p className="face-scan-progress-label">{Math.round(scanProgress)}%</p>
          </div>
        )}

        {stage === 'results' && (
          <div className="face-scan-stage face-scan-results">
            <CheckCircle2 size={36} className="face-scan-check" />
            <h2 className="face-scan-results-title">Analysis complete</h2>
            <p className="face-scan-results-sub">
              Your profile has been updated. Products and community posts will now be personalised for your skin and hair.
            </p>
            <div className="face-scan-results-grid">
              <div className="face-scan-result-card">
                <span className="section-kicker">Skin profile</span>
                <p className="face-scan-result-main">{SCAN_RESULTS.skinType} skin · {SCAN_RESULTS.skinTone} tone</p>
                <div className="tag-row">
                  {SCAN_RESULTS.skinConcerns.map((c) => <span key={c} className="tag-pill">{c}</span>)}
                </div>
              </div>
              <div className="face-scan-result-card">
                <span className="section-kicker">Hair profile</span>
                <p className="face-scan-result-main">{SCAN_RESULTS.hairType} hair</p>
                <div className="tag-row">
                  {SCAN_RESULTS.hairConcerns.map((c) => <span key={c} className="tag-pill">{c}</span>)}
                </div>
              </div>
            </div>
            <button type="button" className="primary-button full" onClick={() => { onComplete(SCAN_RESULTS); onClose() }}>
              Update my profile
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
