"use client";

import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { ImageManagerDialog, EmptyImageState, type ImageData } from "@/components/image-manager-dialog";

import { EditableText } from "@/components/builder/editable-text";
import { EditableButton } from "@/components/builder/editable-button";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RenderableButton } from "@/components/builder/renderable-button";
import { RichText, RichButton } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";

export type ImageItem = {
  src: string;
  alt: string;
  name: string;
  _id?: string; // Backend ID for uploaded images
};

export const hero210Images: ImageItem[] = [
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
];

export type Hero210Props = {
  title?: string | RichText;
  description?: string | RichText;
  images?: ImageItem[];
  buttonLabel?: string | RichButton;
  blockId?: string;
};

export default function Hero210({
  title,
  description,
  images,
  buttonLabel,
  blockId,
}: Hero210Props) {
  const [domLoaded, setDomLoaded] = useState(false);
  const { isBuilder, updateBlockText, updateBlockProps } = useBuilder();
  
  useEffect(() => setDomLoaded(true), []);

  // Convert ImageManager selection to ImageItem format
  const handleImageSelection = (selectedImages: ImageData[]) => {
    const convertedImages: ImageItem[] = selectedImages.map(img => ({
      src: img.url,
      alt: img.name,
      name: img.name,
      _id: img._id
    }));
    
    updateBlockProps?.(blockId || "", { images: convertedImages });
  };

  const css = `
  .mySwiperHero210 { width: 100%; height: 420px; padding-bottom: 50px; }
  .mySwiperHero210 .swiper-slide { background-position: center; background-size: cover; width: 300px; }
  .mySwiperHero210 .swiper-slide img { display: block; width: 100%; }
  .swiper-3d .swiper-slide-shadow-left { background-image: none; }
  .swiper-3d .swiper-slide-shadow-right { background: none; }
  `;

  return (
    <section className="py-24 md:py-32">
      <style>{css}</style>
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4">
          {(title || isBuilder) && (
            isBuilder ? (
              <EditableText
                key={`title-${blockId}`}
                blockId={blockId || ""}
                fieldKey="title"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="h1"
                className="text-center text-4xl font-extrabold tracking-tight md:text-6xl"
                placeholder="Enter title..."
                style={getRichTextStyle(title)}
              >
                {getRichTextContent(title)}
              </EditableText>
            ) : (
              <RenderableText
                content={title}
                as="h1"
                per="char"
                preset="fade-in-blur"
                speedReveal={0.7}
                speedSegment={0.9}
                className="text-center text-4xl font-extrabold tracking-tight md:text-6xl"
              />
            )
          )}
          {(description || isBuilder) && (
            isBuilder ? (
              <EditableText
                key={`description-${blockId}`}
                blockId={blockId || ""}
                fieldKey="description"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="p"
                className="text-center text-muted-foreground md:text-lg"
                placeholder="Enter description..."
                style={getRichTextStyle(description)}
              >
                {getRichTextContent(description)}
              </EditableText>
            ) : (
              <RenderableText
                content={description}
                as="p"
                per="word"
                preset="fade"
                delay={0.2}
                className="text-center text-muted-foreground md:text-lg"
              />
            )
          )}
        </div>

        <div className="relative mt-12 h-[420px] w-full lg:px-20">
          <div className="pointer-events-none absolute left-0 z-10 h-full w-12 bg-gradient-to-r from-background via-background to-transparent md:w-24 lg:left-16" />
          <div className="pointer-events-none absolute right-0 z-10 h-full w-12 bg-gradient-to-l from-background via-background to-transparent md:w-24 lg:right-16" />

          {isBuilder ? (
            <ImageManagerDialog
              maxImages={10}
              initialSelectedImages={images?.map(img => ({
                id: img._id || img.src,
                _id: img._id,
                url: img.src,
                name: img.name,
                size: 0
              })) || []}
              onSelectionChange={handleImageSelection}
              className="w-full h-full"
            >
              {domLoaded && images && images.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full">
                  <Swiper
                    autoplay={{ delay: 1500, disableOnInteraction: false }}
                    effect="coverflow"
                    grabCursor={true}
                    slidesPerView="auto"
                    centeredSlides={true}
                    loop={true}
                    coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
                    className="mySwiperHero210"
                    modules={[EffectCoverflow, Autoplay]}
                  >
                    {[...images, ...images].map((image, index) => (
                      <SwiperSlide key={index}>
                        <img
                          className="h-full w-full overflow-hidden rounded-3xl object-cover shadow-lg"
                          src={image.src}
                          alt={image.alt}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ duration: 0.3 }} 
                  className="w-full h-full"
                >
                  <EmptyImageState onOpenManager={() => {}} />
                </motion.div>
              )}
            </ImageManagerDialog>
          ) : domLoaded && images && images.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full">
              <Swiper
                autoplay={{ delay: 1500, disableOnInteraction: false }}
                effect="coverflow"
                grabCursor={true}
                slidesPerView="auto"
                centeredSlides={true}
                loop={true}
                coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
                className="mySwiperHero210"
                modules={[EffectCoverflow, Autoplay]}
              >
                {[...images, ...images].map((image, index) => (
                  <SwiperSlide key={index}>
                    <img
                      className="h-full w-full overflow-hidden rounded-3xl object-cover shadow-lg"
                      src={image.src}
                      alt={image.alt}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          ) : null}
        </div>

        {(buttonLabel || isBuilder) && (
          <AnimatedGroup preset="slide" className="relative mx-auto mt-6 flex w-fit justify-center">
            {isBuilder ? (
              <EditableButton
                key={`buttonLabel-${blockId}`}
                blockId={blockId || ""}
                fieldKey="buttonLabel"
                content={buttonLabel as RichButton}
                onSave={updateBlockText}
                isBuilder={isBuilder}
                className="rounded-full px-4 py-2 active:scale-105"
                placeholder="Button text..."
                style={{ 
                  variant: "default",
                  size: "default",
                  ...(typeof buttonLabel === 'object' ? buttonLabel?.style : {})
                }}
                href={typeof buttonLabel === 'object' ? buttonLabel?.href : undefined}
              >
                {getRichTextContent(buttonLabel)}
              </EditableButton>
            ) : (
              <RenderableButton 
                content={buttonLabel}
                className="rounded-full px-4 py-2 active:scale-105"
                variant="default"
                size="default"
              />
            )}
          </AnimatedGroup>
        )}
      </div>
    </section>
  );
}
