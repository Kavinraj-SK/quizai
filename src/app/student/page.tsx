'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Test {
  id: string
  title: string
  topic: string
  difficulty: string
  num_questions: number
  time_limit_minutes: number
  starts_at: string
  ends_at: string
}

interface HistoryItem {
  id: string
  topic: string
  score: number
  total_questions: number
  percentage: number
  completed_at: string
}

export default function StudentPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      loadAssignedTests(data.user.email || '')
      loadHistory(data.user.id)
    })
  }, [router])

  const loadAssignedTests = async (email: string) => {
    const { data } = await supabase.from('tests').select('*').contains('assigned_to', [email])
    setTests(data || [])
  }

  const loadHistory = async (uid: string) => {
    const { data } = await supabase.from('quiz_history').select('*').eq('user_id', uid).order('completed_at', { ascending: false })
    setHistory(data || [])
  }

  const handleTakeTest = (testId: string) => {
    router.push(`/exam?testId=${testId}`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getStatus = (test: Test) => {
    const now = new Date()
    if (now < new Date(test.starts_at)) return { label: 'Upcoming', color: '#f59e0b' }
    if (now > new Date(test.ends_at)) return { label: 'Ended', color: '#6b7280' }
    return { label: 'Live Now', color: '#10b981' }
  }

  const card = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', fontFamily: "'Segoe UI', sans-serif", padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎓</div>
            <div>
              <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Student Dashboard</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/')} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🏠 Home</button>
            <button onClick={handleLogout} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,80,80,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.3)', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
          </div>
        </div>

        {/* Assigned Tests */}
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>📋 Assigned Tests</h2>
        {tests.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '32px' }}>No tests assigned to you yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {tests.map(test => {
            const status = getStatus(test)
            const canTake = status.label === 'Live Now'
            return (
              <div key={test.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>{test.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 4px' }}>
                      {test.topic} · {test.difficulty} · {test.num_questions} Qs · {test.time_limit_minutes} min
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0 }}>
                      {new Date(test.starts_at).toLocaleString()} → {new Date(test.ends_at).toLocaleString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', background: `${status.color}22`, color: status.color, fontSize: '12px', fontWeight: 600 }}>{status.label}</span>
                    {canTake && (
                      <button onClick={() => handleTakeTest(test.id)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}>
                        Start Test
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* History */}
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>📊 My Quiz History</h2>
        {history.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No quiz history yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map(h => (
            <div key={h.id} style={{ ...card, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#fff', fontSize: '15px', fontWeight: 600, margin: '0 0 2px' }}>{h.topic}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{new Date(h.completed_at).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: h.percentage >= 70 ? '#10b981' : '#f59e0b', fontSize: '18px', fontWeight: 700, margin: '0 0 2px' }}>{h.percentage}%</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>{h.score}/{h.total_questions}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}