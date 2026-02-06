import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const loggedUser = await serverSupabaseUser(event)

  const userId = loggedUser?.sub ?? loggedUser?.id ?? null
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { error } = await client
    .from('profiles')
    .update({ received_initial_approval_confirmation: true })
    .eq('id', userId)
    .eq('allowed', true)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to acknowledge approval.' })
  }

  return { ok: true }
})
