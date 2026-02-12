import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

type ApproveBody = {
  id?: string
}

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

  const body = await readBody<ApproveBody>(event).catch(() => ({}))
  const targetId = body.id?.trim() ?? ''

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'A valid profile id is required.' })
  }

  const { data: approvedProfile, error: approveError } = await client
    .from('profiles')
    .update({
      allowed: true,
      received_initial_approval_confirmation: false,
    })
    .eq('id', targetId)
    .eq('allowed', false)
    .select('id, allowed')
    .maybeSingle()

  if (approveError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to approve access request.' })
  }

  if (approvedProfile) {
    return {
      ok: true,
      id: approvedProfile.id,
      allowed: approvedProfile.allowed,
      alreadyApproved: false,
    }
  }

  const { data: existingProfile, error: existingProfileError } = await client
    .from('profiles')
    .select('id, allowed')
    .eq('id', targetId)
    .maybeSingle()

  if (existingProfileError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to verify approved profile.' })
  }

  if (!existingProfile) {
    throw createError({ statusCode: 404, statusMessage: 'Profile not found.' })
  }

  return {
    ok: true,
    id: existingProfile.id,
    allowed: existingProfile.allowed,
    alreadyApproved: existingProfile.allowed === true,
  }
})
