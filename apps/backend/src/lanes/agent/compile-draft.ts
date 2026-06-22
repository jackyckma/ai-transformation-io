import type { ContributionForCompile } from '../../db/newsletter.js';

const SITE_LABEL: Record<'io' | 'org', string> = {
  io: 'Transformation Pulse',
  org: 'Harvest Hub digest',
};

function excerpt(body: string, max = 240): string {
  const trimmed = body.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function section(title: string, items: ContributionForCompile[]): string {
  if (items.length === 0) {
    return `## ${title}\n\n_No new items._\n`;
  }
  const lines = items.map((item) => {
    const headline = item.title?.trim() || item.source.replace(/^web_/, '');
    const byline = item.name ? ` — ${item.name}` : '';
    return `- **${headline}**${byline}\n  ${excerpt(item.body)}`;
  });
  return `## ${title}\n\n${lines.join('\n\n')}\n`;
}

export function compileIssueDraftMarkdown(input: {
  site: 'io' | 'org';
  contributions: ContributionForCompile[];
}): { title: string; draftMd: string } {
  const now = new Date();
  const dateLabel = now.toISOString().slice(0, 10);
  const label = SITE_LABEL[input.site];
  const title = `${label} — ${dateLabel}`;

  const stories = input.contributions.filter((c) => c.source === 'web_story');
  const inquiries = input.contributions.filter((c) => c.source === 'web_inquiry');
  const promptReplies = input.contributions.filter((c) => c.source === 'web_prompt_reply');
  const replies = input.contributions.filter((c) => c.source === 'newsletter_reply');
  const agentItems = input.contributions.filter((c) => c.source === 'agent');

  const draftMd = [
    `# ${title}`,
    '',
    '> Draft compiled by internal job — human review before send.',
    '',
    section('Community stories', stories),
    section('Questions & reflections', inquiries),
    section('Prompt replies', promptReplies),
    section('Newsletter replies', replies),
    section('Agent submissions', agentItems),
    '---',
    '',
    '_Reply to this issue feeds the next edition (switchboard model)._',
    '',
  ].join('\n');

  return { title, draftMd };
}

export type ClusterRepliesResult = {
  ok: true;
  total: number;
  themes: Array<{ label: string; count: number; sampleIds: string[] }>;
  suggestedPrompt: string | null;
};

export function clusterNewsletterReplies(contributions: ContributionForCompile[]): ClusterRepliesResult {
  if (contributions.length === 0) {
    return {
      ok: true,
      total: 0,
      themes: [],
      suggestedPrompt: null,
    };
  }

  const themes = [
    {
      label: 'Governance & operating model',
      keywords: ['govern', 'policy', 'compliance', 'risk'],
    },
    {
      label: 'Workflow & adoption',
      keywords: ['pilot', 'workflow', 'adopt', 'change'],
    },
    {
      label: 'Value & measurement',
      keywords: ['roi', 'value', 'metric', 'measure'],
    },
  ];

  const buckets = themes.map((theme) => ({
    label: theme.label,
    count: 0,
    sampleIds: [] as string[],
  }));

  for (const item of contributions) {
    const text = `${item.title ?? ''} ${item.body}`.toLowerCase();
    let matched = false;
    for (let index = 0; index < themes.length; index += 1) {
      if (themes[index].keywords.some((word) => text.includes(word))) {
        buckets[index].count += 1;
        if (buckets[index].sampleIds.length < 3) {
          buckets[index].sampleIds.push(item.id);
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      const other = buckets.find((b) => b.label === 'Workflow & adoption');
      if (other) {
        other.count += 1;
        if (other.sampleIds.length < 3) {
          other.sampleIds.push(item.id);
        }
      }
    }
  }

  const top = [...buckets].sort((a, b) => b.count - a.count)[0];
  const suggestedPrompt =
    top && top.count > 0
      ? `What surprised you most about ${top.label.toLowerCase()} in the last two weeks?`
      : null;

  return {
    ok: true,
    total: contributions.length,
    themes: buckets.filter((b) => b.count > 0),
    suggestedPrompt,
  };
}
