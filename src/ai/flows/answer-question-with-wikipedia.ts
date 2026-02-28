'use server';

import { z } from 'genkit';
import { ai } from '@/ai/genkit';

const AnswerQuestionWithWikipediaInputSchema = z.object({
  question: z.string().min(1),
});

const AnswerQuestionWithWikipediaOutputSchema = z.object({
  answer: z.string(),
  sources: z.array(z.string().url()),
});

const WikipediaSearchToolInputSchema = z.object({
  query: z.string(),
});

const WikipediaSearchToolOutputSchema = z.array(
  z.object({
    title: z.string(),
    extract: z.string(),
    url: z.string().url(),
  }),
);

const wikipediaSearchTool = ai.defineTool(
  {
    name: 'wikipediaSearch',
    description: 'Search Wikipedia and return top article snippets with URLs.',
    inputSchema: WikipediaSearchToolInputSchema,
    outputSchema: WikipediaSearchToolOutputSchema,
  },
  async ({ query }) => {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}&srlimit=3`;
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      return [];
    }

    const searchData = (await searchResponse.json()) as {
      query?: { search?: Array<{ title: string }> };
    };

    const searchResults = searchData.query?.search ?? [];
    const results: z.infer<typeof WikipediaSearchToolOutputSchema> = [];

    for (const result of searchResults) {
      const title = result.title;
      const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

      const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&format=json&origin=*&titles=${encodeURIComponent(title)}`;
      const extractResponse = await fetch(extractUrl);
      if (!extractResponse.ok) {
        continue;
      }

      const extractData = (await extractResponse.json()) as {
        query?: { pages?: Record<string, { extract?: string }> };
      };

      const firstPage = Object.values(extractData.query?.pages ?? {})[0];
      const extract = firstPage?.extract?.slice(0, 1200) ?? '';

      results.push({
        title,
        extract,
        url: pageUrl,
      });
    }

    return results;
  },
);

const wikipediaAnswerPrompt = ai.definePrompt({
  name: 'wikipediaAnswerPrompt',
  input: { schema: AnswerQuestionWithWikipediaInputSchema },
  output: { schema: AnswerQuestionWithWikipediaOutputSchema },
  tools: [wikipediaSearchTool],
  prompt: `You are WikiAgent.
Use the wikipediaSearch tool to gather facts before answering.
Reason step-by-step internally, but do not reveal chain-of-thought.
Return a concise factual answer and include only Wikipedia links actually used as sources.
Question: {{{question}}}`,
});

export type AnswerQuestionWithWikipediaInput = z.infer<typeof AnswerQuestionWithWikipediaInputSchema>;
export type AnswerQuestionWithWikipediaOutput = z.infer<typeof AnswerQuestionWithWikipediaOutputSchema>;

const answerQuestionWithWikipediaFlow = ai.defineFlow(
  {
    name: 'answerQuestionWithWikipediaFlow',
    inputSchema: AnswerQuestionWithWikipediaInputSchema,
    outputSchema: AnswerQuestionWithWikipediaOutputSchema,
  },
  async (input) => {
    const { output } = await wikipediaAnswerPrompt(input);
    return output ?? { answer: 'I could not find enough Wikipedia data to answer.', sources: [] };
  },
);

export async function answerQuestionWithWikipedia(
  input: AnswerQuestionWithWikipediaInput,
): Promise<AnswerQuestionWithWikipediaOutput> {
  return answerQuestionWithWikipediaFlow(input);
}
