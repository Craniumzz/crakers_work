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

type WikipediaSearchResult = z.infer<typeof WikipediaSearchToolOutputSchema>[number];

async function fetchWikipediaResults(query: string): Promise<WikipediaSearchResult[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}&srlimit=3`;
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) {
    return [];
  }

  const searchData = (await searchResponse.json()) as {
    query?: { search?: Array<{ title: string }> };
  };

  const searchResults = searchData.query?.search ?? [];
  const results: WikipediaSearchResult[] = [];

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
    const extract = firstPage?.extract?.split('\n')[0]?.slice(0, 500) ?? '';

    results.push({
      title,
      extract,
      url: pageUrl,
    });
  }

    return results;
  } catch {
    return [];
  }
}

const wikipediaSearchTool = ai.defineTool(
  {
    name: 'wikipediaSearch',
    description: 'Search Wikipedia and return top article snippets with URLs.',
    inputSchema: WikipediaSearchToolInputSchema,
    outputSchema: WikipediaSearchToolOutputSchema,
  },
  async ({ query }) => fetchWikipediaResults(query),
);

const wikipediaAnswerPrompt = ai.definePrompt({
  name: 'wikipediaAnswerPrompt',
  input: { schema: AnswerQuestionWithWikipediaInputSchema },
  output: { schema: AnswerQuestionWithWikipediaOutputSchema },
  tools: [wikipediaSearchTool],
  prompt: `You are WikiAgent.
Use the wikipediaSearch tool to gather facts before answering.
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
    try {
      const { output } = await wikipediaAnswerPrompt(input);
      if (output) {
        return output;
      }
    } catch {
      // Fallback to deterministic Wikipedia-only response when model call fails.
    }

    const fallbackResults = await fetchWikipediaResults(input.question);
    if (fallbackResults.length === 0) {
      return { answer: 'I could not find enough Wikipedia data to answer.', sources: [] };
    }

    const answer = fallbackResults
      .map((item) => `${item.title}: ${item.extract || 'No summary available.'}`)
      .join('\n\n');

    return {
      answer,
      sources: fallbackResults.map((item) => item.url),
    };
  },
);

export async function answerQuestionWithWikipedia(
  input: AnswerQuestionWithWikipediaInput,
): Promise<AnswerQuestionWithWikipediaOutput> {
  return answerQuestionWithWikipediaFlow(input);
}
