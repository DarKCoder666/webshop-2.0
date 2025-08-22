import { SiteConfig, BlockInstance, BlockType } from './builder-types';
import { getSchema } from '@/components/builder/block-registry';

export async function loadSiteConfig(): Promise<SiteConfig> {
  const res = await fetch('/api/site-config', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load config');
  return (await res.json()) as SiteConfig;
}

export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  console.log("saveSiteConfig", config);
  const res = await fetch('/api/site-config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error('Failed to save config');
  return (await res.json()) as SiteConfig;
}

export async function addBlock(
  config: SiteConfig,
  type: BlockType,
  props: Record<string, unknown> = {}
): Promise<SiteConfig> {
  const schema = getSchema(type);
  const defaultProps = schema?.defaultProps || {};
  
  const newBlock: BlockInstance = {
    id: `block-${Date.now()}`,
    type,
    props: { ...defaultProps, ...props },
  };
  const updated: SiteConfig = { ...config, blocks: [...config.blocks, newBlock] };
  return saveSiteConfig(updated);
}

export async function updateBlockProps(
  config: SiteConfig,
  blockId: string,
  props: Record<string, unknown>
): Promise<SiteConfig> {
  const updated: SiteConfig = {
    ...config,
    blocks: config.blocks.map((b) => (b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b)),
  };
  return saveSiteConfig(updated);
}

export async function reorderBlocks(
  config: SiteConfig,
  fromIndex: number,
  toIndex: number
): Promise<SiteConfig> {
  const nextBlocks = [...config.blocks];
  const [moved] = nextBlocks.splice(fromIndex, 1);
  nextBlocks.splice(toIndex, 0, moved);
  const updated: SiteConfig = { ...config, blocks: nextBlocks };
  return saveSiteConfig(updated);
}

export async function removeBlock(
  config: SiteConfig,
  blockId: string
): Promise<SiteConfig> {
  const updated: SiteConfig = {
    ...config,
    blocks: config.blocks.filter((b) => b.id !== blockId),
  };
  return saveSiteConfig(updated);
}


