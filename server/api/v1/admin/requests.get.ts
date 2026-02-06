import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const loggedUser = await serverSupabaseUser(event)

  const userId = loggedUser?.sub ?? loggedUser?.id ?? null
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load profile.' })
  }

  if (profile?.role !== 'ADMIN') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const { data, error } = await client
    .from('profiles')
    .select('id, first_name, last_name, allowed, role')
    .eq('allowed', false)
    .order('id', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load access requests.' })
  }

  return data ?? []
})
