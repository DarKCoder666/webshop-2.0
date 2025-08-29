export interface ProductImage {
  _id: string;
  createdAt: string;
  filename: string;
  image: {
    _id: string;
    bigUrl: string;
    smallUrl: string;
  }
}

export interface ProductFile {
  _id: string;
  fileName: string;
  type: string;
  image: {
    _id: string;
    smallUrl: string;
    bigUrl: string;
  };
  createdAt: string;
  __v: number;
}

export interface AttributeConverted {
  k: string;
  v: string;
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
  attributesConverted: AttributeConverted[];
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  image?: ProductImage;
  categories: string[];
  shopId: string;
  measurementUnit: string;
  isVariable: boolean;
  variations: ProductVariation[];
  customFields: Record<string, unknown>;
  customFieldsConverted: unknown[];
  createdAt: string;
}

export interface ProductDetailsProps {
  product: Product;
  blockId?: string;
}

export interface ProductGalleryProps {
  product: Product;
  blockId?: string;
}
