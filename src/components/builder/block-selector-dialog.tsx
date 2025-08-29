"use client";

import React from "react";
import { motion } from "motion/react";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogTitle,
  MorphingDialogDescription,
  MorphingDialogClose,
} from "@/components/motion-primitives/morphing-dialog";
import { BLOCK_SCHEMAS } from "./block-registry";
import { BlockType } from "@/lib/builder-types";
import { cn } from "@/lib/utils";

// Map block types to their preview images
const BLOCK_PREVIEWS: Record<BlockType, string> = {
  heroSection: "/block-previews/hero-section.png",
  hero37: "/block-previews/hero-37.png",
  hero210: "/block-previews/hero-210.png",
  hero85: "/block-previews/hero-85.png",
  testimonials: "/block-previews/hero-section.png",
  navigation: "/block-previews/hero-section.png",
  testimonials2: "/block-previews/hero-section.png",
  testimonials3: "/block-previews/hero-section.png",
  productsList: "/block-previews/hero-section.png",
  productGallery: "/block-previews/hero-section.png",
  productDetails: "/block-previews/hero-section.png",
  productOverview: "/block-previews/hero-section.png",
  footerMinimal: "/block-previews/hero-section.png",
  footerColumns: "/block-previews/hero-section.png",
  footerHalfscreen: "/block-previews/hero-section.png",
};

type BlockSelectorDialogProps = {
  onPick: (type: BlockType) => void;
  trigger?: React.ReactNode;
  className?: string;
};

export function BlockSelectorDialog({ onPick, trigger, className }: BlockSelectorDialogProps) {
  const [selectedBlock, setSelectedBlock] = React.useState<BlockType | null>(null);

  const handleBlockSelect = (type: BlockType) => {
    onPick(type);
    // Close the dialog after selection
    setTimeout(() => {
      const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement;
      if (closeButton) {
        closeButton.click();
      }
    }, 100);
  };

  return (
    <MorphingDialog>
        <MorphingDialogTrigger className={cn("rounded-full border border-border bg-card px-3 py-2 text-sm font-medium shadow-md hover:bg-muted transition-colors text-card-foreground", className)}>
          {trigger || "+ Добавить секцию здесь"}
        </MorphingDialogTrigger>
      
      <MorphingDialogContainer>
        <MorphingDialogContent className="w-[900px] max-w-[95vw] rounded-2xl bg-card shadow-2xl border border-border">
          <div className="p-6">
            <MorphingDialogTitle className="text-2xl font-bold text-card-foreground">
              Выберите тип секции
            </MorphingDialogTitle>
            <MorphingDialogDescription className="mt-2 text-muted-foreground">
              Выберите подходящий блок для вашего сайта
            </MorphingDialogDescription>
            
            <motion.div 
              className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2 pb-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--muted)) transparent',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {BLOCK_SCHEMAS.filter(schema => !schema.type.startsWith('footer')).map((schema, index) => (
                <motion.div
                  key={schema.type}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.1 + 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="group relative h-full flex"
                >
                  <button
                    onClick={() => handleBlockSelect(schema.type)}
                    onMouseEnter={() => setSelectedBlock(schema.type)}
                    onMouseLeave={() => setSelectedBlock(null)}
                    className={cn(
                      "w-full h-full text-left rounded-xl border-2 transition-all duration-300 flex flex-col",
                      "hover:border-primary hover:shadow-lg",
                      selectedBlock === schema.type ? "border-primary shadow-lg scale-[1.02]" : "border-border"
                    )}
                  >
                    {/* Preview Image */}
                    <div className="aspect-video bg-muted rounded-t-[10px] overflow-hidden flex-shrink-0">
                      <img
                        src={BLOCK_PREVIEWS[schema.type]}
                        alt={`Preview of ${schema.label}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Block Info */}
                    <div className="p-4 flex flex-col flex-grow">
                      {/* Title and Description - aligned to top */}
                      <div className="flex-grow">
                        <h3 className="font-semibold text-card-foreground mb-1">
                          {schema.label}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {getBlockDescription(schema.type)}
                        </p>
                      </div>
                      
                      {/* Features - aligned to bottom */}
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {getBlockFeatures(schema.type).map((feature, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Hover overlay */}
                    <motion.div
                      className="absolute inset-0 bg-foreground/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                    >
                      <motion.div
                        className="bg-primary rounded-full px-4 py-2 shadow-lg"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={selectedBlock === schema.type ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-sm font-medium text-primary-foreground">Выбрать</span>
                      </motion.div>
                    </motion.div>
                  </button>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <MorphingDialogClose className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </MorphingDialogClose>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

// Helper functions to provide descriptions and features for each block type
function getBlockDescription(type: BlockType): string {
  switch (type) {
    case "heroSection":
      return "Классическая главная секция с изображением и призывом к действию";
    case "hero37":
      return "Современный герой с бейджем и двумя кнопками";
    case "hero210":
      return "Герой с каруселью изображений и анимацией";
    case "hero85":
      return "Автоскроллинг герой с динамическим контентом";
    case "testimonials":
      return "Две бесконечные карусели отзывов в противоположных направлениях";
    case "testimonials2":
      return "Сетка отзывов как на макете (без роли)";
    case "testimonials3":
      return "Карусель на контроллерах (без автопрокрутки)";
    case "productsList":
      return "Секция товаров с карточками и настройкой количества";
    case "footerMinimal":
      return "Минималистичный футер с описанием и ссылками";
    case "footerColumns":
      return "Футер с колонками, ссылками и рассылкой";
    case "footerHalfscreen":
      return "Креативный футер на пол-экрана с CTA";
    default:
      return "Секция для вашего сайта";
  }
}

function getBlockFeatures(type: BlockType): string[] {
  switch (type) {
    case "heroSection":
      return ["Изображение", "CTA кнопки", "Описание"];
    case "hero37":
      return ["Бейдж", "Две CTA", "Современный дизайн"];
    case "hero210":
      return ["Карусель", "Анимация", "Интерактивность"];
    case "hero85":
      return ["Автоскролл", "Динамический контент", "Плавные переходы"];
    case "testimonials":
      return ["Отзывы", "Две карусели", "Drag & autoplay"];
    case "productsList":
      return ["Карточки товаров", "Анимации", "Настройки"];
    case "footerMinimal":
      return ["Минимализм", "Соцсети", "Копирайт"];
    case "footerColumns":
      return ["4 колонки", "Ссылки", "Рассылка"];
    case "footerHalfscreen":
      return ["Пол-экрана", "Фон-изображение", "2 CTA"];
    default:
      return [];
  }
}
