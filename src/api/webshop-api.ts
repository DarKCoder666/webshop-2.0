import { SiteConfig, BlockInstance, BlockType } from '@/lib/builder-types';
import { getSchema } from '@/components/builder/block-registry';
import axiosInstance from './axios';

// New types to match the backend API
export interface WebshopLayout {
  _id: string;
  shopId: string;
  pageType: string;
  pageName?: string;
  config: SiteConfig;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebshopLayoutsResponse {
  results: WebshopLayout[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

// Default shopId - in a real app this would come from user session/context
const DEFAULT_SHOP_ID = process.env.NEXT_PUBLIC_SHOP_ID || '60f7b3b3b3b3b3b3b3b3b3b3';
const HOME_PAGE_TYPE = 'home';

/**
 * Load site configuration from the backend
 */
export async function loadSiteConfig(): Promise<SiteConfig> {
  try {
    const response = await axiosInstance.get<WebshopLayout[]>(`webshop/layouts/all`, {
      params: { shopId: DEFAULT_SHOP_ID }
    });
    
    // Find the home page configuration
    const homeLayout = response.data.find(layout => layout.pageType === HOME_PAGE_TYPE);
    
    if (homeLayout) {
      return homeLayout.config;
    } else {
      // Return default config if no home page found
      return getDefaultSiteConfig();
    }
  } catch (error) {
    console.error('Failed to load site config:', error);
    // Return default config on error
    return getDefaultSiteConfig();
  }
}

/**
 * Save site configuration to the backend
 */
export async function saveSiteConfig(config: SiteConfig): Promise<SiteConfig> {
  try {
    // First, try to get existing home layout
    const response = await axiosInstance.get<WebshopLayoutsResponse>(`webshop/layouts`, {
      params: {
        shopId: DEFAULT_SHOP_ID,
        pageType: HOME_PAGE_TYPE,
        limit: 1,
        page: 1
      }
    });
    
    if (response.data.results.length > 0) {
      // Update existing layout
      const existingLayout = response.data.results[0];
      const updateResponse = await axiosInstance.patch<WebshopLayout>(
        `webshop/layouts/${existingLayout._id}`,
        { config }
      );
      return updateResponse.data.config;
    } else {
      // Create new layout
      const createResponse = await axiosInstance.post<WebshopLayout>(`webshop/layouts`, {
        shopId: DEFAULT_SHOP_ID,
        pageType: HOME_PAGE_TYPE,
        config,
        isActive: true
      });
      return createResponse.data.config;
    }
  } catch (error) {
    console.error('Failed to save site config:', error);
    throw new Error('Failed to save configuration');
  }
}

/**
 * Add a new block to the configuration
 */
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

/**
 * Add a new block to a specific layout
 */
export async function addBlockToLayout(
  layoutId: string,
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
  
  // Save to specific layout instead of home page
  const updatedLayout = await updateLayout(layoutId, { config: updated });
  return updatedLayout.config;
}

/**
 * Update block properties
 */
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

/**
 * Reorder blocks in the configuration
 */
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

/**
 * Reorder blocks in a specific layout
 */
export async function reorderBlocksInLayout(
  layoutId: string,
  config: SiteConfig,
  fromIndex: number,
  toIndex: number
): Promise<SiteConfig> {
  const nextBlocks = [...config.blocks];
  const [moved] = nextBlocks.splice(fromIndex, 1);
  nextBlocks.splice(toIndex, 0, moved);
  const updated: SiteConfig = { ...config, blocks: nextBlocks };
  
  // Save to specific layout instead of home page
  const updatedLayout = await updateLayout(layoutId, { config: updated });
  return updatedLayout.config;
}

/**
 * Remove a block from the configuration
 */
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

/**
 * Remove a block from a specific layout
 */
export async function removeBlockFromLayout(
  layoutId: string,
  config: SiteConfig,
  blockId: string
): Promise<SiteConfig> {
  const updated: SiteConfig = {
    ...config,
    blocks: config.blocks.filter((b) => b.id !== blockId),
  };
  
  // Save to specific layout instead of home page
  const updatedLayout = await updateLayout(layoutId, { config: updated });
  return updatedLayout.config;
}

/**
 * Get all layouts for the current shop
 */
export async function getAllLayouts(): Promise<WebshopLayout[]> {
  try {
    const response = await axiosInstance.get<WebshopLayout[]>(`webshop/layouts/all`, {
      params: { shopId: DEFAULT_SHOP_ID }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get all layouts:', error);
    return [];
  }
}

/**
 * Get a specific layout by ID
 */
export async function getLayoutById(layoutId: string): Promise<WebshopLayout | null> {
  try {
    const response = await axiosInstance.get<WebshopLayout>(`webshop/layouts/${layoutId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get layout by ID:', error);
    return null;
  }
}

/**
 * Create a new layout for a specific page type
 */
export async function createLayout(
  pageType: string,
  config: SiteConfig,
  pageName?: string
): Promise<WebshopLayout> {
  try {
    const payload: {
      shopId: string;
      pageType: string;
      config: SiteConfig;
      isActive: boolean;
      pageName?: string;
    } = {
      shopId: DEFAULT_SHOP_ID,
      pageType,
      config,
      isActive: true
    };
    
    if (pageName) {
      payload.pageName = pageName;
    }
    
    const response = await axiosInstance.post<WebshopLayout>(`webshop/layouts`, payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create layout:', error);
    throw new Error('Failed to create layout');
  }
}

/**
 * Update an existing layout
 */
export async function updateLayout(
  layoutId: string,
  updates: Partial<Pick<WebshopLayout, 'pageType' | 'pageName' | 'config' | 'isActive'>>
): Promise<WebshopLayout> {
  try {
    const response = await axiosInstance.patch<WebshopLayout>(`webshop/layouts/${layoutId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update layout:', error);
    throw new Error('Failed to update layout');
  }
}

/**
 * Delete a layout
 */
export async function deleteLayout(layoutId: string): Promise<void> {
  try {
    await axiosInstance.delete(`webshop/layouts/${layoutId}`);
  } catch (error) {
    console.error('Failed to delete layout:', error);
    throw new Error('Failed to delete layout');
  }
}

/**
 * Get default site configuration
 */
export function getDefaultSiteConfig(): SiteConfig {
  return {
    id: 'default',
    name: 'My Website',
    blocks: [
      {
        id: 'block-1',
        type: 'hero85',
        props: {
          badgeText: { 
            ru: "НОВАЯ КОЛЛЕКЦИЯ", 
            en: "NEW COLLECTION", 
            uz: "YANGI KOLLEKSIYA" 
          },
          title: { 
            ru: "Стиль, который говорит за вас", 
            en: "Style that speaks for you", 
            uz: "Siz uchun gapiradigan uslub" 
          },
          description: { 
            ru: "Откройте для себя уникальные образы, созданные из премиальных тканей. Каждая деталь продумана для того, чтобы подчеркнуть вашу индивидуальность и уверенность.",
            en: "Discover unique looks crafted from premium fabrics. Every detail is designed to highlight your individuality and confidence.",
            uz: "Premium matolardan yaratilgan noyob obrazlarni kashf qiling. Har bir detal sizning shaxsingiz va ishonchingizni ta'kidlash uchun o'ylangan."
          },
          primaryCtaLabel: { 
            ru: "Смотреть коллекцию", 
            en: "View Collection", 
            uz: "Kolleksiyani ko'rish",
            href: "/catalog"
          },
          secondaryCtaLabel: { 
            ru: "Узнать больше", 
            en: "Learn More", 
            uz: "Batafsil ma'lumot",
            href: "/catalog"
          },
          images: [
            { src: "/random1.jpeg", alt: "Fashion Collection", name: "Fashion Look 1" },
            { src: "/random2.jpeg", alt: "Fashion Collection", name: "Fashion Look 2" },
            { src: "/random3.jpeg", alt: "Fashion Collection", name: "Fashion Look 3" }
          ],
        },
      },
      {
        id: 'block-2',
        type: 'productsList',
        props: {
          title: { 
            ru: "Популярные товары", 
            en: "Popular Items", 
            uz: "Mashhur mahsulotlar" 
          },
          subtitle: { 
            ru: "Самые востребованные модели этого сезона", 
            en: "This season's most sought-after pieces", 
            uz: "Bu mavsumning eng ko'p qidirilgan modellari" 
          },
          itemsToShow: 6,
          itemsPerRow: 3,
          cardVariant: "v1",
          imageAspect: '4:3',
          selectedCategories: [],
          priceSort: 'none',
          customProductIds: [],
          productSelectionMode: 'auto',
          sortBy: undefined,
          products: [
            { id: "p1", title: "Элегантное платье", category: "Одежда", price: 8500, imageSrc: "/random1.jpeg" },
            { id: "p2", title: "Стильная блузка", category: "Одежда", price: 4200, imageSrc: "/random2.jpeg" },
            { id: "p3", title: "Классические брюки", category: "Одежда", price: 6800, imageSrc: "/random3.jpeg" },
            { id: "p4", title: "Модная сумка", category: "Аксессуары", price: 3200, imageSrc: "/random1.jpeg" },
            { id: "p5", title: "Стильные туфли", category: "Обувь", price: 7500, imageSrc: "/random2.jpeg" },
            { id: "p6", title: "Дизайнерский шарф", category: "Аксессуары", price: 2100, imageSrc: "/random3.jpeg" },
          ],
        },
      },
      {
        id: 'block-3',
        type: 'testimonials2',
        props: {
          title: { 
            ru: "Что говорят наши клиенты", 
            en: "What Our Customers Say", 
            uz: "Mijozlarimiz nima deyishadi" 
          },
          subtitle: { 
            ru: "Узнайте, почему тысячи покупателей выбирают нас для создания своего стиля", 
            en: "Discover why thousands of shoppers choose us to create their style", 
            uz: "Minglab xaridorlar nima uchun o'z uslubini yaratish uchun bizni tanlashini bilib oling" 
          },
          reviews: [
            {
              name: { ru: "Анна Петрова", en: "Anna Petrova", uz: "Anna Petrova" },
              text: { 
                ru: "Потрясающее качество и стиль! Каждая покупка превосходит мои ожидания. Рекомендую всем, кто ценит качественную моду.",
                en: "Amazing quality and style! Every purchase exceeds my expectations. I recommend it to anyone who values quality fashion.",
                uz: "Ajoyib sifat va uslub! Har bir xarid mening kutganimdan ham oshib ketadi. Sifatli modani qadrlaydigan har kimga tavsiya qilaman."
              }
            },
            {
              name: { ru: "Мария Иванова", en: "Maria Ivanova", uz: "Mariya Ivanova" },
              text: { 
                ru: "Быстрая доставка, отличное обслуживание и невероятно стильная одежда. Это мой любимый магазин!",
                en: "Fast delivery, excellent service, and incredibly stylish clothes. This is my favorite store!",
                uz: "Tez yetkazib berish, ajoyib xizmat va aql bovar qilmaydigan darajada zamonaviy kiyimlar. Bu mening sevimli do'konim!"
              }
            },
            {
              name: { ru: "Елена Смирнова", en: "Elena Smirnova", uz: "Elena Smirnova" },
              text: { 
                ru: "Здесь я всегда нахожу именно то, что искала. Качество тканей превосходное, а дизайн всегда в тренде.",
                en: "I always find exactly what I'm looking for here. The fabric quality is excellent, and the design is always on trend.",
                uz: "Bu yerda men har doim qidirayotgan narsani topaman. Mato sifati ajoyib, dizayn esa har doim trendda."
              }
            },
            {
              name: { ru: "Ольга Козлова", en: "Olga Kozlova", uz: "Olga Kozlova" },
              text: { 
                ru: "Прекрасный выбор аксессуаров и украшений! Всегда могу найти что-то особенное для завершения образа.",
                en: "Wonderful selection of accessories and jewelry! I can always find something special to complete my look.",
                uz: "Aksessuarlar va zargarlik buyumlarining ajoyib tanlovi! Men har doim o'z obrazimni yakunlash uchun maxsus narsalarni topaman."
              }
            },
            {
              name: { ru: "Дарья Волкова", en: "Darya Volkova", uz: "Darya Volkova" },
              text: { 
                ru: "Отличные цены и постоянные акции. Покупаю здесь уже второй год и всегда довольна покупками.",
                en: "Great prices and constant promotions. I've been shopping here for two years and I'm always satisfied with my purchases.",
                uz: "Ajoyib narxlar va doimiy aksiyalar. Men bu yerda ikkinchi yildan beri xarid qilaman va har doim xaridlarimdan mamnunman."
              }
            },
            {
              name: { ru: "Светлана Морозова", en: "Svetlana Morozova", uz: "Svetlana Morozova" },
              text: { 
                ru: "Удобный сайт, простое оформление заказа и вежливая служба поддержки. Рекомендую друзьям!",
                en: "User-friendly website, easy ordering process, and polite customer support. I recommend it to my friends!",
                uz: "Qulay veb-sayt, oson buyurtma berish jarayoni va xushmuomala mijozlarni qo'llab-quvvatlash xizmati. Do'stlarimga tavsiya qilaman!"
              }
            }
          ],
        },
      },
      {
        id: 'block-4',
        type: 'footerMinimal',
        props: {
          logoText: { 
            ru: "Ваш Стиль", 
            en: "Your Style", 
            uz: "Sizning Uslubingiz" 
          },
          description: { 
            ru: "Создаём незабываемые образы для особенных моментов.", 
            en: "Creating unforgettable looks for special moments.", 
            uz: "Maxsus daqiqalar uchun unutilmas obrazlar yaratamiz." 
          },
          links: [
            { label: "О нас", href: "/about" },
            { label: "Каталог", href: "/catalog" },
            { label: "Контакты", href: "/contacts" },
            { label: "Доставка", href: "/delivery" },
          ],
          social: [
            { label: "Instagram", href: "#", platform: "instagram" },
            { label: "Telegram", href: "#", platform: "telegram" },
            { label: "Facebook", href: "#", platform: "facebook" },
          ],
          copyright: { 
            ru: "© 2025 Ваш Стиль. Все права защищены.", 
            en: "© 2025 Your Style. All rights reserved.", 
            uz: "© 2025 Sizning Uslubingiz. Barcha huquqlar himoyalangan." 
          },
        },
      },
    ],
    theme: {
      preset: 'default',
      colors: {
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(240 10% 3.9%)',
        card: 'hsl(0 0% 100%)',
        cardForeground: 'hsl(240 10% 3.9%)',
        popover: 'hsl(0 0% 100%)',
        popoverForeground: 'hsl(240 10% 3.9%)',
        primary: 'hsl(240 5.9% 10%)',
        primaryForeground: 'hsl(0 0% 98%)',
        secondary: 'hsl(240 4.8% 95.9%)',
        secondaryForeground: 'hsl(240 5.9% 10%)',
        muted: 'hsl(240 4.8% 95.9%)',
        mutedForeground: 'hsl(240 3.8% 46.1%)',
        accent: 'hsl(240 4.8% 95.9%)',
        accentForeground: 'hsl(240 5.9% 10%)',
        destructive: 'hsl(0 84.2% 60.2%)',
        destructiveForeground: 'hsl(0 0% 98%)',
        border: 'hsl(240 5.9% 90%)',
        input: 'hsl(240 5.9% 90%)',
        ring: 'hsl(240 5.9% 10%)',
        chart1: 'hsl(12 76% 61%)',
        chart2: 'hsl(173 58% 39%)',
        chart3: 'hsl(197 37% 24%)',
        chart4: 'hsl(43 74% 66%)',
        chart5: 'hsl(27 87% 67%)',
        sidebar: 'hsl(0 0% 100%)',
        sidebarForeground: 'hsl(240 5.3% 26.1%)',
        sidebarPrimary: 'hsl(240 5.9% 10%)',
        sidebarPrimaryForeground: 'hsl(0 0% 98%)',
        sidebarAccent: 'hsl(240 4.8% 95.9%)',
        sidebarAccentForeground: 'hsl(240 5.9% 10%)',
        sidebarBorder: 'hsl(220 13% 91%)',
        sidebarRing: 'hsl(217.2 32.6% 17.5%)'
      },
      fontSans: 'Inter',
      fontSerif: 'serif',
      fontMono: 'monospace',
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
}

/**
 * Get current shop ID (in a real app this would come from auth context)
 */
export function getCurrentShopId(): string {
  return DEFAULT_SHOP_ID;
}

/**
 * Set shop ID for API calls
 */
export function setShopId(shopId: string): void {
  // In a real app, this would update the context/session
  console.log('Setting shop ID:', shopId);
}

// Products API Types
export interface ProductImage {
  _id: string;
  url: string;
  filename: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  __v: number;
}

export interface ProductCategoriesResponse {
  results: ProductCategory[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ProductVariation {
  _id: string;
  quantity: number;
  articul: string;
  barcode: string;
  images: ProductImage[];
  price: number;
  discountPrice?: number;
  freePrice?: boolean;
  alertQuantity?: number;
  attributes: Record<string, string>;
  attributesConverted: Array<{ k: string; v: string }>;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  image?: ProductImage;
  categories: string[]; // Categories are returned as string IDs, not objects
  shopId: string;
  measurementUnit: string;
  isVariable: boolean;
  variations: ProductVariation[];
  customFields: Record<string, unknown>;
  customFieldsConverted: unknown[];
  createdAt: string;
}

export interface ProductsResponse {
  results: Product[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductAttribute {
  _id: string;
  key: string;
  value: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  query?: string;
  categories?: string[];
  price?: {
    min?: number;
    max?: number;
  };
  // Key is attribute name, value can be a single value or multiple
  attributes?: Record<string, string | string[]>;
}

/**
 * Get website products with filtering and pagination
 */
export async function getWebsiteProducts(params: {
  shopId?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
  productsIds?: string[];
  filters?: ProductFilters;
}): Promise<ProductsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Use provided shopId or default
    queryParams.set('shopId', params.shopId || DEFAULT_SHOP_ID);
    
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    
    // Handle productsIds array
    if (params.productsIds && params.productsIds.length > 0) {
      params.productsIds.forEach(id => queryParams.append('productsIds[]', id));
    }
    
    // Handle filters
    if (params.filters) {
      if (params.filters.query) {
        queryParams.set('filters[query]', params.filters.query);
      }
      if (params.filters.categories && params.filters.categories.length > 0) {
        params.filters.categories.forEach(catId => 
          queryParams.append('filters[categories][]', catId)
        );
      }
      if (params.filters.price) {
        if (params.filters.price.min !== undefined) {
          queryParams.set('filters[price][min]', params.filters.price.min.toString());
        }
        if (params.filters.price.max !== undefined) {
          queryParams.set('filters[price][max]', params.filters.price.max.toString());
        }
      }
      // Handle attribute filters
      if (params.filters.attributes) {
        Object.entries(params.filters.attributes).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(`filters[attributes][${key}][]`, v));
          } else if (value !== undefined && value !== null) {
            queryParams.set(`filters[attributes][${key}]`, String(value));
          }
        });
      }
    }

    const response = await axiosInstance.get<ProductsResponse>(`webshop/products?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get website products:', error);
    throw new Error('Failed to fetch products');
  }
}

/**
 * Get single website product by ID
 */
export async function getWebsiteProduct(productId: string, shopId?: string): Promise<Product> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', shopId || DEFAULT_SHOP_ID);

    const response = await axiosInstance.get<Product>(`webshop/products/${productId}?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get website product:', error);
    throw new Error('Failed to fetch product');
  }
}

/**
 * Get website price range
 */
export async function getWebsitePriceRange(shopId?: string): Promise<PriceRange> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', shopId || DEFAULT_SHOP_ID);

    const response = await axiosInstance.get<PriceRange>(`webshop/price-range?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get price range:', error);
    throw new Error('Failed to fetch price range');
  }
}

/**
 * Get website product attributes
 */
export async function getWebsiteProductAttributes(shopId?: string): Promise<ProductAttribute[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', shopId || DEFAULT_SHOP_ID);

    const response = await axiosInstance.get<ProductAttribute[]>(`webshop/attributes?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get product attributes:', error);
    throw new Error('Failed to fetch product attributes');
  }
}

/**
 * Get website product categories
 */
export async function getWebsiteProductCategories(shopId?: string): Promise<ProductCategoriesResponse> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', shopId || DEFAULT_SHOP_ID);

    const response = await axiosInstance.get<ProductCategoriesResponse>(`webshop/categories?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get product categories:', error);
    // Return empty response structure if categories endpoint doesn't exist yet
    return {
      results: [],
      page: 1,
      limit: 0,
      totalPages: 0,
      totalResults: 0
    };
  }
}

// Webshop Settings API Types
export interface PaymentMethod {
  name: string;
  availableIn: ('cashbox' | 'telegram' | 'website')[];
  removable: boolean;
}

export interface UploadObject {
  _id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface WebshopSettings {
  currency: 'UZS' | 'USD' | 'EUR' | 'KZT' | 'RUB' | 'GBP' | 'CNY' | 'JPY' | 'AED' | 'TRY';
  paymentMethods: PaymentMethod[];
  webshopName: string;
  webshopLogo: UploadObject | null;
}

/**
 * Get webshop settings including currency, payment methods, name, and logo
 */
export async function getWebshopSettings(shopId?: string): Promise<WebshopSettings> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', shopId || DEFAULT_SHOP_ID);

    const response = await axiosInstance.get<WebshopSettings>(`webshop/settings?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get webshop settings:', error);
    // Return default settings on error
    return {
      currency: 'USD',
      paymentMethods: [
        {
          name: 'Cash',
          availableIn: ['cashbox', 'telegram', 'website'],
          removable: false
        },
        {
          name: 'Card',
          availableIn: ['cashbox', 'telegram', 'website'],
          removable: false
        }
      ],
      webshopName: 'My Online Store',
      webshopLogo: null
    };
  }
}

// Global Settings API Types
export interface GlobalSettings {
  theme?: {
    preset?: string;
    colors?: Record<string, string>;
    darkColors?: Record<string, string>;
    fontSans?: string;
    fontSerif?: string;
    fontMono?: string;
    radius?: string;
    supportsDarkMode?: boolean;
    defaultMode?: string;
  };
}

/**
 * Get webshop global settings including theme configurations
 */
export async function getWebshopGlobalSettings(shopId?: string): Promise<GlobalSettings> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', shopId || DEFAULT_SHOP_ID);

    const response = await axiosInstance.get<GlobalSettings>(`webshop/global-settings?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get webshop global settings:', error);
    // Return empty settings on error
    return {};
  }
}

// Orders
export interface PlaceOrderUserData {
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
}

export interface OrderItemPayload {
  // This MUST be the VARIATION id according to backend contract
  productId: string;
  quantity: number;
}

export interface PlaceOrderPayload {
  shopId: string;
  orderItems: OrderItemPayload[];
  userData: PlaceOrderUserData;
}

export interface PlaceOrderResponse {
  success?: boolean;
  message?: string;
  orderId?: string;
  [key: string]: unknown;
}

/**
 * Place an order from the website cart
 */
export async function placeOrder(
  payload: Omit<PlaceOrderPayload, 'shopId'> & { shopId?: string }
): Promise<PlaceOrderResponse> {
  const finalPayload: PlaceOrderPayload = {
    shopId: payload.shopId || DEFAULT_SHOP_ID,
    orderItems: payload.orderItems,
    userData: payload.userData,
  };
  const response = await axiosInstance.post<PlaceOrderResponse>(`webshop/place-order`, finalPayload);
  return response.data;
}

/**
 * Update webshop global settings including theme configurations
 */
export async function updateWebshopGlobalSettings(
  updates: GlobalSettings,
  shopId?: string
): Promise<GlobalSettings> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', shopId || DEFAULT_SHOP_ID);

    const response = await axiosInstance.patch<GlobalSettings>(
      `webshop/global-settings?${queryParams}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update webshop global settings:', error);
    throw new Error('Failed to update global settings');
  }
}

// ======================================
// Webshop Uploads (images/files library)
// ======================================

export interface WebshopImage {
  _id: string;
  fileName: string;
  type: string; // 'image'
  image: {
    _id: string;
    smallUrl: string;
    bigUrl: string;
  };
  createdAt: string;
}

export interface WebshopImagesListResponse {
  results: WebshopImage[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

/**
 * Upload a single image to the webshop uploads library
 * Backend expects multipart/form-data with field name 'image' and body.shopId
 */
export async function uploadWebshopImage(file: File, shopId?: string): Promise<WebshopImage> {
  const form = new FormData();
  form.append('image', file);
  form.append('shopId', shopId || DEFAULT_SHOP_ID);

  const response = await axiosInstance.post<WebshopImage>(`webshop/uploads/image`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Get webshop images list with pagination (for gallery/library browsing)
 */
export async function getWebshopImagesList(params: {
  shopId?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
} = {}): Promise<WebshopImagesListResponse> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('shopId', params.shopId || DEFAULT_SHOP_ID);
    
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);

    const response = await axiosInstance.get<WebshopImagesListResponse>(
      `webshop/uploads/images/list?${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get webshop images list:', error);
    throw new Error('Failed to fetch images list');
  }
}

/**
 * Get specific webshop images by IDs
 * Use this when you have known image IDs and want to fetch them specifically
 */
export async function getWebshopImages(params: { 
  imagesId: string; 
  shopId?: string; 
}): Promise<WebshopImage[]> {
  try {
    const query = new URLSearchParams();
    query.set('shopId', params.shopId || DEFAULT_SHOP_ID);
    query.set('imagesId', params.imagesId);

    const response = await axiosInstance.get<WebshopImage[]>(`webshop/uploads/images?${query}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get webshop images:', error);
    throw new Error('Failed to fetch specific images');
  }
}

// ======================================
// Authentication API
// ======================================

export interface LoginPayload {
  login: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: AdminUser;
}

export interface AdminUser {
  id: string;
  login: string;
  role: string;
  name?: string;
}

/**
 * Admin login - sets authentication cookies
 */
export async function loginAdmin(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const response = await axiosInstance.post<LoginResponse>(`auth/login`, payload);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

/**
 * Check if admin is authenticated and get user data
 */
export async function getMe(): Promise<AdminUser> {
  try {
    const response = await axiosInstance.get<AdminUser>(`auth/getme`);
    return response.data;
  } catch (error) {
    console.error('Failed to get user data:', error);
    throw error;
  }
}

/**
 * Logout admin - clears authentication cookies
 */
export async function logoutAdmin(): Promise<void> {
  try {
    await axiosInstance.post(`auth/logout`);
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
}
