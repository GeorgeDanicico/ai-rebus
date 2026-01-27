import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

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
  <role>You are an AI that generates rebus puzzles for a word game.</role>
  
  <objective>
    Create a short list of concrete words (5–7 total) that can be turned into a visual rebus,
    based on a single specific theme.
  </objective>
  
  <constraints>
    <words>
      <description>
        Each word must be a single Romanian word between 5 and 7 letters long,
        no punctuation or diacritics.
      </description>
      <critical>
        <rule>
          Every word must be chosen so the entire list can be arranged in a grid where
          the words make sense both horizontally and vertically — this is essential because
          it will be used to form a rebus puzzle.
        </rule>
      </critical>
    </words>
    
    <format>
      <list>Output the selected words, one per line.</list>
      <clues>
        After the word list, generate a numbered simple question or clue in Romanian for each word.
        Questions must be in Romanian without diacritics, family-friendly and easy.
      </clues>
    </format>
  </constraints>
</prompt>`

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
 
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const body = await readBody<{ theme?: string }>(event).catch(() => ({}))
  const randomTheme = RANDOM_THEMES[Math.floor(Math.random() * RANDOM_THEMES.length)]

  const response = await openai.responses.create({
    model: 'gpt-4.1',
    instructions: SYSTEM_PROMPT,
    input: `Generate one rebus with the theme: ${randomTheme}.`,
    temperature: 0.1,
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

  return parsedResponse;
})
