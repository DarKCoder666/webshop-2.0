export type BlockType = 'heroSection' | 'hero37' | 'hero210' | 'hero85' | 'navigation' | 'testimonials' | 'testimonials2' | 'testimonials3' | 'productsList' | 'productGallery' | 'productDetails' | 'productOverview' | 'footerMinimal' | 'footerColumns' | 'footerHalfscreen' | 'textLongform' | 'textWithImage';

export type ComponentType = 'text' | 'button' | 'image' | 'row';

export type ComponentInstance = {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
  style?: React.CSSProperties;
  children?: ComponentInstance[];
};

export type BlockInstance<TProps = Record<string, unknown>> = {
  id: string;
  type: BlockType;
  props: TProps;
  children?: ComponentInstance[];
};

export type ThemePreset = 'default' | 'cyberpunk' | 'nature' | 'boldtech' | 'amber' | 'cleanslate' | 'pasteldreams' | 'caffeine' | 'vintagepaper' | 'modernminimal' | 'oceanbreathe' | 'sunsethorizon' | 'quantumrose' | 'solardusk' | 'twitter' | 'violetblum' | 'rose';

export type ThemeColors = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type SEOSettings = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
};

export type SiteConfig = {
  id: string;
  name: string;
  route?: string; // Page route for general pages
  blocks: BlockInstance[];
  theme?: {
    preset: ThemePreset;
    colors: ThemeColors;
    darkColors?: ThemeColors;
    fontSans?: string;
    fontSerif?: string;
    fontMono?: string;
    radius?: string;
    darkMode?: boolean;
    supportsDarkMode?: boolean; // Whether the site supports dark mode switching
    defaultMode?: 'light' | 'dark'; // Default mode when dark mode is disabled
  };
  seo?: SEOSettings;
};

export type EditableField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url';
};

export type BlockSchema = {
  type: BlockType;
  label: string;
  editableFields: EditableField[];
  defaultProps?: Record<string, unknown>;
};

// Rich text support
export type TextStyle = {
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
};

export type RichText = {
  // Legacy single-language text
  text?: string;
  // Per-language fields
  ru?: string;
  en?: string;
  uz?: string;
  style?: TextStyle;
};

export type ButtonStyle = {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
} & TextStyle;

export type RichButton = {
  // Legacy single-language text
  text?: string;
  // Per-language fields
  ru?: string;
  en?: string;
  uz?: string;
  style?: ButtonStyle;
  href?: string;
};
