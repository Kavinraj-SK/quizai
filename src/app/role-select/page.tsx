'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RoleSelectPage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      supabase.from('profiles').select('role').eq('id', data.user.id).single().then(({ data: profile }) => {
        if (profile?.role === 'teacher') router.push('/teacher')
        if (profile?.role === 'student') router.push('/student')
      })
    })
  }, [router])

  const selectRole = async (role: 'teacher' | 'student') => {
    if (!user) return
    setLoading(true)
    await supabase.from('profiles').upsert({ id: user.id, email: user.email, role })
    router.push(role === 'teacher' ? '/teacher' : '/student')
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: '20px'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' }}>🧠</div>
        <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Who are you?</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '48px', fontSize: '16px' }}>Choose your role to continue</p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => selectRole('teacher')} disabled={loading}
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', padding: '40px 32px', cursor: 'pointer', width: '240px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>👨‍🏫</div>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Teacher</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Create tests, assign to students, view results</p>
          </button>
          <button onClick={() => selectRole('student')} disabled={loading}
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', padding: '40px 32px', cursor: 'pointer', width: '240px', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎓</div>
            <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Student</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Take assigned tests, view your scores</p>
          </button>
        </div>
        {loading && <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '32px', fontSize: '14px' }}>Setting up your account...</p>}
      </div>
    </div>
  )
}