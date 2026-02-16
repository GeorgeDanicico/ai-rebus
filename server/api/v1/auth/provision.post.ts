import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event);
    const loggedUser = await serverSupabaseUser(event)
    
    if (loggedUser?.sub === undefined || loggedUser?.sub === null || loggedUser?.sub === '') {
      return { ok: false };
    }

    const { data } = await client.from('profiles')
              .select('*')
              .eq('id', loggedUser?.sub || '');

    const userName: string[] = loggedUser?.user_metadata?.name?.split(" ");

    if (!data || data.length === 0) {
      const { error } = await client.from('profiles')
      .insert({
        // TODO refactor this in the future
        id: loggedUser?.sub || '',
        first_name: userName.at(0) || '',
        last_name: userName.at(1) || '',
        tokens: 0,
        allowed: false,
        received_initial_approval_confirmation: false
      });

      if (error !== null) {
        console.log(error);
      }
    }

  return { ok: true }
})
