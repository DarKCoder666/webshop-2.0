"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageIcon, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageManager } from "@/components/image-manager"
import { t } from "@/lib/i18n"

export interface ImageData {
  id: string
  url: string
  name: string
  size: number
  _id?: string // Backend ID for uploaded images
}

interface ImageManagerDialogProps {
  maxImages?: number
  initialSelectedImages?: ImageData[]
  onSelectionChange?: (images: ImageData[]) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  children: React.ReactNode
  className?: string
  showOnHover?: boolean // For desktop hover behavior
  showOverlayButton?: boolean // Control overlay trigger visibility
  triggerOnChildClick?: boolean // Treat child as trigger
}

export function ImageManagerDialog({
  maxImages = 10,
  initialSelectedImages = [],
  onSelectionChange,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSize = 5,
  children,
  className,
  showOnHover = true,
  showOverlayButton = true,
  triggerOnChildClick = false,
}: ImageManagerDialogProps) {
  const [showImageManager, setShowImageManager] = useState(false)
  const triggerWrapperRef = useRef<HTMLDivElement>(null)
  const ignoreInitialCallbackRef = useRef<boolean>(false)

  // Prevent parent dialogs' outside-click handlers from closing when we open this dialog
  useEffect(() => {
    if (!triggerOnChildClick || !triggerWrapperRef.current) return
    const el = triggerWrapperRef.current
    const stop = (e: Event) => {
      // Capture phase stop to prevent document mousedown/touchstart handlers
      e.stopPropagation()
    }
    el.addEventListener('mousedown', stop, true)
    el.addEventListener('touchstart', stop, true)
    return () => {
      el.removeEventListener('mousedown', stop, true)
      el.removeEventListener('touchstart', stop, true)
    }
  }, [triggerOnChildClick])

  // When dialog opens with a preselected image (single-select), the ImageManager
  // may immediately call onSelectionChange. Ignore that first callback so the dialog
  // doesn't auto-close on open when a value like "/billy.svg" is prefilled.
  useEffect(() => {
    if (showImageManager) {
      ignoreInitialCallbackRef.current = true
    }
  }, [showImageManager])

  const handleImageSelection = (selectedImages: ImageData[]) => {
    onSelectionChange?.(selectedImages)
    setShowImageManager(false)
  }

  return (
    <>
      {/* Trigger wrapper with hover behavior */}
      <div 
        ref={triggerWrapperRef}
        className={cn(
          "group relative",
          className
        )}
        onClick={triggerOnChildClick ? (e) => { e.preventDefault(); e.stopPropagation(); setShowImageManager(true) } : undefined}
        role={triggerOnChildClick ? 'button' : undefined}
        aria-haspopup={triggerOnChildClick ? 'dialog' : undefined}
        aria-expanded={triggerOnChildClick ? showImageManager : undefined}
      >
        {children}
        
        {/* Image Management Button */}
        {showOverlayButton && (
          <div className={cn(
            "absolute top-4 right-4 z-20 transition-opacity duration-200",
            // Desktop: show on hover, Mobile: always show
            showOnHover && "md:opacity-0 md:group-hover:opacity-100"
          )}>
            <Button
              onClick={() => setShowImageManager(true)}
              variant="secondary"
              size="sm"
              className={cn(
                "gap-2 bg-primary/90 text-primary-foreground hover:bg-primary shadow-lg backdrop-blur-sm",
                // Mobile: icon only, Desktop: icon + text
                "md:px-3 px-2"
              )}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">{t('manage_images')}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Image Manager Dialog */}
      <Dialog open={showImageManager} onOpenChange={setShowImageManager}>
        <DialogContent className="z-[1100] max-w-4xl max-h-[90vh] overflow-hidden" overlayClassName="z-[1090]">
          <DialogHeader>
            <DialogTitle>{t('manage_images_title')}</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[calc(90vh-8rem)]">
            <ImageManager
              maxImages={maxImages}
              initialSelectedImages={initialSelectedImages}
              onSelectionChange={(images) => {
                if (ignoreInitialCallbackRef.current) {
                  ignoreInitialCallbackRef.current = false
                  return
                }
                handleImageSelection(images)
              }}
              acceptedTypes={acceptedTypes}
              maxFileSize={maxFileSize}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface EmptyImageStateProps {
  onOpenManager: () => void
  title?: string
  description?: string
  className?: string
}

export function EmptyImageState({
  onOpenManager,
  title = t('no_images_selected'),
  description = t('add_images_to_section'),
  className
}: EmptyImageStateProps) {
  return (
    <div className={cn(
      "w-full h-full flex items-center justify-center bg-muted rounded-3xl border-2 border-dashed border-border",
      className
    )}>
      <div className="text-center">
        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">{title}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button
          onClick={onOpenManager}
          variant="default"
          className="gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          {t('add_images')}
        </Button>
      </div>
    </div>
  )
}
