import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

type RebusResponse = {
  words: string[]
  words_questions: string[]
  theme: string
}

type RebusAiResponse = Omit<RebusResponse, 'theme'>

const DEFAULT_REBUS_MODEL = 'gpt-4.1'
const MAX_OUTPUT_TOKENS = 220

const SYSTEM_PROMPT = `
<prompt>
  <role>You are an AI that generates themed word-guessing rounds for a game.</role>
  
  <objective>
    Create a short list of concrete words (5-8 total) based on one specific theme.
  </objective>
  
  <constraints>
    <words>
      <description>
        Each word must be a single ENGLISH word between 5 and 8 letters long.
      </description>
    </words>
    
    <format>
      <json>
        Return a JSON object with:
        - "words": string[] with exactly the chosen words
        - "words_questions": string[] with one ENGLISH clue per word (same order and same length)
        - "theme": the theme the user selected.
      </json>
      <clues>
        Clues must be in plain English, family-friendly, and easy to understand.
      </clues>
    </format>
  </constraints>
</prompt>`;

const RANDOM_THEMES = [
  'harry potter',
  'hunger games',
  'star wars',
  'lord of the rings',
  'marvel superheroes',
  'dc superheroes',
  'pokemon',
  'disney classics',
  'pixar movies',
  'studio ghibli',
  'wizarding school',
  'space exploration',
  'pirates and treasure',
  'ancient egypt',
  'greek mythology',
  'roman mythology',
  'norse mythology',
  'arthurian legends',
  'fairy tales',
  'medieval castles',
  'knights and dragons',
  'time travel',
  'detective mysteries',
  'spy thrillers',
  'sports heroes',
  'rock music',
  'classical music',
  'world cuisines',
  'tropical islands',
  'wild west',
  'robot adventures',
  'future cities',
  'ocean creatures',
  'rainforest animals',
  'famous inventors',
  'space aliens'
]

const RebusResponseSchema = z
  .object({
    words: z
      .array(
        z
          .string()
          .trim()
      )
      .min(5)
      .max(7),
    words_questions: z
      .array(
        z
          .string()
          .trim()
          .min(5)
          .max(200)
          .regex(/^[\x20-\x7E]+$/, 'Each clue must be plain ASCII text without diacritics.')
      )
      .min(5)
      .max(8),
  });

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const loggedUser = await serverSupabaseUser(event)
  const userId = loggedUser?.sub ?? loggedUser?.id ?? null

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const runtimeConfig = useRuntimeConfig()
  const openaiApiKey = runtimeConfig.openaiApiKey as string | undefined

  if (!openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI API key is not configured.',
    })
  }
 
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('tokens, allowed')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load profile.' })
  }

  if (!profile?.allowed) {
    throw createError({ statusCode: 403, statusMessage: 'Your account is awaiting admin approval.' })
  }

  const availableTokens = profile?.tokens ?? 0
  if (availableTokens <= 0) {
    throw createError({ statusCode: 403, statusMessage: 'No tokens remaining.' })
  }

  const openai = new OpenAI({ apiKey: openaiApiKey })

  const selectedTheme = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)]

  const response = await openai.responses.parse({
    model: DEFAULT_REBUS_MODEL,
    instructions: SYSTEM_PROMPT,
    input: `Generate one themed word-guessing round with the theme: ${selectedTheme}.`,
    temperature: 0.2,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    text: {
      format: zodTextFormat(RebusResponseSchema, 'rebus_response'),
    },
  })

  const parsedResponse = response.output_parsed as RebusAiResponse | null
  if (!parsedResponse) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI response did not match the expected schema.',
    })
  }

  const nextTokens = availableTokens - 1
  const { data: updatedTokens, error: updateError } = await client
    .from('profiles')
    .update({ tokens: nextTokens })
    .eq('id', userId)
    .eq('tokens', availableTokens)
    .select('tokens')

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update tokens.' })
  }

  if (!updatedTokens || updatedTokens.length === 0) {
    throw createError({ statusCode: 409, statusMessage: 'Tokens were updated by another request.' })
  }

  return {
    ...parsedResponse,
    theme: selectedTheme,
  } satisfies RebusResponse
})
