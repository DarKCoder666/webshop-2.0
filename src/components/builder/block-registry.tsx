"use client";

import React from "react";
import HeroSection from "@/components/sections/hero/hero-section";
import Hero37, { Hero37Props } from "@/components/sections/hero/hero-37";
import Hero210, { Hero210Props } from "@/components/sections/hero/hero-210";
import Hero85, { Hero85Props } from "@/components/sections/hero/hero-85";
import Testimonials, { TestimonialsProps } from "@/components/sections/testimonials/testimonials";
import Testimonials2, { Testimonials2Props } from "@/components/sections/testimonials/testimonials-2";
import Testimonials3, { Testimonials3Props } from "@/components/sections/testimonials/testimonials-3";
import { Navigation, NavigationProps } from "@/components/sections/header/navigation";
import ProductsList, { ProductsListProps } from "@/components/sections/product-list/products-list";
import ProductGallery from "../sections/product/product-gallery";
import ProductDetails from "../sections/product/product-details";
import ProductOverview from "../sections/product/product-overview";
import FooterMinimal, { FooterMinimalProps } from "@/components/sections/footer/footer-minimal";
import FooterColumns, { FooterColumnsProps } from "@/components/sections/footer/footer-columns";
import FooterHalfscreen, { FooterHalfscreenProps } from "@/components/sections/footer/footer-halfscreen";
import { BlockSchema, BlockType, BlockInstance } from "@/lib/builder-types";
import { ProductGalleryProps, ProductDetailsProps } from "@/lib/product-types";

