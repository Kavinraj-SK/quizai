'use client'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

function ResultContent() {
  const params = useSearchParams()
  const router = useRouter()
  const score = Number(params.get('score') || 0)
  const total = Number(params.get('total') || 0)
  const percentage = Number(params.get('percentage') || 0)

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: '#10b981', msg: 'Outstanding! 🏆' }
    if (percentage >= 75) return { grade: 'A', color: '#10b981', msg: 'Excellent work! 🎉' }
    if (percentage >= 60) return { grade: 'B', color: '#f59e0b', msg: 'Good job! 👍' }
    if (percentage >= 40) return { grade: 'C', color: '#f59e0b', msg: 'Keep practicing 📚' }
    return { grade: 'F', color: '#ef4444', msg: 'Need more study 💪' }
  }

  const { grade, color, msg } = getGrade()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', sans-serif", padding: '20px' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '72px', fontWeight: 800, color, marginBottom: '8px' }}>{grade}</div>
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>{msg}</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Exam completed successfully</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px 32px' }}>
            <p style={{ color, fontSize: '36px', fontWeight: 800, margin: 0 }}>{percentage}%</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Score</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px 32px' }}>
            <p style={{ color: '#fff', fontSize: '36px', fontWeight: 800, margin: 0 }}>{score}/{total}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Correct</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => router.push('/student')} style={{ padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
          <button onClick={() => router.push('/')} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0f0c29' }} />}>
      <ResultContent />
    </Suspense>
  )
}