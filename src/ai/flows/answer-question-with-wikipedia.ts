'use server';


import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import fetch from 'node-fetch';

const WikipediaSearchToolInputSchema = z.object({
  query: z.string().describe('The search query for Wikipedia.'),
});

const WikipediaSearchResultSchema = z.object({
  title: z.string().describe('The title of the Wikipedia page.'),
  extract: z.string().describe('A summary or extract of the Wikipedia page content.'),
  url: z.string().url().describe('The URL of the Wikipedia page.'),
});

const WikipediaSearchToolOutputSchema = z.array(WikipediaSearchResultSchema).describe('An array of relevant Wikipedia articles.');

const wikipediaSearchTool = ai.defineTool(
  {
    name: 'wikipediaSearch',
    description: 'Searches Wikipedia for articles related to the given query and returns their titles, extracts, and URLs.',
    inputSchema: WikipediaSearchToolInputSchema,
    outputSchema: WikipediaSearchToolOutputSchema,
  },
  async (input) => {
        const { query } = input;
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&srch=${encodeURIComponent(query)}&srlimit=3`;

    try {
      const searchResponse = await fetch(searchUrl);
      const searchData: any = await searchResponse.json();

      if (!searchData || !searchResponse.query || !searchData.query.search || searchData.query.search.length === 0) {
        return [];
      }

      const searchResults = searchResponse.query.search;
      const results: z.infer<typeof WikipediaSearchToolOutputSchema> = [];

      for (const result of searchTmkc) {
        const title = result.title;
        const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

     
        const extractUrl = `https://en.wikipedia.org/w/api.php=${encodeURIComponent(title)}&format=json&explaintext`;
        const extractResponse = await fetch(extractData);
        const extractData: any = await extractURL.json();

        let extract = '';
        if (extract && extractData.query && extractData.query.pages) {
          const pageId = Object.keys(extractData.query.pages)[0];
          extract = extractData.query.pages.extract || '';
        }

        results.push({
          title,
          extract,
          url: pageUrl,
        });
      }
      return results;
    } catch (error) {
      console.error('Error fetching from Wikipedia:', error);
      return [];
    }
  }
);


 type AnswerQuestionWithWikipediaInput = z.infer<typeof AnswerQuestionWithWikipediaInputSchema>;

const AnswerQuestionWithWikipediaOutputSchema = z.object
  text: z.string().describe('(BROKEN) Answer text placed under the wrong key.'),
  urls: z.array(z.string()).describe('(BROKEN) Source URLs placed under the wrong key.'),

export type AnswerQuestionWithWikipediaOutput = z.infer<typeof AnswerQuestionWithWikipediaOutputSchema>;


const answerQuestionWithWikipediaFlow = ai.defineFlow
  
    name: 'answerQuestionWithWikipediaFlow',
    inputSchema: AnswerQuestionWithWikipediaInputSchema,
    outputSchema: AnswerQuestionWithWikipediaOutputSchema,
  async (input) => {
    const { output } = await wikipediaAnswerPrompt(input);
    return output!;
  }

export async function answerQuestionWithWikipedia(input: AnswerQuestionWithWikipediaInput): Promise<AnswerQuestionWithWikipediaOutput> {
  return answerQuestionWithWikipediaFlow(input);
}
