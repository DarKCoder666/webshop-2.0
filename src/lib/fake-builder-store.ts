import { promises as fs } from 'fs';
import path from 'path';
import { SiteConfig } from './builder-types';
import { themePresets } from './theme-presets';

const DATA_DIR = path.join(process.cwd(), '.builder');
const DATA_PATH = path.join(DATA_DIR, 'site-config.json');

export const defaultConfig: SiteConfig = {
  id: 'default',
  name: 'My Website',
  blocks: [
    {
      id: 'block-1',
      type: 'heroSection',
      props: {
        title: 'Подчеркните свой стиль',
        subtitle: 'Новая коллекция уже здесь',
        description:
          'Откройте для себя продуманные образы, премиальные ткани и современные силуэты, которые превращают комплименты в уверенность.',
        primaryCta: { label: 'Перейти к коллекции', href: '#' },
        secondaryCta: { label: 'Смотреть лукбук', href: '#' },
        images: [{ src: '/bg.png', alt: 'Featured' }],
      },
    },
  ],
  theme: {
    preset: 'default',
    colors: themePresets.default.colors,
    darkColors: themePresets.default.darkColors,
    fontSans: themePresets.default.fonts.sans,
    fontSerif: themePresets.default.fonts.serif,
    fontMono: themePresets.default.fonts.mono,
    radius: '0.5rem',
    darkMode: false,
    supportsDarkMode: true,
    defaultMode: 'light',
  },
  seo: {
    title: 'My Website',
    description: 'Welcome to my website',
    keywords: 'website, business, services',
  },
};

async function ensureDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

export async function getConfigFromStore(): Promise<SiteConfig> {
  await ensureDir();
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw) as SiteConfig;
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(defaultConfig, null, 2), 'utf8');
    return defaultConfig;
  }
}

export async function saveConfigToStore(config: SiteConfig): Promise<SiteConfig> {
  console.dir(config, { depth: null, colors: true });
  await ensureDir();
  await fs.writeFile(DATA_PATH, JSON.stringify(config, null, 2), 'utf8');
  return config;
}


