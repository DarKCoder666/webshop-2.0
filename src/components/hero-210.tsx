"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";

import { EditableText } from "@/components/builder/editable-text";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";

export type ImageItem = {
  src: string;
  alt: string;
  name: string;
};

export const hero210Images: ImageItem[] = [
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
];

export type Hero210Props = {
  title?: string | RichText;
  description?: string | RichText;
  images?: ImageItem[];
  buttonLabel?: string | RichText;
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
  const { isBuilder, updateBlockText } = useBuilder();
  
  useEffect(() => setDomLoaded(true), []);

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
      <div className="mx-auto max-w-6xl px-6">
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

          {domLoaded && images && images.length > 0 && (
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
          )}
        </div>

        {(buttonLabel || isBuilder) && (
          <AnimatedGroup preset="slide" className="relative mx-auto mt-6 flex w-fit justify-center">
            {isBuilder ? (
              <EditableText
                key={`buttonLabel-${blockId}`}
                blockId={blockId || ""}
                fieldKey="buttonLabel"
                onSave={updateBlockText}
                isBuilder={isBuilder}
                as="span"
                className="rounded-full px-4 py-2 bg-primary text-primary-foreground font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                placeholder="Button text..."
                style={getRichTextStyle(buttonLabel)}
              >
                {getRichTextContent(buttonLabel)}
              </EditableText>
            ) : (
              <Button 
                key={`btn-${getRichTextContent(buttonLabel)}`} 
                className="rounded-full px-4 py-2 active:scale-105"
                style={getRichTextStyle(buttonLabel)}
              >
                {getRichTextContent(buttonLabel)}
              </Button>
            )}
          </AnimatedGroup>
        )}
      </div>
    </section>
  );
}