export const BLOCK_SCHEMAS: BlockSchema[] = [
  {
    type: "testimonials",
    label: "Testimonials",
    editableFields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "ctaLabel", label: "CTA Label", type: "text" },
      // Reviews are edited via the dialog as a dynamic list
    ],
    defaultProps: {
      title: { ru: "Наши довольные клиенты", en: "Meet our happy clients", uz: "Baxtli mijozlarimiz bilan tanishing" },
      subtitle: { ru: "Все наши 1000+ клиентов довольны", en: "All of our 1000+ clients are happy", uz: "1000+ mijozlarimiz mamnun" },
      ctaLabel: { ru: "Начать бесплатно", en: "Get started for free", uz: "Bepul boshlash" },
      reviews: [],
    },
  },
  {
    type: "productsList",
    label: "Products List",
    editableFields: [],
    defaultProps: {
      title: { ru: "Хиты продаж", en: "Best Sellers", uz: "Eng ko'p sotilganlar" },
      subtitle: { ru: "Откройте любимые товары наших клиентов", en: "Discover our most-loved items", uz: "Eng sevimli mahsulotlarni kashf qiling" },
      itemsToShow: 6,
      itemsPerRow: 3,
      cardVariant: "v1",
      imageAspect: '4:3',
      // API-based properties
      selectedCategories: [],
      priceSort: 'none',
      customProductIds: [],
      productSelectionMode: 'auto',
      sortBy: undefined,
      // Fallback products for when API is not available
      products: [
        { id: "p1", title: "Red Hat", category: "Clothing", price: 28, imageSrc: "/random1.jpeg" },
        { id: "p2", title: "Blue Shirt", category: "Clothing", price: 42, imageSrc: "/random2.jpeg" },
        { id: "p3", title: "Sneakers", category: "Footwear", price: 89, imageSrc: "/random3.jpeg" },
        { id: "p4", title: "Socks Pack", category: "Accessories", price: 12, imageSrc: "/random1.jpeg" },
        { id: "p5", title: "Backpack", category: "Accessories", price: 59, imageSrc: "/random2.jpeg" },
        { id: "p6", title: "Black Jeans", category: "Clothing", price: 65, imageSrc: "/random3.jpeg" },
      ],
    },
  },
  {
    type: "testimonials3",
    label: "Testimonials 3 (carousel controls)",
    editableFields: [],
    defaultProps: {
      title: { ru: "Почему нас любят клиенты", en: "Why Clients Love Us", uz: "Nega mijozlar bizni yaxshi ko'radi" },
      subtitle: { ru: "Узнайте, как клиенты используют наши продукты для роста бизнеса", en: "Discover how our customers are using our products to build their businesses", uz: "Mijozlarimiz mahsulotlarimizdan bizneslarini rivojlantirishda qanday foydalanishadi" },
      reviews: [],
    },
  },
  {
    type: "testimonials2",
    label: "Testimonials 2 (grid)",
    editableFields: [],
    defaultProps: {
      title: { ru: "Что говорят наши клиенты", en: "What our clients say", uz: "Mijozlarimiz nima deyishadi" },
      subtitle: { ru: "Узнайте, как клиенты используют наши продукты для роста бизнеса", en: "Discover how our customers are using our products to build their businesses", uz: "Mijozlarimiz mahsulotlarimizdan bizneslarini rivojlantirishda qanday foydalanishadi" },
      reviews: [],
    },
  },
  {
    type: "heroSection",
    label: "Hero Section",
    editableFields: [
      { key: "title", label: "Title", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text" },
      { key: "primaryCtaHref", label: "Primary CTA Href", type: "url" },
      { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text" },
      { key: "secondaryCtaHref", label: "Secondary CTA Href", type: "url" },
      { key: "imageSrc", label: "Image URL", type: "url" },
    ],
    defaultProps: {
      title: { ru: "Подчеркните свой стиль", en: "Highlight your style", uz: "Uslubingizni ta'kidlang" },
      subtitle: { ru: "Новая коллекция уже здесь", en: "New collection is here", uz: "Yangi kolleksiya shu yerda" },
      description: { 
        ru: "Откройте для себя продуманные образы, премиальные ткани и современные силуэты, которые превращают комплименты в уверенность. Бесплатная доставка от 7 500 ₽ и простой возврат в течение 30 дней.",
        en: "Discover thoughtful looks, premium fabrics, and modern silhouettes that turn compliments into confidence. Free shipping from 7,500₽ and easy 30-day returns.",
        uz: "O‘ylangan obrazlar, yuqori sifatli matolar va zamonaviy siluetlarni kashf qiling. 7 500 ₽ dan bepul yetkazib berish va 30 kun ichida oson qaytarish."
      },
      primaryCta: { ru: "Перейти к коллекции", en: "Shop the collection", uz: "Kolleksiyani ko‘rish", href: "#" },
      secondaryCta: { ru: "Смотреть лукбук", en: "View lookbook", uz: "Lukbukni ko‘rish", href: "#" },
      images: [
        { src: "/random1.jpeg", alt: "Featured outfits from our latest drop" },
        { src: "/random2.jpeg", alt: "Featured outfits from our latest drop" },
        { src: "/random3.jpeg", alt: "Featured outfits from our latest drop" },
        { src: "/random1.jpeg", alt: "Featured outfits from our latest drop" }
      ],
      autoplay: true,
      autoplayIntervalMs: 3000,
    },
  },
  {
    type: "hero37",
    label: "Hero 37",
    editableFields: [
      { key: "badge", label: "Badge", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text" },
      { key: "primaryCtaHref", label: "Primary CTA Href", type: "url" },
      { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text" },
      { key: "secondaryCtaHref", label: "Secondary CTA Href", type: "url" },
    ],
    defaultProps: {
      badge: { ru: "НОВИНКА", en: "NEW RELEASE", uz: "YANGI" },
      title: { ru: "Добро пожаловать", en: "Welcome", uz: "Xush kelibsiz" },
      description: { 
        ru: "Откройте для себя лучшие решения для вашего магазина.",
        en: "Discover the best solutions for your shop.",
        uz: "Do‘koningiz uchun eng yaxshi yechimlarni kashf qiling."
      },
      primaryCta: { ru: "Купить сейчас", en: "Buy now", uz: "Hozir sotib oling", href: "#" },
      secondaryCta: { ru: "Узнать больше", en: "Learn more", uz: "Batafsil", href: "#" },
      images: [
        {
          src: "/random1.jpeg",
          alt: "Portrait of Joanna Doe in urban setting",
          name: "Joanna Doe",
        },
        {
          src: "/random2.jpeg",
          alt: "Portrait of Joan Doe in natural lighting",
          name: "Joan Doe",
        },
        {
          src: "/random3.jpeg",
          alt: "Portrait of Sarah Chen in studio setting",
          name: "Sarah Chen",
        },
      ],
    },
  },
  {
    type: "hero210",
    label: "Hero 210 (carousel)",
    editableFields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonLabel", label: "Button Label", type: "text" },
      { key: "imageSrc", label: "Image URL", type: "url" },
    ],
    defaultProps: {
      title: { ru: "Ускорьте карьерный рост", en: "Boost your professional career", uz: "Karyerangizni tezlashtiring" },
      description: { 
        ru: "Современные инструменты и простые решения для уверенного старта.",
        en: "Modern tools and simple solutions for a confident start.",
        uz: "Ishonchli start uchun zamonaviy vositalar va sodda yechimlar."
      },
      buttonLabel: { ru: "Начать", en: "Get started", uz: "Boshlash" },
      images: [
        {
          src: "/random1.jpeg",
          alt: "Portrait of Joanna Doe in urban setting",
          name: "Joanna Doe",
        },
        {
          src: "/random2.jpeg",
          alt: "Portrait of Joan Doe in natural lighting",
          name: "Joan Doe",
        },
        {
          src: "/random3.jpeg",
          alt: "Portrait of Sarah Chen in studio setting",
          name: "Sarah Chen",
        },
      ],
    },
  },
  {
    type: "hero85",
    label: "Hero 85 (auto-scroll)",
    editableFields: [
      { key: "badgeText", label: "Badge", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text" },
      { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text" },
      { key: "imageSrc", label: "Image URL", type: "url" },
    ],
    defaultProps: {
      badgeText: { ru: "На базе ИИ", en: "AI-powered", uz: "AI asosida" },
      title: { 
        ru: "Новый уровень взаимодействия с клиентами",
        en: "Reimagining client collaboration",
        uz: "Mijozlar bilan hamkorlikning yangi darajasi"
      },
      description: { 
        ru: "Поднимите свой сервисный бизнес с настраиваемыми порталами и умной автоматизацией.",
        en: "Elevate your service business with customizable portals and smart automation.",
        uz: "Moslashtiriladigan portallar va aqlli avtomatlashtirish bilan xizmat biznesingizni yuksaltiring."
      },
      primaryCtaLabel: { ru: "Начать бесплатно", en: "Start for free", uz: "Bepul boshlash" },
      secondaryCtaLabel: { ru: "Запланировать демо", en: "Schedule a demo", uz: "Demo so‘rash" },
      images: [
        {
          src: "/random1.jpeg",
          alt: "Portrait of Joanna Doe in urban setting",
          name: "Joanna Doe",
        },
        {
          src: "/random2.jpeg",
          alt: "Portrait of Joan Doe in natural lighting",
          name: "Joan Doe",
        },
        {
          src: "/random3.jpeg",
          alt: "Portrait of Sarah Chen in studio setting",
          name: "Sarah Chen",
        },
      ],
    },
  },
  {
    type: "navigation",
    label: "Navigation",
    editableFields: [
      { key: "logoText", label: "Logo Text", type: "text" },
      { key: "logoImageSrc", label: "Logo Image URL", type: "url" },
      { key: "logoPosition", label: "Logo Position", type: "text" },
      { key: "cartCount", label: "Cart Count", type: "text" },
    ],
    defaultProps: {
      logoText: { text: "Your Logo" },
      logoImageSrc: "/billy.svg",
      logoPosition: "left",
      cartCount: 0,
      showCartIcon: true,
      menuItems: [],
    },
  },
  {
    type: "productGallery",
    label: "Product Gallery",
    editableFields: [],
    defaultProps: {
      product: {
        _id: "sample-product",
        name: "Sample Product",
        description: "This is a sample product for the gallery display",
        image: {
          _id: "sample-image",
          fileName: "sample.jpg",
          type: "image",
          image: {
            _id: "sample-image-data",
            smallUrl: "/random1.jpeg",
            bigUrl: "/random1.jpeg"
          },
          createdAt: new Date().toISOString(),
          __v: 0
        },
        variations: [
          {
            quantity: 10,
            images: [],
            freePrice: false,
            alertQuantity: 0,
            _id: "sample-variation",
            articul: "SAMPLE-001",
            barcode: "",
            price: 250000,
            attributes: {
              "Цвет": "синий",
              "Размер": "M"
            }
          }
        ],
        categories: [],
        customFields: {},
        isVectorized: false,
        vectorizeStatus: "pending",
        shopId: "sample-shop",
        measurementUnit: "pc",
        isVariable: false,
        createdAt: new Date().toISOString(),
        __v: 0
      }
    },
  },
  {
    type: "productDetails",
    label: "Product Details",
    editableFields: [],
    defaultProps: {
      product: {
        _id: "sample-product",
        name: "Sample Product",
        description: "This is a sample product for the details display",
        image: {
          _id: "sample-image",
          fileName: "sample.jpg",
          type: "image",
          image: {
            _id: "sample-image-data",
            smallUrl: "/random1.jpeg",
            bigUrl: "/random1.jpeg"
          },
          createdAt: new Date().toISOString(),
          __v: 0
        },
        variations: [
          {
            quantity: 10,
            images: [],
            freePrice: false,
            alertQuantity: 0,
            _id: "sample-variation",
            articul: "SAMPLE-001",
            barcode: "",
            price: 250000,
            attributes: {
              "Цвет": "синий",
              "Размер": "M"
            }
          }
        ],
        categories: [],
        customFields: {},
        isVectorized: false,
        vectorizeStatus: "pending",
        shopId: "sample-shop",
        measurementUnit: "pc",
        isVariable: false,
        createdAt: new Date().toISOString(),
        __v: 0
      }
    },
  },
  {
    type: "productOverview",
    label: "Product Overview",
    editableFields: [],
    defaultProps: {
      product: {
        _id: "sample-product",
        name: "Sample Product",
        description: "Classic tee with modern fit.",
        image: {
          _id: "sample-image",
          fileName: "sample.jpg",
          type: "image",
          image: {
            _id: "sample-image-data",
            smallUrl: "/random1.jpeg",
            bigUrl: "/random1.jpeg"
          },
          createdAt: new Date().toISOString(),
          __v: 0
        },
        variations: [
          {
            quantity: 10,
            images: [],
            freePrice: false,
            alertQuantity: 0,
            _id: "sample-variation",
            articul: "TEE-001",
            barcode: "",
            price: 199900,
            attributes: {
              "Цвет": "чёрный",
              "Размер": "M"
            }
          },
          {
            quantity: 5,
            images: [],
            freePrice: false,
            alertQuantity: 0,
            _id: "sample-variation-2",
            articul: "TEE-002",
            barcode: "",
            price: 199900,
            attributes: {
              "Цвет": "белый",
              "Размер": "L"
            }
          }
        ],
        categories: [],
        customFields: {},
        isVectorized: false,
        vectorizeStatus: "pending",
        shopId: "sample-shop",
        measurementUnit: "pc",
        isVariable: true,
        createdAt: new Date().toISOString(),
        __v: 0
      }
    },
  },
  {
    type: "footerMinimal",
    label: "Footer - Minimal",
    editableFields: [
      { key: "logoText", label: "Logo Text", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "copyright", label: "Copyright", type: "text" },
    ],
    defaultProps: {
      logoText: { text: "Ваш бренд" },
      description: { text: "Мы создаём приятные впечатления." },
      links: [
        { label: "О нас", href: "#" },
        { label: "Блог", href: "#" },
        { label: "Карьера", href: "#" },
        { label: "Контакты", href: "#" },
      ],
      social: [
        { label: "Twitter", href: "#", platform: "twitter" },
        { label: "Instagram", href: "#", platform: "instagram" },
        { label: "LinkedIn", href: "#", platform: "linkedin" },
      ],
      copyright: { text: "© 2025 Ваш бренд. Все права защищены." },
    },
  },
  {
    type: "footerColumns",
    label: "Footer - Columns",
    editableFields: [
      { key: "logoText", label: "Logo Text", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "bottomNote", label: "Bottom Note", type: "text" },
    ],
    defaultProps: {
      logoText: { text: "Ваш бренд" },
      description: { text: "Продуманный интернет-магазин." },
      columns: [
        { title: { text: "Продукт" }, links: [{ label: "Возможности", href: "#" }, { label: "Цены", href: "#" }, { label: "Интеграции", href: "#" }] },
        { title: { text: "Компания" }, links: [{ label: "О нас", href: "#" }, { label: "Карьера", href: "#" }, { label: "Пресса", href: "#" }] },
        { title: { text: "Ресурсы" }, links: [{ label: "Блог", href: "#" }, { label: "Центр помощи", href: "#" }, { label: "Контакты", href: "#" }] },
        { title: { text: "Правовая информация" }, links: [{ label: "Конфиденциальность", href: "#" }, { label: "Условия", href: "#" }, { label: "Файлы cookie", href: "#" }] },
      ],
      bottomNote: { text: "© 2025 Ваш бренд" },
    },
  },
  {
    type: "footerHalfscreen",
    label: "Footer - Halfscreen (Creative)",
    editableFields: [
      { key: "badge", label: "Badge", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "primaryCtaLabel", label: "Primary CTA", type: "text" },
      { key: "secondaryCtaLabel", label: "Secondary CTA", type: "text" },
      { key: "imageSrc", label: "Image URL", type: "url" },
      { key: "copyright", label: "Copyright", type: "text" },
    ],
    defaultProps: {
      badge: { text: "New" },
      title: { text: "Make a bold closing statement" },
      description: { text: "Convert visitors with a dramatic, editorial-style footer." },
      primaryCta: { label: { text: "Get Started" }, href: "#" },
      secondaryCta: { label: { text: "Talk to Sales" }, href: "#" },
      imageSrc: "/random1.jpeg",
      imageAlt: "Decorative",
      overlayGradient: true,
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Impressum", href: "#" },
      ],
      copyright: { text: "© 2025 Your Brand" },
    },
  },
];

export function getSchema(type: BlockType): BlockSchema | undefined {
  return BLOCK_SCHEMAS.find((s) => s.type === type);
}

type HeroSectionProps = React.ComponentProps<typeof HeroSection>;

export function RenderBlock({ block }: { block: BlockInstance }) {
  switch (block.type) {
    case "heroSection":
      return <HeroSection {...(block.props as HeroSectionProps)} blockId={block.id} />;
    case "hero37":
      return <Hero37 {...(block.props as Hero37Props)} blockId={block.id} />;
    case "hero210":
      return <Hero210 {...(block.props as Hero210Props)} blockId={block.id} />;
    case "hero85":
      return <Hero85 {...(block.props as Hero85Props)} blockId={block.id} />;
    case "testimonials":
      return <Testimonials {...(block.props as TestimonialsProps)} blockId={block.id} />;
    case "testimonials2":
      return <Testimonials2 {...(block.props as Testimonials2Props)} blockId={block.id} />;
    case "testimonials3":
      return <Testimonials3 {...(block.props as Testimonials3Props)} blockId={block.id} />;
    case "navigation":
      return <Navigation {...(block.props as NavigationProps)} blockId={block.id} />;
    case "productsList":
      return <ProductsList {...(block.props as ProductsListProps)} blockId={block.id} />;
    case "productGallery":
      return <ProductGallery {...(block.props as unknown as ProductGalleryProps)} blockId={block.id} />;
    case "productDetails":
      return <ProductDetails {...(block.props as unknown as ProductDetailsProps)} blockId={block.id} />;
    case "productOverview":
      return <ProductOverview {...(block.props as React.ComponentProps<typeof ProductOverview>)} />;
    case "footerMinimal":
      return <FooterMinimal {...(block.props as FooterMinimalProps)} blockId={block.id} />;
    case "footerColumns":
      return <FooterColumns {...(block.props as FooterColumnsProps)} blockId={block.id} />;
    case "footerHalfscreen":
      return <FooterHalfscreen {...(block.props as FooterHalfscreenProps)} blockId={block.id} />;
    default:
      return null;
  }
}


