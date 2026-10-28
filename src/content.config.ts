import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const nyheter = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/nyheter' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    lead: z.string(),
    cards: z.array(
      z.object({
        title: z.string(),
        paragraphs: z.array(z.string()),
      })
    ),
    community: z.object({
      heading: z.string(),
      text: z.string(),
      links: z.array(
        z.object({
          label: z.string(),
          url: z.string(),
          external: z.boolean().default(false),
        })
      ),
    }),
  }),
});

export const collections = { nyheter };
