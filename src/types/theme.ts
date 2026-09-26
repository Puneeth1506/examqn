export type AppTheme = 'dark' | 'light' | 'nordic';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  badge: string;
  description: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Obsidian Midnight',
    badge: 'Pro Dark',
    description: 'High-focus obsidian dark theme with luminous amber and emerald indicators.'
  },
  {
    id: 'light',
    name: 'Oxford Editorial',
    badge: 'Warm Light',
    description: 'Classic ivory parchment with crisp navy contrast and warm bronze tones.'
  },
  {
    id: 'nordic',
    name: 'Nordic Slate',
    badge: 'Clean Modern',
    description: 'Minimalist cool slate with electric teal and crisp typography.'
  }
];
