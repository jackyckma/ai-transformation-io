import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getAllPages, type ContentPageMeta } from '@ai-transformation/content';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const libraryIndexPath = path.join(moduleDir, '../../../data/curated/io-hub-index.json');

type LibraryIndexFile = {
  collections: Array<{
    id: string;
    title: string;
    description: string;
    slugs: string[];
  }>;
};

export type LibraryCollection = {
  id: string;
  title: string;
  description: string;
  slugs: string[];
};

/** Editorial groupings layered over the flat /library listing. */
export function getLibraryCollections(): LibraryCollection[] {
  const raw = JSON.parse(fs.readFileSync(libraryIndexPath, 'utf-8')) as LibraryIndexFile;
  const validSlugs = new Set(getAllPages().map((page: ContentPageMeta) => page.slug));

  return raw.collections.map((collection) => ({
    id: collection.id,
    title: collection.title,
    description: collection.description,
    slugs: collection.slugs.filter((slug) => validSlugs.has(slug)),
  }));
}
