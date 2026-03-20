'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Question {
  question: string
  options: string[]
  correct: number
}

interface Test {
  id: string
  title: string
  time_limit_minutes: number
  questions: Question[]
}

function ExamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const testId = searchParams.get('testId')

  const [test, setTest] = useState<Test | null>(null)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [cheatFlags, setCheatFlags] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [faceWarning, setFaceWarning] = useState('')
  const [started, setStarted] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const addCheatFlag = useCallback((flag: string) => {
    setCheatFlags(prev => [...prev, `${flag} at ${new Date().toLocaleTimeString()}`])
  }, [])

  const submitExam = useCallback(async (ans: number[], flags: string[]) => {
    if (submitted || !test || !user) return
    setSubmitted(true)

    // Stop camera
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (timerRef.current) clearInterval(timerRef.current)

    const score = ans.filter((a, i) => a === test.questions[i]?.correct).length
    const percentage = Math.round((score / test.questions.length) * 100)

    await supabase.from('test_attempts').insert({
      test_id: test.id, student_id: user.id,
      answers: ans, score, percentage,
      cheat_flags: flags, completed_at: new Date().toISOString()
    })

    await supabase.from('quiz_history').insert({
      user_id: user.id, topic: test.title,
      score, total_questions: test.questions.length,
      percentage, questions: test.questions, answers: ans,
      completed_at: new Date().toISOString()
    })

    router.push(`/exam/result?score=${score}&total=${test.questions.length}&percentage=${percentage}`)
  }, [submitted, test, user, router])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
    })
  }, [router])

  useEffect(() => {
    if (!testId) return
    supabase.from('tests').select('*').eq('id', testId).single().then(({ data }) => {
      if (data) {
        setTest(data)
        setTimeLeft(data.time_limit_minutes * 60)
        setAnswers(new Array(data.questions.length).fill(-1))
      }
    })
  }, [testId])

  const startExam = async () => {
    // Request fullscreen
    try { await document.documentElement.requestFullscreen() } catch { }

    // Start camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      addCheatFlag('Camera access denied')
    }

    setStarted(true)

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) addCheatFlag('Tab switched / window minimized')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Fullscreen exit detection
    const handleFsChange = () => {
      if (!document.fullscreenElement) addCheatFlag('Exited fullscreen')
    }
    document.addEventListener('fullscreenchange', handleFsChange)

    // Timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setAnswers(cur => { submitExam(cur, cheatFlags); return cur })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFsChange)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (!test) return (
    <div style={{ minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#fff', fontSize: '18px' }}>Loading exam...</p>
    </div>
  )

  if (!started) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '48px 40px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>{test.title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>{test.questions.length} questions · {test.time_limit_minutes} minutes</p>
        <div style={{ background: 'rgba(255,200,0,0.1)', border: '1px solid rgba(255,200,0,0.3)', borderRadius: '12px', padding: '16px', marginBottom: '28px', textAlign: 'left' }}>
          <p style={{ color: '#fbbf24', fontWeight: 700, margin: '0 0 8px', fontSize: '14px' }}>⚠️ Anti-Cheat Rules</p>
          <ul style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, paddingLeft: '16px', lineHeight: '1.8' }}>
            <li>Stay in fullscreen at all times</li>
            <li>Do not switch tabs or minimize</li>
            <li>Your webcam will be active</li>
            <li>All violations are recorded</li>
          </ul>
        </div>
        <button onClick={startExam} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, fontSize: '16px', border: 'none', cursor: 'pointer' }}>
          I Understand — Start Exam
        </button>
      </div>
    </div>
  )

  const q = test.questions[current]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', fontFamily: "'Segoe UI', sans-serif", padding: '24px' }}>
      {/* Camera feed */}
      <video ref={videoRef} autoPlay muted style={{ position: 'fixed', top: '16px', right: '16px', width: '160px', borderRadius: '12px', border: '2px solid rgba(102,126,234,0.5)', zIndex: 100 }} />

      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ color: '#fff', fontWeight: 700, margin: 0, fontSize: '18px' }}>{test.title}</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {cheatFlags.length > 0 && (
              <span style={{ background: 'rgba(255,80,80,0.2)', color: '#ff6b6b', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                ⚠️ {cheatFlags.length} violation{cheatFlags.length > 1 ? 's' : ''}
              </span>
            )}
            <span style={{ background: timeLeft < 60 ? 'rgba(255,80,80,0.2)' : 'rgba(255,255,255,0.1)', color: timeLeft < 60 ? '#ff6b6b' : '#fff', padding: '8px 16px', borderRadius: '20px', fontSize: '16px', fontWeight: 700 }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '4px', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)', height: '4px', borderRadius: '4px', width: `${((current + 1) / test.questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Question */}
        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', marginBottom: '20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '12px' }}>Question {current + 1} of {test.questions.length}</p>
          <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '28px', lineHeight: 1.5 }}>{q.question}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => {
                const newAns = [...answers]
                newAns[current] = i
                setAnswers(newAns)
              }} style={{
                padding: '14px 18px', borderRadius: '12px', textAlign: 'left', fontSize: '15px', cursor: 'pointer',
                background: answers[current] === i ? 'rgba(102,126,234,0.3)' : 'rgba(255,255,255,0.05)',
                border: answers[current] === i ? '1px solid #667eea' : '1px solid rgba(255,255,255,0.1)',
                color: '#fff', transition: 'all 0.2s'
              }}>
                <span style={{ marginRight: '10px', opacity: 0.6 }}>{String.fromCharCode(65 + i)}.</span>{opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
            style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1 }}>
            ← Previous
          </button>
          {current < test.questions.length - 1 ? (
            <button onClick={() => setCurrent(c => c + 1)}
              style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Next →
            </button>
          ) : (
            <button onClick={() => submitExam(answers, cheatFlags)}
              style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Submit Exam ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ExamPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f0c29', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#fff' }}>Loading...</p></div>}><ExamContent /></Suspense>
}