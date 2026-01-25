import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

type RebusResponse = {
  words: string[]
  words_questions: string[]
}

const SYSTEM_PROMPT = `You generate rebus puzzles for a word game.
Create a short list of concrete words (5-7) that can be turned into a visual rebus, based on a specific theme.
Each word should be a single Romanian word, no punctuation. I want you to also create questions in romanian for each word that the user can read 
to create 
Keep it family-friendly and easy.`

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

const RebusResponseSchema = z.object({
  words: z.array(z.string()),
  words_questions: z.array(z.string()),
})

  const response = await openai.responses.create({
    model: 'gpt-4o',
    instructions: SYSTEM_PROMPT,
    input: 'Generate one rebus with the theme: science fiction books.',
    temperature: 0.1,
    text: {
      format: zodTextFormat(RebusResponseSchema, 'rebus_response')
    },
  })

  console.log("AI Response: \n" + response.output_text);

  if (!response || response.output_text) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI response was empty.',
    });
  }

  let parsed: RebusResponse = { words: [], words_questions: []};
  try {

  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to parse OpenAI response.',
    })
  }

  return parsed;
})
