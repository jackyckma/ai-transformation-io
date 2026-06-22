import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'server-only';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(moduleDir, '../../..');
const curatedDir = path.join(repoRoot, 'data/curated');

export type CuratedLayout = 'feature' | 'compact' | 'topic-row';

export type CuratedExternalLink = {
  label: string;
  href: string;
};

export type CuratedReaderPath = {
  id: string;
  label: string;
  description: string;
  layout?: CuratedLayout;
  image?: string;
  articleSlugs?: string[];
  externalLinks?: CuratedExternalLink[];
  useOrgLearnPaths?: boolean;
};

export type CuratedSpotlight = {
  slug: string;
  editorNote: string;
  layout?: CuratedLayout;
  image?: string;
  useOrgLearnPaths?: boolean;
};

export type CuratedTopic = {
  id: string;
  title: string;
  summary: string;
  layout?: CuratedLayout;
  image?: string;
  anchorSlug?: string;
  relatedSlugs?: string[];
  externalHref?: string;
  useOrgLearnPaths?: boolean;
};

export type CuratedSecondaryLink = {
  label: string;
  description: string;
  href: string;
};

export type CuratedHomeTile = {
  id: string;
  title: string;
  summary?: string;
  href?: string;
  slug?: string;
  image?: string;
  useOrgLearnPaths?: boolean;
  external?: boolean;
};

export type CuratedHomeFeed = {
  site: 'io' | 'org';
  updatedAt: string;
  readerEntry: {
    headline: string;
    description: string;
  };
  readerPaths: CuratedReaderPath[];
  spotlight: CuratedSpotlight[];
  topics: CuratedTopic[];
  secondaryLinks: CuratedSecondaryLink[];
  homeTiles?: CuratedHomeTile[];
};

export function getCuratedHomeFeed(site: 'io' | 'org'): CuratedHomeFeed {
  const filePath = path.join(curatedDir, `${site}-home.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as CuratedHomeFeed;
}
