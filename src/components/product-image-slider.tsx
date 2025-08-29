"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  MorphingDialog,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTrigger,
  MorphingDialogClose,
  MorphingDialogPreview,
} from "@/components/motion-primitives/morphing-dialog"

interface ProductImageSliderProps {
  images: string[]
  alt?: string
  className?: string
  index?: number
  onIndexChange?: (index: number) => void
  initialIndex?: number
}

export function ProductImageSlider({ images, alt = "Product image", className, index, onIndexChange, initialIndex = 0 }: ProductImageSliderProps) {
  const isControlled = typeof index === "number"
  const [internalIndex, setInternalIndex] = useState(initialIndex)
  const currentIndex = isControlled ? (index as number) : internalIndex
  const [modalIndex, setModalIndex] = useState(0)

  const setCurrentIndex = (next: number) => {
    const normalized = ((next % images.length) + images.length) % images.length
    if (isControlled) {
      onIndexChange?.(normalized)
    } else {
      setInternalIndex(normalized)
      onIndexChange?.(normalized)
    }
  }

  const nextImage = () => {
    setCurrentIndex(currentIndex + 1)
  }

  const prevImage = () => {
    setCurrentIndex(currentIndex - 1)
  }

  const nextModalImage = () => {
    setModalIndex((prev) => (prev + 1) % images.length)
  }

  const prevModalImage = () => {
    setModalIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const openModal = (index: number) => {
    setModalIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className={cn("aspect-square bg-muted rounded-lg flex items-center justify-center", className)}>
        <span className="text-muted-foreground">No images available</span>
      </div>
    )
  }

  return (
    <MorphingDialog>
      {/* Main Slider */}
      <div className={cn("relative group", className)}>
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          <MorphingDialogPreview className="w-full h-full">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className="relative w-full h-full"
            >
              <Image
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={currentIndex === 0}
              />
            </motion.div>
          </MorphingDialogPreview>
          <MorphingDialogTrigger className="absolute inset-0" onClick={() => openModal(currentIndex)} />
        </div>

        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentIndex ? "bg-primary scale-125" : "bg-background/60 hover:bg-background/80",
                )}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip - Only show if multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <motion.button
              key={index}
              className={cn(
                "flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden border-2 transition-all duration-200",
                index === currentIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50",
              )}
              onClick={() => setCurrentIndex(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${alt} thumbnail ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </motion.button>
          ))}
        </div>
      )}

      {/* Fullscreen Preview via MorphingDialog */}
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh] p-0 bg-background/95 backdrop-blur-sm rounded-xl">
          <div className="relative h-full flex flex-col">
            {/* Close Button */}
            <MorphingDialogClose className="absolute top-4 right-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background/80 backdrop-blur-sm">
              ✕
            </MorphingDialogClose>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center p-8 min-h-0">
              <div className="relative w-full h-full flex items-center justify-center">
                <MorphingDialogImage
                  src={images[modalIndex]}
                  alt={`${alt} ${modalIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />

                {/* Navigation Arrows in Modal */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={prevModalImage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={nextModalImage}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Thumbnail Strip */}
            {images.length > 1 && (
              <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
                <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      className={cn(
                        "flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-all duration-200",
                        index === modalIndex
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50",
                      )}
                      onClick={() => setModalIndex(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${alt} thumbnail ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}
