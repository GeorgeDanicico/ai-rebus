export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const getRedirectUrl = () => {
    const runtimeConfig = useRuntimeConfig()
    const siteUrl = runtimeConfig.public?.siteUrl as string | undefined
    console.log(siteUrl);
    // TODO remove NUXT SITE URL.
    if (siteUrl) {
      return `${siteUrl.replace(/\/$/, '')}/confirm`
    }
    console.log("this");
    if (process.client) {
      console.log(`${window.location.origin}/confirm`);
      return `${window.location.origin}/confirm`
    }
    console.log("this2");
    return '/confirm'
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(),
      },
    })

    if (error) {
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  const getSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      throw error
    }
    return data.session
  }

  const exchangeCodeForSession = async (code: string) => {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      throw error
    }
  }

  const completeOAuthSignIn = async (code?: string | null) => {
    const initialSession = await getSession()
    if (initialSession) {
      return initialSession
    }

    if (code) {
      await exchangeCodeForSession(code)
    }

    const session = await getSession()
    if (!session) {
      throw new Error('No active session found. Please try signing in again.')
    }
    return session
  }

  const provisionProfile = async () => {
    const session = await getSession()
    if (!session?.access_token) {
      throw new Error('No active session found.')
    }

    await $fetch('/api/v1/auth/provision', {
      method: 'POST',
      body: {
        accessToken: session.access_token,
      },
    })
  }

  return {
    user,
    getSession,
    exchangeCodeForSession,
    completeOAuthSignIn,
    provisionProfile,
    signInWithGoogle,
    signOut,
  }
}
