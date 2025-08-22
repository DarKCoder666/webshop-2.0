"use client";

import React from "react";
import HeroSection from "@/components/hero-section";
import Hero37, { Hero37Props } from "@/components/hero-37";
import Hero210, { Hero210Props } from "@/components/hero-210";
import Hero85, { Hero85Props } from "@/components/hero-85";
import Testimonials, { TestimonialsProps } from "@/components/testimonials";
import Testimonials2, { Testimonials2Props } from "@/components/testimonials-2";
import Testimonials3, { Testimonials3Props } from "@/components/testimonials-3";
import { Navigation, NavigationProps } from "@/components/navigation";
import ProductsList, { ProductsListProps } from "@/components/products-list";
import { BlockSchema, BlockType, BlockInstance } from "@/lib/builder-types";

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
      title: { text: "Meet our happy clients" },
      subtitle: { text: "All of our 1000+ clients are happy" },
      ctaLabel: { text: "Get started for free" },
      reviews: [],
    },
  },
  {
    type: "productsList",
    label: "Products List",
    editableFields: [],
    defaultProps: {
      title: { text: "Best Sellers" },
      subtitle: { text: "Discover our most-loved items" },
      itemsToShow: 6,
      itemsPerRow: 3,
      cardVariant: "v1",
      imageAspect: '4:3',
      products: [
        { id: "p1", title: "Red Hat", category: "Clothing", price: 28, imageSrc: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random11.jpeg" },
        { id: "p2", title: "Blue Shirt", category: "Clothing", price: 42, imageSrc: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random1.jpeg" },
        { id: "p3", title: "Sneakers", category: "Footwear", price: 89, imageSrc: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random2.jpeg" },
        { id: "p4", title: "Socks Pack", category: "Accessories", price: 12, imageSrc: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random11.jpeg" },
        { id: "p5", title: "Backpack", category: "Accessories", price: 59, imageSrc: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random1.jpeg" },
        { id: "p6", title: "Black Jeans", category: "Clothing", price: 65, imageSrc: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random2.jpeg" },
      ],
    },
  },
  {
    type: "testimonials3",
    label: "Testimonials 3 (carousel controls)",
    editableFields: [],
    defaultProps: {
      title: { text: "Why Clients Love Us" },
      subtitle: { text: "Discover how our customers are using our products to build their businesses" },
      reviews: [],
    },
  },
  {
    type: "testimonials2",
    label: "Testimonials 2 (grid)",
    editableFields: [],
    defaultProps: {
      title: { text: "What our clients say" },
      subtitle: { text: "Discover how our customers are using our products to build their businesses" },
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
      title: { text: "Подчеркните свой стиль" },
      subtitle: { text: "Новая коллекция уже здесь" },
      description: { text: "Откройте для себя продуманные образы, премиальные ткани и современные силуэты, которые превращают комплименты в уверенность. Бесплатная доставка от 7 500 ₽ и простой возврат в течение 30 дней." },
      primaryCta: { label: "Перейти к коллекции", href: "#" },
      secondaryCta: { label: "Смотреть лукбук", href: "#" },
      images: [
        { src: "/bg.png", alt: "Featured outfits from our latest drop" },
        { src: "/bg.png", alt: "Featured outfits from our latest drop" },
        { src: "/bg.png", alt: "Featured outfits from our latest drop" },
        { src: "/bg.png", alt: "Featured outfits from our latest drop" }
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
      badge: { text: "NEW RELEASE" },
      title: { text: "Welcome to Our Website" },
      description: { text: "Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur." },
      primaryCta: { label: "Primary", href: "#" },
      secondaryCta: { label: "Secondary", href: "#" },
      images: [
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random11.jpeg",
          alt: "Portrait of Joanna Doe in urban setting",
          name: "Joanna Doe",
        },
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random1.jpeg",
          alt: "Portrait of Joan Doe in natural lighting",
          name: "Joan Doe",
        },
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random2.jpeg",
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
      title: { text: "Boost your Professional Career" },
      description: { text: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus odit eius tenetur quaerat, aperiam, iste ea ex" },
      buttonLabel: { text: "Get Started" },
      images: [
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random11.jpeg",
          alt: "Portrait of Joanna Doe in urban setting",
          name: "Joanna Doe",
        },
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random1.jpeg",
          alt: "Portrait of Joan Doe in natural lighting",
          name: "Joan Doe",
        },
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random2.jpeg",
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
      badgeText: { text: "AI-powered" },
      title: { text: "Revolutionizing Client Collaboration for Modern Services" },
      description: { text: "Elevate your service-based business with customizable client portals and advanced back-office management" },
      primaryCtaLabel: { text: "Start for Free" },
      secondaryCtaLabel: { text: "Schedule a Demo" },
      images: [
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random11.jpeg",
          alt: "Portrait of Joanna Doe in urban setting",
          name: "Joanna Doe",
        },
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random1.jpeg",
          alt: "Portrait of Joan Doe in natural lighting",
          name: "Joan Doe",
        },
        {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/lummi/random2.jpeg",
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
      menuItems: [
        { name: "Features", href: "#link" },
        { name: "Solution", href: "#link" },
        { name: "Pricing", href: "#link" },
        { name: "About", href: "#link" },
      ],
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
    default:
      return null;
  }
}


