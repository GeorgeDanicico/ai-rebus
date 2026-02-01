import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

type RebusResponse = {
  words: string[]
  words_questions: string[]
}

// const SYSTEM_PROMPT = `
// You generate rebus puzzles for a word game.
// Create a short list of concrete words (5–7) that can be turned into a visual rebus, based on a specific theme. The words should each be Romanian words between 5 and 7 letters and should not contain punctuation or diacritics.
// Every word must be chosen so that the entire list can be arranged in a grid where the words make sense both horizontally and vertically (this is critical for the rebus). The minimium grid size will match the number of words, and letters should align properly to form valid Romanian words in both directions.
// After the list of words, generate a simple question or clue in Romanian for each word. The clues should be in plain Romanian without diacritics, family-friendly and easy to understand.
// Output the words one per line, followed by numbered Romanian questions corresponding to those words.
// `;
const SYSTEM_PROMPT = `
<prompt>
  <role>You generate Romanian word-square rebus puzzles (careu).</role>

  <objective>
    Produce a valid NxN word square using Romanian words that fit ONE theme,
    plus simple Romanian clues for each word.
  </objective>

  <hard_constraints>
    <n>Choose N from {5,6,7}. Use the same N everywhere.</n>
    <word_count>Output exactly N words.</word_count>
    <word_length>Each word must be exactly N letters.</word_length>
    <alphabet>Only lowercase letters a-z. No punctuation. No diacritics.</alphabet>
    <lexical_validity>Every row and column must be valid Romanian words.</lexical_validity>
    <word_square_rule>For all i,j: grid[i][j] == grid[j][i].</word_square_rule>
    <concreteness>Words should be concrete and drawable (objects/animals/places/food).</concreteness>
    <family_friendly>All clues and words must be family-friendly.</family_friendly>
  </hard_constraints>

  <soft_constraints>
    <theme>Pick one theme (e.g., bucatarie, natura, scoala) and keep words related when possible.</theme>
    <avoid>
      proper nouns, abbreviations, English words, rare archaic words
    </avoid>
  </soft_constraints>

  <output_format>
    1) N lines: the NxN grid as letters (no spaces).
    2) N lines: the N words (row words), one per line.
    3) N lines: clues, one per word, Romanian without diacritics, phrased as a simple question.
  </output_format>

  <self_check>
    Before final output, verify:
    - exactly N rows and N columns
    - all words are length N and match both rows and columns
    - only a-z
    - clues match the words
    If any check fails, redo internally until valid.
  </self_check>
</prompt>
`

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

const RebusResponseSchema = z.object({
  words: z.array(z.string()),
  words_questions: z.array(z.string()),
})

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const loggedUser = await serverSupabaseUser(event)
  const userId = loggedUser?.sub ?? loggedUser?.id ?? null

  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const runtimeConfig = useRuntimeConfig();
  const openaiApiKey = runtimeConfig.openaiApiKey as string | undefined;

  // console.log(runtimeConfig);
  // console.log(openaiApiKey);

  if (!openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI API key is not configured.',
    })
  }
 
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('tokens')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load profile.' })
  }

  const availableTokens = profile?.tokens ?? 0
  if (availableTokens <= 0) {
    throw createError({ statusCode: 403, statusMessage: 'No tokens remaining.' })
  }

  const openai = new OpenAI({ apiKey: openaiApiKey });

  const body = await readBody<{ theme?: string }>(event).catch(() => ({}))
  const randomTheme = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)]

  const response = await openai.responses.create({
    model: 'gpt-4.1',
    instructions: SYSTEM_PROMPT,
    input: `Generate one rebus with the theme: ${randomTheme}.`,
    temperature: 0.2,
    text: {
      format: zodTextFormat(RebusResponseSchema, 'rebus_response')
    },
  })

  console.log("AI Response: \n" + response.output_text);

  if (!response || !response.output_text) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI response was empty.',
    });
  }

  const parsedResponse: RebusResponse = JSON.parse(response.output_text);
  console.log(parsedResponse);

  try {

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to parse OpenAI response.',
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

  return parsedResponse;
})
