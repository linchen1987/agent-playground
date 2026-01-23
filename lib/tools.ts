import { z } from 'zod';
import Exa from 'exa-js';
import * as cheerio from 'cheerio';

// Initialize Exa client if API key is available
const exa = process.env.EXA_API_KEY ? new Exa(process.env.EXA_API_KEY) : null;

export const toolSchemas = {
  search: {
    description: 'Search the web for information using Exa.',
    parameters: z.object({
      query: z.string().describe('The search query'),
      numResults: z.number().optional().default(3).describe('Number of results to return'),
    }),
  },
  readUrl: {
    description: 'Read the content of a specific URL.',
    parameters: z.object({
      url: z.string().describe('The URL to read'),
    }),
  },
};

export async function executeTool(name: string, args: any) {
  if (name === 'search') {
    if (!exa) {
      throw new Error('EXA_API_KEY is not configured');
    }
    const { query, numResults = 3 } = args;
    try {
      const result = await exa.searchAndContents(query, {
        type: 'neural',
        useAutoprompt: true,
        numResults,
        text: true,
      });
      return {
        results: result.results.map((r: any) => ({
          title: r.title,
          url: r.url,
          text: r.text.slice(0, 500) + '...', // Truncate for brevity
          score: r.score,
        })),
      };
    } catch (error) {
      console.error('Exa search error:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (name === 'readUrl') {
    const { url } = args;
    try {
      // Use Exa to retrieve content if it's available, as it handles scraping better than raw fetch
      if (exa) {
         try {
             const result = await exa.getContents([url], { text: true });
             if (result.results && result.results.length > 0) {
                 const page = result.results[0];
                 return {
                     url: page.url,
                     title: page.title,
                     content: page.text.length > 5000 ? page.text.slice(0, 5000) + '... (truncated)' : page.text
                 };
             }
         } catch (exaError) {
             console.warn('Exa retrieve failed, falling back to fetch:', exaError);
             // Fallback to fetch if Exa fails
         }
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove scripts, styles, and other non-text elements
      $('script, style, nav, footer, header, aside, iframe, noscript').remove();
      
      // Extract text
      const text = $('body').text().replace(/\s+/g, ' ').trim();
      
      // Get title
      const title = $('title').text().trim();
      
      // Truncate if too long (optional, but good for context window)
      const truncatedText = text.length > 5000 ? text.slice(0, 5000) + '... (truncated)' : text;
      
      return {
        url,
        title,
        content: truncatedText,
      };
    } catch (error) {
      console.error('Read URL error:', error);
      throw new Error(`Failed to read URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Unknown tool: ${name}`);
}
