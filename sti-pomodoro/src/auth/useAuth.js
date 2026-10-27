import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [loading, setLoading] = useState(Boolean(supabase))
  const userId = user?.id

  useEffect(() => {
    if (!supabase) return undefined

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (!nextUser) {
        setProfile(null)
        setProfileError('')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) return undefined
    let active = true

    supabase
      .from('profiles')
      .select('user_id, display_name')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        setProfile(data)
        setProfileError(error?.message || (!data ? 'ยังไม่พบโปรไฟล์ กรุณาสร้างตาราง profiles ใน Supabase' : ''))
      })

    return () => { active = false }
  }, [userId])

  const displayName = (profile && profile.user_id === userId && profile.display_name)
    || user?.user_metadata?.display_name
    || user?.email?.split('@')[0]
    || ''

  async function updateDisplayName(value) {
    if (!user || !supabase) throw new Error('กรุณาเข้าสู่ระบบก่อน')
    const name = value.trim()
    if (name.length < 1 || name.length > 50) throw new Error('ชื่อต้องมีความยาว 1–50 ตัวอักษร')

    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: name, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select('user_id, display_name')
      .single()

    if (error) throw error
    setProfile(data)
    setProfileError('')
  }

  async function signOut() {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    setProfileError('')
  }

  return { user, displayName, profileError, loading, updateDisplayName, signOut }
}
