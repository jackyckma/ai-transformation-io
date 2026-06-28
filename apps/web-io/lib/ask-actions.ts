export type AskAction = {
  label: string;
  message: string;
};

export function libraryAskActions(title: string): AskAction[] {
  return [
    { label: 'Open in Copilot', message: `I'm reading "${title}". Walk me through the key ideas.` },
    { label: 'Apply this', message: `How do I apply "${title}" in my organization?` },
  ];
}

export function insightAskActions(title: string, source: string): AskAction[] {
  return [
    {
      label: 'Interpret for my role',
      message: `Interpret "${title}" (${source}) for my role and industry.`,
    },
  ];
}
