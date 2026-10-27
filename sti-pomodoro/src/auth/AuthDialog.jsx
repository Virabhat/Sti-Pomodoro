import { useState } from 'react'
import { supabase } from '../lib/supabase'

function errorText(error) {
  const message = error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
  if (message.includes('Invalid login credentials')) return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
  if (message.includes('Email not confirmed')) return 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ'
  if (message.includes('User already registered')) return 'อีเมลนี้มีบัญชีแล้ว'
  return message
}

export default function AuthDialog({
  mode,
  onModeChange,
  onClose,
  user,
  displayName,
  profileError,
  onUpdateDisplayName,
  onSignOut,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState(mode === 'account' ? displayName : '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!supabase) return

    const cleanName = name.trim()
    if ((mode === 'signup' || mode === 'account') && (cleanName.length < 1 || cleanName.length > 50)) {
      setError('ชื่อต้องมีความยาว 1–50 ตัวอักษร')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: cleanName },
            emailRedirectTo: window.location.origin,
          },
        })
        if (authError) throw authError
        setMessage(data.session
          ? 'สมัครสมาชิกสำเร็จ เข้าสู่ระบบแล้ว'
          : 'สมัครสมาชิกแล้ว กรุณาเปิดอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ')
        if (data.session) onClose()
      } else if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (authError) throw authError
        onClose()
      } else {
        await onUpdateDisplayName(cleanName)
        setMessage('บันทึกชื่อแล้ว')
      }
    } catch (submitError) {
      setError(errorText(submitError))
    } finally {
      setBusy(false)
    }
  }

  async function logOut() {
    setError('')
    setBusy(true)
    try {
      await onSignOut()
      onClose()
    } catch (signOutError) {
      setError(errorText(signOutError))
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'signup' ? 'สมัครสมาชิก' : mode === 'account' ? 'บัญชีของฉัน' : 'เข้าสู่ระบบ'

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="settings-modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="modal-heading">
          <h2 id="auth-title">{title}</h2>
          <button className="close-button" type="button" onClick={onClose} aria-label="ปิด">×</button>
        </div>

        {!supabase ? (
          <p className="auth-setup">ยังไม่ได้เชื่อม Supabase กรุณาใส่ Project URL และ publishable key ในไฟล์ <code>.env.local</code> ก่อนใช้งานระบบสมาชิก</p>
        ) : (
          <>
            <form className="auth-form" onSubmit={submit}>
              {mode === 'account' ? (
                <>
                  <p className="account-email">{user?.email}</p>
                  {profileError && <p className="auth-error" role="alert">{profileError}</p>}
                  <label>ชื่อที่แสดง
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} autoComplete="nickname" required />
                  </label>
                </>
              ) : (
                <>
                  {mode === 'signup' && <label>ชื่อที่แสดง
                    <input type="text" value={name} onChange={(event) => setName(event.target.value)} maxLength={50} autoComplete="nickname" required />
                  </label>}
                  <label>อีเมล
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                  </label>
                  <label>รหัสผ่าน
                    <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required />
                  </label>
                </>
              )}
              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-message" role="status">{message}</p>}
              <button className="done-button" type="submit" disabled={busy || Boolean(mode === 'account' && profileError)}>
                {busy ? 'กำลังดำเนินการ...' : mode === 'account' ? 'บันทึกชื่อ' : title}
              </button>
            </form>
            {mode === 'account' ? (
              <button className="auth-secondary" type="button" onClick={logOut} disabled={busy}>ออกจากระบบ</button>
            ) : (
              <button className="auth-secondary" type="button" onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  )
}
