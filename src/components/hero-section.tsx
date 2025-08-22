"use client";

import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { EditableText } from "@/components/builder/editable-text";
import { useBuilder } from "@/components/builder/builder-context";
import { RenderableText } from "@/components/builder/renderable-text";
import { RichText } from "@/lib/builder-types";
import { getRichTextContent, getRichTextStyle } from "@/lib/text-utils";
import {
    Carousel,
    CarouselContent,
    CarouselIndicator,
    CarouselItem,
} from "@/components/motion-primitives/carousel";

type HeroImage = { src: string; alt?: string };

type HeroSectionProps = {
    title?: string | RichText;
    subtitle?: string | RichText;
    description?: string | RichText;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label?: string; href?: string };
    images?: HeroImage[];
    autoplay?: boolean;
    autoplayIntervalMs?: number;
    className?: string;
    blockId?: string;
};

export default function HeroSection({
    title,
    subtitle,
    description,
    primaryCta,
    secondaryCta,
    images,
    autoplay,
    autoplayIntervalMs,
    className,
    blockId,
}: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const { isBuilder, updateBlockText } = useBuilder();

    return (
        <section className={"relative " + (className ?? "") }>
            <div className="absolute inset-0 -z-10">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 pt-28 md:pt-36 md:min-h-screen lg:px-12">
                <div className="grid items-center gap-12 md:grid-cols-2">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            {(title || isBuilder) && (
                                isBuilder ? (
                                    <EditableText
                                        key={`title-${blockId}`}
                                        blockId={blockId || ""}
                                        fieldKey="title"
                                        onSave={updateBlockText}
                                        isBuilder={isBuilder}
                                        as="h1"
                                        className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
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
                                        speedReveal={0.6}
                                        speedSegment={0.8}
                                        delay={0}
                                        className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl"
                                    />
                                )
                            )}
                            {(subtitle || isBuilder) && (
                                isBuilder ? (
                                    <EditableText
                                        key={`subtitle-${blockId}`}
                                        blockId={blockId || ""}
                                        fieldKey="subtitle"
                                        onSave={updateBlockText}
                                        isBuilder={isBuilder}
                                        as="h2"
                                        className="text-primary text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
                                        placeholder="Enter subtitle..."
                                        style={getRichTextStyle(subtitle)}
                                    >
                                        {getRichTextContent(subtitle)}
                                    </EditableText>
                                ) : (
                                    <RenderableText
                                        content={subtitle}
                                        as="h2"
                                        per="char"
                                        preset="fade-in-blur"
                                        speedReveal={0.6}
                                        speedSegment={0.8}
                                        delay={1}
                                        className="text-primary text-3xl font-bold leading-tight sm:text-4xl md:text-5xl"
                                    />
                                )
                            )}
                        </div>

                        {(description || isBuilder) && (
                            isBuilder ? (
                                <EditableText
                                    key={`description-${blockId}`}
                                    blockId={blockId || ""}
                                    fieldKey="description"
                                    onSave={updateBlockText}
                                    isBuilder={isBuilder}
                                    as="p"
                                    className="text-base leading-7 text-muted-foreground md:text-lg"
                                    placeholder="Enter description..."
                                    style={getRichTextStyle(description)}
                                >
                                    {getRichTextContent(description)}
                                </EditableText>
                            ) : (
                                <RenderableText
                                    content={description}
                                    as="p"
                                    per="char"
                                    preset="fade-in-blur"
                                    speedReveal={1}
                                    speedSegment={1.1}
                                    delay={2}
                                    className="text-base leading-7 text-muted-foreground md:text-lg"
                                />
                            )
                        )}

                        <AnimatedGroup preset="slide" as="div" className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {primaryCta?.label && (
                                <Button asChild className="h-11 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                                    <a href={primaryCta.href}>{primaryCta.label}</a>
                                </Button>
                            )}
                            {secondaryCta?.label && (
                                <Button asChild variant="outline" className="h-11 rounded-lg border-border px-6 text-base font-semibold text-foreground hover:bg-muted">
                                    <a href={secondaryCta.href}>{secondaryCta.label}</a>
                                </Button>
                            )}
                        </AnimatedGroup>
                    </div>

                    <div className="relative">
                        {!images || images.length <= 1 ? (
                            <AnimatedGroup preset="zoom" as="div" className="relative mx-auto w-full max-w-xl md:max-w-2xl">
                                <div className="absolute -inset-2 -z-10 rounded-[28px] bg-gradient-to-b from-primary/20 via-card to-card blur-2xl" />
                                <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                                    <Image
                                        src={images?.[0]?.src || "/bg.png"}
                                        alt={images?.[0]?.alt || "Featured outfits from our latest drop"}
                                        width={900}
                                        height={1200}
                                        priority
                                        className="w-full h-auto md:h-[640px] object-cover"
                                    />
                                </div>
                            </AnimatedGroup>
                        ) : (
                            <AnimatedGroup preset="zoom" as="div" className="relative mx-auto w-full max-w-xl md:max-w-2xl">
                                <div className="absolute -inset-2 -z-10 rounded-[28px] bg-gradient-to-b from-primary/20 via-card to-card blur-2xl" />
                                <div>
                                    <Carousel key={`imgs-${images.map((i) => i.src).join('|')}`} index={currentIndex} onIndexChange={setCurrentIndex} infinite autoplay={autoplay ?? true} autoplayIntervalMs={autoplayIntervalMs ?? 3000}>
                                        <CarouselContent>
                                            {images.map((img, i) => (
                                                <CarouselItem key={`${img.src}-${i}`}>
                                                    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
                                                        <Image
                                                            src={img.src}
                                                            alt={img.alt || `Slide ${i + 1}`}
                                                            width={900}
                                                            height={1200}
                                                            priority={i === 0}
                                                            draggable={false}
                                                            className="w-full h-auto md:h-[640px] object-cover select-none pointer-events-none"
                                                        />
                                                    </div>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselIndicator className="bottom-4" />
                                    </Carousel>
                                </div>
                            </AnimatedGroup>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}