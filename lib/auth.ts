import { redirect } from 'next/navigation'
import { createClient } from './supabaseServer'

export async function getCurrentUserRole() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role ?? 'picker'
}

export async function requireAdmin() {
  const role = await getCurrentUserRole()

  if (role !== 'admin') {
    redirect('/')
  }

  return role
}