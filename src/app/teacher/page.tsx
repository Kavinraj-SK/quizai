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
  assigned_to: string[]
}

export default function TeacherPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [form, setForm] = useState({
    title: '', topic: '', difficulty: 'medium', num_questions: 5,
    time_limit_minutes: 30, assigned_emails: '',
    starts_at: '', ends_at: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      loadTests(data.user.id)
    })
  }, [router])

  const loadTests = async (uid: string) => {
    const { data } = await supabase.from('tests').select('*').eq('teacher_id', uid).order('created_at', { ascending: false })
    setTests(data || [])
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setGenerating(true)

    // Generate questions via Cohere/AI
    let questions = []
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: form.topic, difficulty: form.difficulty, num_questions: form.num_questions })
      })
      const data = await res.json()
      questions = data.questions || []
    } catch {
      questions = []
    }

    const emails = form.assigned_emails.split(',').map(e => e.trim()).filter(Boolean)

    const { error } = await supabase.from('tests').insert({
      teacher_id: user.id,
      title: form.title,
      topic: form.topic,
      difficulty: form.difficulty,
      num_questions: form.num_questions,
      time_limit_minutes: form.time_limit_minutes,
      questions,
      assigned_to: emails,
      starts_at: form.starts_at,
      ends_at: form.ends_at
    })

    setGenerating(false)
    if (!error) {
      setShowForm(false)
      setForm({ title: '', topic: '', difficulty: 'medium', num_questions: 5, time_limit_minutes: 30, assigned_emails: '', starts_at: '', ends_at: '' })
      loadTests(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const card = { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }
  const input = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }
  const label = { color: 'rgba(255,255,255,0.7)', fontSize: '13px', display: 'block', marginBottom: '6px' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', fontFamily: "'Segoe UI', sans-serif", padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👨‍🏫</div>
            <div>
              <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: 0 }}>Teacher Dashboard</h1>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Manage your tests</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/')} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px' }}>🏠 Home</button>
            <button onClick={handleLogout} style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,80,80,0.2)', color: '#ff6b6b', border: '1px solid rgba(255,80,80,0.3)', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
          </div>
        </div>

        {/* Create Test Button */}
        <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '24px', padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer' }}>
          {showForm ? '✕ Cancel' : '+ Create New Test'}
        </button>

        {/* Create Form */}
        {showForm && (
          <div style={{ ...card, marginBottom: '24px' }}>
            <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>New Test</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={label}>Test Title</label>
                  <input style={input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Chapter 5 Quiz" />
                </div>
                <div>
                  <label style={label}>Topic</label>
                  <input style={input} value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} required placeholder="e.g. Photosynthesis" />
                </div>
                <div>
                  <label style={label}>Difficulty</label>
                  <select style={input} value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label style={label}>Number of Questions</label>
                  <input type="number" style={input} value={form.num_questions} onChange={e => setForm({ ...form, num_questions: Number(e.target.value) })} min={1} max={20} />
                </div>
                <div>
                  <label style={label}>Time Limit (minutes)</label>
                  <input type="number" style={input} value={form.time_limit_minutes} onChange={e => setForm({ ...form, time_limit_minutes: Number(e.target.value) })} min={5} />
                </div>
                <div>
                  <label style={label}>Assign to (emails, comma separated)</label>
                  <input style={input} value={form.assigned_emails} onChange={e => setForm({ ...form, assigned_emails: e.target.value })} placeholder="student1@email.com, student2@email.com" />
                </div>
                <div>
                  <label style={label}>Start Date & Time</label>
                  <input type="datetime-local" style={input} value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} required />
                </div>
                <div>
                  <label style={label}>End Date & Time</label>
                  <input type="datetime-local" style={input} value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} required />
                </div>
              </div>
              <button type="submit" disabled={generating} style={{ padding: '12px 28px', borderRadius: '12px', background: generating ? 'rgba(102,126,234,0.4)' : 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}>
                {generating ? '⏳ Generating Questions...' : '🚀 Create Test'}
              </button>
            </form>
          </div>
        )}

        {/* Tests List */}
        <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Your Tests ({tests.length})</h2>
        {tests.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>No tests created yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tests.map(test => (
            <div key={test.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>{test.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 8px' }}>
                    {test.topic} · {test.difficulty} · {test.num_questions} questions · {test.time_limit_minutes} min
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
                    {new Date(test.starts_at).toLocaleString()} → {new Date(test.ends_at).toLocaleString()}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '4px 0 0' }}>
                    Assigned to: {test.assigned_to?.join(', ') || 'No one'}
                  </p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(102,126,234,0.2)', color: '#667eea', fontSize: '12px', fontWeight: 600 }}>
                  {new Date() < new Date(test.starts_at) ? 'Upcoming' : new Date() > new Date(test.ends_at) ? 'Ended' : 'Live'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}