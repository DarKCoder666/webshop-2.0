import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { 
  getWebsiteProducts, 
  getWebsiteProductCategories, 
  ProductsResponse, 
  ProductCategoriesResponse, 
  ProductFilters,
  getWebsitePriceRange,
  getWebsiteProductAttributes,
  PriceRange,
  ProductAttribute
} from '@/api/webshop-api';

// Query Keys
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (params: ProductQueryParams) => [...productQueryKeys.lists(), params] as const,
  categories: () => ['product-categories'] as const,
  priceRange: () => ['product-price-range'] as const,
  attributes: () => ['product-attributes'] as const,
} as const;

// Types for query parameters
export interface ProductQueryParams {
  shopId?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
  productsIds?: string[];
  filters?: ProductFilters;
}

// Products Query Hook
export function useProducts(
  params: ProductQueryParams = {},
  options?: Omit<UseQueryOptions<ProductsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => getWebsiteProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Product Categories Query Hook
export function useProductCategories(
  shopId?: string,
  options?: Omit<UseQueryOptions<ProductCategoriesResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productQueryKeys.categories(), shopId],
    queryFn: () => getWebsiteProductCategories({ shopId }),
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    ...options,
  });
}

// Price Range Query Hook
export function useProductPriceRange(
  shopId?: string,
  options?: Omit<UseQueryOptions<PriceRange, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productQueryKeys.priceRange(), shopId],
    queryFn: () => getWebsitePriceRange(shopId),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// Product Attributes Query Hook
export function useProductAttributes(
  shopId?: string,
  options?: Omit<UseQueryOptions<ProductAttribute[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productQueryKeys.attributes(), shopId],
    queryFn: () => getWebsiteProductAttributes(shopId),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}
