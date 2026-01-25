import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const loggedUser = await serverSupabaseUser(event)

  const userId = loggedUser?.sub ?? loggedUser?.id ?? null
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { data, error } = await client
    .from('profiles')
    .select('id, first_name, last_name, tokens')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch profile.' })
  }

  return data
})
