"use client";

import React from "react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
} from "@/components/motion-primitives/morphing-dialog";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Search, X } from "lucide-react";
import { BlockInstance } from "@/lib/builder-types";
import { cn } from "@/lib/utils";
import { 
  getWebsiteProducts, 
  getWebsiteProductCategories,
  Product,
  ProductCategory
} from "@/api/webshop-api";
import { formatPriceWithSettings } from "@/lib/currency-utils";
import { useWebshopSettings } from "@/components/providers/webshop-settings-provider";
import ProductCard, { ProductCardData } from "@/components/sections/product-list/product-card";
import { ProductCardV2, ProductCardV3, ProductCardV4 } from "@/components/sections/product-list/product-card-variants";
import { useQueryClient } from "@tanstack/react-query";


type ProductsSettingsDialogProps = {
  block: BlockInstance;
  onSave: (props: Record<string, unknown>) => void;
};

export function ProductsSettingsDialog({ block, onSave }: ProductsSettingsDialogProps) {
  const initial = (block.props || {}) as any;
  const queryClient = useQueryClient();
  const { settings } = useWebshopSettings();
  
  // Display settings
  const [itemsToShow, setItemsToShow] = React.useState<number>(initial.itemsToShow ?? 6);
  const [itemsPerRow, setItemsPerRow] = React.useState<number>(initial.itemsPerRow ?? 3);
  const [cardVariant, setCardVariant] = React.useState<string>(initial.cardVariant ?? "v1");
  const [imageAspect, setImageAspect] = React.useState<string>(initial.imageAspect ?? '4:3');
  
  // Product selection settings
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(initial.selectedCategories ?? []);
  const [customProductIds, setCustomProductIds] = React.useState<string[]>(initial.customProductIds ?? []);
  // Determine initial mode based on existing data
  const determineInitialMode = (): 'auto' | 'custom' => {
    if (initial.productSelectionMode) {
      return initial.productSelectionMode;
    }
    // If custom product IDs exist, default to custom mode
    if (initial.customProductIds && initial.customProductIds.length > 0) {
      return 'custom';
    }
    // Otherwise default to auto
    return 'auto';
  };
  const [productSelectionMode, setProductSelectionMode] = React.useState<'auto' | 'custom'>(determineInitialMode());
  
  // Data loading
  const [categories, setCategories] = React.useState<ProductCategory[]>([]);
  const [availableProducts, setAvailableProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [selectedProductsLoading, setSelectedProductsLoading] = React.useState(false);
  
  // Sample product data for card variant previews
  const sampleProduct: ProductCardData = {
    id: 'sample-1',
    title: 'Товар',
    category: 'Категория',
    price: 1500,
    imageSrc: null,
    favorite: false
  };
  
  // Load initial data
  React.useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const categoriesResponse = await getWebsiteProductCategories();
      setCategories(categoriesResponse.results);
      
      // Load products for custom selection
      if (productSelectionMode === 'custom') {
        await loadProducts();
        // Load selected products data if any exist
        if (customProductIds.length > 0) {
          await loadSelectedProductsData();
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (query?: string) => {
    setLoading(true);
    try {
      const productsData = await getWebsiteProducts({
        limit: 100, // Load more products for better search experience
        filters: {
          query: query || undefined,
        }
      });
      setAvailableProducts(productsData.results);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedProductsData = async () => {
    if (customProductIds.length === 0) return;
    
    setSelectedProductsLoading(true);
    try {
      const productsData = await getWebsiteProducts({
        productsIds: customProductIds,
        limit: customProductIds.length,
      });
      // Update available products to include selected ones if not already present
      setAvailableProducts(prev => {
        const existingIds = prev.map(p => p._id);
        const newProducts = productsData.results.filter(p => !existingIds.includes(p._id));
        return [...prev, ...newProducts];
      });
    } catch (error) {
      console.error('Failed to load selected products:', error);
    } finally {
      setSelectedProductsLoading(false);
    }
  };

  // Search products when query changes
  React.useEffect(() => {
    if (productSelectionMode === 'custom') {
      const timeoutId = setTimeout(() => {
        loadProducts(searchQuery.trim() || undefined);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, productSelectionMode]);

  // Load selected products data when custom product IDs change
  React.useEffect(() => {
    if (productSelectionMode === 'custom' && customProductIds.length > 0) {
      loadSelectedProductsData();
    }
  }, [customProductIds, productSelectionMode]);

  // Update settings locally and refetch data
  const updateSettings = (newSettings: Partial<typeof initial>) => {
    // Update local state
    Object.entries(newSettings).forEach(([key, value]) => {
      switch (key) {
        case 'itemsToShow':
          setItemsToShow(value as number);
          break;
        case 'itemsPerRow':
          setItemsPerRow(value as number);
          break;
        case 'cardVariant':
          setCardVariant(value as string);
          break;
        case 'imageAspect':
          setImageAspect(value as string);
          break;
        case 'selectedCategories':
          setSelectedCategories(value as string[]);
          break;

        case 'customProductIds':
          setCustomProductIds(value as string[]);
          break;
        case 'productSelectionMode':
          setProductSelectionMode(value as 'auto' | 'custom');
          break;
      }
    });
    
    // Invalidate queries to refetch data with new filters
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleSave = () => {
    onSave({ 
      itemsToShow: Math.max(1, Math.floor(Number(itemsToShow) || 1)),
      itemsPerRow: Math.min(5, Math.max(2, Math.floor(Number(itemsPerRow) || 3))),
      cardVariant,
      imageAspect,
      selectedCategories,
      customProductIds,
      productSelectionMode,
    });
    // Close dialog after local update
    setTimeout(() => {
      const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement | null;
      closeButton?.click();
    }, 50);
  };

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-card-foreground hover:bg-muted">
        <ShoppingBag className="h-4 w-4" />
      </MorphingDialogTrigger>

              <MorphingDialogContainer className="fixed inset-0 z-[999999] bg-background/95 backdrop-blur-sm flex items-center justify-center">
        <MorphingDialogContent className="bg-background w-[80vw] h-[80vh] rounded-xl border border-border shadow-2xl overflow-y-auto z-[999999] p-0 relative">
          <MorphingDialogClose className="absolute top-4 right-4 z-[999999] bg-background border border-border rounded-full p-2 hover:bg-muted transition-colors shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </MorphingDialogClose>
          <div className="px-6 py-8 space-y-8 pt-14">
            <MorphingDialogTitle className="text-3xl font-bold text-center mb-8">Настройки товаров</MorphingDialogTitle>

            {/* Product Selection Mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Выбор товаров</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setProductSelectionMode('auto');
                    // Reset custom mode values when switching to auto
                    setCustomProductIds([]);
                    setSearchQuery('');
                    updateSettings({ 
                      productSelectionMode: 'auto',
                      customProductIds: []
                    });
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    productSelectionMode === 'auto' ? "border-primary bg-primary/10" : "border-border"
                  )}
                >
                  Автоматически (по фильтрам)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProductSelectionMode('custom');
                    // Reset auto mode values when switching to custom
                    setSelectedCategories([]);
                    updateSettings({ 
                      productSelectionMode: 'custom',
                      selectedCategories: []
                    });
                    // Load products for selection
                    loadProducts();
                  }}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    productSelectionMode === 'custom' ? "border-primary bg-primary/10" : "border-border"
                  )}
                >
                  Выбор вручную
                </button>
              </div>
            </div>

            {/* Auto Mode Settings */}
            {productSelectionMode === 'auto' && (
              <>
                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Категории</label>
                  {loading ? (
                    <div className="text-sm text-muted-foreground">Загрузка категорий...</div>
                  ) : categories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {categories.map((category) => (
                        <label key={category._id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={(e) => {
                              const newCategories = e.target.checked
                                ? [...selectedCategories, category._id]
                                : selectedCategories.filter(id => id !== category._id);
                              setSelectedCategories(newCategories);
                              updateSettings({ selectedCategories: newCategories });
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Категории не найдены</div>
                  )}
                  {selectedCategories.length === 0 && (
                    <p className="text-xs text-muted-foreground">Не выбрано категорий = все категории</p>
                  )}
                </div>


              </>
            )}

            {/* Custom Mode Settings */}
            {productSelectionMode === 'custom' && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Поиск и выбор товаров</label>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Available Products List */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    Доступные товары {loading && <span className="text-muted-foreground">(загрузка...)</span>}
                  </div>
                  <div className="border border-border rounded-lg max-h-80 overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                        <div className="text-sm text-muted-foreground">Загрузка товаров...</div>
                      </div>
                    ) : availableProducts.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {availableProducts.map((product) => {
                          const firstVariation = product.variations?.[0];
                          const price = firstVariation?.discountPrice || firstVariation?.price || 0;
                          const variationWithImage = (product.variations || []).find(v => Array.isArray(v.images) && v.images.length > 0);
                          const imageSrc = product.image?.url || variationWithImage?.images?.[0]?.url;
                          const isSelected = customProductIds.includes(product._id);
                          
                          return (
                            <label 
                              key={product._id} 
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                                isSelected ? "bg-primary/5 border border-primary/20" : "hover:bg-muted"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const newIds = e.target.checked
                                    ? [...customProductIds, product._id]
                                    : customProductIds.filter(id => id !== product._id);
                                  setCustomProductIds(newIds);
                                  updateSettings({ customProductIds: newIds });
                                }}
                                className="rounded border-border"
                              />
                              
                              {/* Product Image */}
                              <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                {imageSrc ? (
                                  <img 
                                    src={imageSrc} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                    <div className="w-5 h-5 rounded bg-muted-foreground/20"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{product.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {price > 0 && formatPriceWithSettings(price, settings)}
                                  {product.categories.length > 0 && price > 0 && ' • '}
                                  {product.categories.length > 0 && (
                                    categories.find(cat => cat._id === product.categories[0])?.name || 'Категория'
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <div className="text-sm">
                          {searchQuery ? 'Товары не найдены' : 'Товары не загружены'}
                        </div>
                        {searchQuery && (
                          <div className="text-xs mt-1">Попробуйте изменить поисковый запрос</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selected Products */}
                {customProductIds.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Выбранные товары ({customProductIds.length})</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {customProductIds.map((productId) => {
                        const product = availableProducts.find(p => p._id === productId);
                        const firstVariation = product?.variations?.[0];
                        const price = firstVariation?.discountPrice || firstVariation?.price || 0;
                        const variationWithImage = (product?.variations || []).find(v => Array.isArray(v.images) && v.images.length > 0);
                        const imageSrc = product?.image?.url || variationWithImage?.images?.[0]?.url;
                        const isLoading = selectedProductsLoading && !product;
                        
                        return (
                          <div
                            key={productId}
                            className="relative group rounded-lg border border-border bg-card p-3 hover:shadow-md transition-all"
                          >
                            {isLoading && (
                              <div className="absolute inset-0 bg-card/80 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              {/* Product Image */}
                              <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                                {isLoading ? (
                                  <div className="w-full h-full bg-muted animate-pulse"></div>
                                ) : imageSrc ? (
                                  <img 
                                    src={imageSrc} 
                                    alt={product?.name || 'Product'} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                    <div className="w-6 h-6 rounded bg-muted-foreground/20"></div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {isLoading ? (
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                                  ) : (
                                    product?.name || productId
                                  )}
                                </div>
                                {isLoading ? (
                                  <div className="h-3 bg-muted rounded animate-pulse w-1/2 mt-1"></div>
                                ) : (
                                  <>
                                    {price > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        {formatPriceWithSettings(price, settings)}
                                      </div>
                                    )}
                                    {product?.categories && product.categories.length > 0 && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {categories.find(cat => cat._id === product.categories[0])?.name || 'Категория'}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  const newIds = customProductIds.filter(id => id !== productId);
                                  setCustomProductIds(newIds);
                                  updateSettings({ customProductIds: newIds });
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive"
                                title="Удалить товар"
                                disabled={isLoading}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Display Settings */}
            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="text-sm font-medium">Настройки отображения</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Количество товаров</label>
                  <Input
                    type="number"
                    min={1}
                    value={itemsToShow}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setItemsToShow(value);
                      updateSettings({ itemsToShow: value });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium">Товаров в ряду</label>
                  <Input
                    type="number"
                    min={2}
                    max={5}
                    value={itemsPerRow}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setItemsPerRow(value);
                      updateSettings({ itemsPerRow: value });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xl font-medium">Вариант карточки</label>
                <div className="grid grid-cols-2 gap-8">
                  {(["v1", "v2", "v3", "v4"] as const).map(v => {
                    const renderPreview = () => {
                      const previewProps = { 
                        product: sampleProduct, 
                        className: "pointer-events-none w-full",
                        imageAspect: imageAspect as any
                      };
                      
                      switch (v) {
                        case "v1":
                          return <ProductCard {...previewProps} />;
                        case "v2":
                          return <ProductCardV2 {...previewProps} />;
                        case "v3":
                          return <ProductCardV3 {...previewProps} />;
                        case "v4":
                          return <ProductCardV4 {...previewProps} />;
                        default:
                          return null;
                      }
                    };
                    
                    return (
                      <div
                        key={v}
                        onClick={() => {
                          setCardVariant(v);
                          updateSettings({ cardVariant: v });
                        }}
                        className={cn(
                          "rounded-xl border-2 p-4 hover:bg-muted/30 transition-all duration-200 group cursor-pointer", 
                          cardVariant === v ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/50"
                        )}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setCardVariant(v);
                            updateSettings({ cardVariant: v });
                          }
                        }}
                      >
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-center opacity-70 group-hover:opacity-100 transition-opacity">
                            Вариант {v.toUpperCase()}
                          </div>
                          <div className="max-w-[280px] mx-auto">
                            {renderPreview()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xl font-medium">Соотношение изображений</label>
                <div className="grid grid-cols-5 gap-4">
                  {(["1:1", "3:4", "4:3", "9:16", "16:9"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setImageAspect(r);
                        updateSettings({ imageAspect: r });
                      }}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-xl border-2 p-4 hover:bg-muted/30 transition-all duration-200 group",
                        imageAspect === r ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/50"
                      )}
                      aria-label={`Установить соотношение ${r}`}
                    >
                      <div
                        className={cn(
                          "w-full max-w-[80px] overflow-hidden rounded-lg bg-gradient-to-br from-muted via-muted/80 to-muted shadow-inner",
                          r === "1:1"
                            ? "aspect-square"
                            : r === "3:4"
                            ? "aspect-[3/4]"
                            : r === "4:3"
                            ? "aspect-[4/3]"
                            : r === "9:16"
                            ? "aspect-[9/16]"
                            : "aspect-[16/9]"
                        )}
                      >
                        <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
                      </div>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{r}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8 border-t border-border">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-primary px-8 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 min-w-[200px]"
                disabled={loading}
              >
                {loading ? 'Загрузка...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}


