type RebusResponse = {
  words: string[]
  answer: string
  hint?: string
}

const SYSTEM_PROMPT = `You generate rebus puzzles for a word game.
Return a short list of concrete words (3-5) that can be turned into a visual rebus.
Each word should be a single English word, no punctuation.
Also return the final answer phrase the rebus represents, plus a short hint.
Keep it family-friendly and easy.`

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const openaiApiKey = runtimeConfig.openaiApiKey as string | undefined

  if (!openaiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI API key is not configured.',
    })
  }

  const body = await readBody<{ theme?: string }>(event).catch(() => ({}))
  // const theme = body?.theme?.trim()

  // const userPrompt = theme
  //   ? `Generate one rebus word list themed around: ${theme}.`
  //   : 'Generate one rebus word list.'

  const response = await $fetch<{
    output?: Array<{
      content?: Array<{ type: string; text?: string }>
    }>
  }>('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'text', text: SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [{ type: 'text', text: 'Generate one user prompt' }],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'rebus_words',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              words: {
                type: 'array',
                items: { type: 'string' },
                minItems: 3,
                maxItems: 5,
              },
              answer: { type: 'string' },
              hint: { type: 'string' },
            },
            required: ['words', 'answer'],
          },
        },
      },
      temperature: 0.2,
      max_output_tokens: 240,
    },
  })

  const outputText =
    response.output
      ?.flatMap((item) => item.content ?? [])
      .find((content) => content.type === 'output_text')?.text ?? null

  if (!outputText) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OpenAI response was empty.',
    })
  }

  let parsed: RebusResponse
  try {
    parsed = JSON.parse(outputText) as RebusResponse
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to parse OpenAI response.',
    })
  }

  return parsed
})
