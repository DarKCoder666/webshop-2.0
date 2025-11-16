"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X, Upload, ImageIcon, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

import { uploadWebshopImage, getWebshopImagesList, getCurrentShopId, type WebshopImage } from "@/api/webshop-api"
import { t } from "@/lib/i18n"

interface ImageData {
  id: string
  url: string
  name: string
  size: number
  _id?: string // Backend ID for uploaded images
}

interface ImageManagerProps {
  maxImages?: number
  initialSelectedImages?: ImageData[]
  onSelectionChange?: (images: ImageData[]) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
}

export function ImageManager({
  maxImages = 10,
  initialSelectedImages = [],
  onSelectionChange,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSize = 5,
}: ImageManagerProps) {
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([])
  const [selectedImages, setSelectedImages] = useState<ImageData[]>(initialSelectedImages)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingGallery, setIsLoadingGallery] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [activeTab, setActiveTab] = useState<"upload" | "gallery">("upload")
  const [error, setError] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<ImageData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Helper function to check if two images match
  const imagesMatch = useCallback((img1: ImageData, img2: ImageData | { id: string; _id?: string; url: string }) => {
    // Check for exact ID match
    if (img1.id === img2.id) return true
    
    // Check for _id match (backend ID)
    if (img1._id && img2._id && img1._id === img2._id) return true
    if (img1._id && img1._id === img2.id) return true
    if (img2._id && img1.id === img2._id) return true
    
    // Check if URLs match
    if (img1.url === img2.url) return true
    
    return false
  }, [])

  // Convert WebshopImage to ImageData
  const convertWebshopImageToImageData = useCallback((webshopImage: WebshopImage): ImageData => {
    return {
      id: webshopImage._id,
      _id: webshopImage._id,
      url: webshopImage.image.bigUrl,
      name: webshopImage.fileName,
      size: 0, // Backend doesn't provide file size
    }
  }, [])

  // Load images from backend on component mount
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        setIsLoadingGallery(true)
        setError(null)
        const response = await getWebshopImagesList({
          shopId: getCurrentShopId(),
          limit: 50, // Load first 50 images
          page: 1,
          sortBy: 'createdAt,desc' // Most recent first
        })
        const convertedImages = response.results.map(convertWebshopImageToImageData)
        setUploadedImages(convertedImages)
      } catch (err) {
        console.error('Failed to load gallery images:', err)
        setError(t('failed_to_load_gallery'))
      } finally {
        setIsLoadingGallery(false)
      }
    }

    loadGalleryImages()
  }, [convertWebshopImageToImageData])

  // Handle callback for auto-selected images (single selection mode only)
  useEffect(() => {
    if (maxImages === 1 && selectedImages.length === 1) {
      // Small delay to avoid calling during render
      const timeoutId = setTimeout(() => {
        onSelectionChange?.(selectedImages)
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedImages, maxImages, onSelectionChange])

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      if (!files.length) return

      setIsUploading(true)
      setError(null)
      const newImages: ImageData[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          console.warn(`File ${file.name} is not an accepted image type`)
          continue
        }

        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          console.warn(`File ${file.name} exceeds maximum size of ${maxFileSize}MB`)
          continue
        }

        try {
          // Upload to backend
          const uploadResponse = await uploadWebshopImage(file, getCurrentShopId())
          const imageData = convertWebshopImageToImageData(uploadResponse)
          newImages.push(imageData)
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err)
          setError(`${t('failed_to_upload')} ${file.name}`)
        }
      }

      if (newImages.length > 0) {
        setUploadedImages((prev) => [...prev, ...newImages])
        
        // Auto-select uploaded images if there's space
        setSelectedImages((prev) => {
          const availableSlots = maxImages - prev.length
          const imagesToSelect = newImages.slice(0, availableSlots)
          return [...prev, ...imagesToSelect]
        })
      }
      setIsUploading(false)
    },
    [acceptedTypes, maxFileSize, convertWebshopImageToImageData, maxImages],
  )

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileUpload(e.dataTransfer.files)
      }
    },
    [handleFileUpload],
  )

  const handleImageSelect = useCallback(
    (image: ImageData) => {
      setSelectedImages((prev) => {
        const isSelected = prev.some((img) => imagesMatch(img, image))
        let newSelection: ImageData[]

        if (isSelected) {
          // Remove from selection
          newSelection = prev.filter((img) => !imagesMatch(img, image))
        } else {
          // Add to selection if under limit
          if (prev.length >= maxImages) {
            console.warn(`Maximum ${maxImages} images allowed`)
            return prev
          }
          newSelection = [...prev, image]
        }

        // Only trigger callback immediately if single selection AND adding items
        if (maxImages === 1 && !isSelected) {
          onSelectionChange?.(newSelection)
        }
        
        return newSelection
      })
    },
    [maxImages, onSelectionChange, imagesMatch],
  )

  const handleRemoveSelected = useCallback(
    (imageId: string) => {
      setSelectedImages((prev) => prev.filter((img) => {
        // Keep items that DON'T match the imageId
        const tempImage = { id: imageId, url: '', _id: imageId }
        return !imagesMatch(img, tempImage)
      }))
    },
    [imagesMatch],
  )

  const isImageSelected = useCallback(
    (imageId: string) => {
      return selectedImages.some((img) => {
        // Create a temporary image object to use with imagesMatch
        const tempImage = { id: imageId, url: '', _id: imageId }
        if (imagesMatch(img, tempImage)) return true
        
        // For gallery images, also check if the URL matches
        // This handles cases where initially selected images use URL as ID
        const galleryImage = uploadedImages.find(uploaded => uploaded._id === imageId)
        if (galleryImage && imagesMatch(img, galleryImage)) return true
        
        return false
      })
    },
    [selectedImages, uploadedImages, imagesMatch],
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex space-x-1 bg-secondary p-1 rounded-xl"
      >
        <button
          onClick={() => setActiveTab("upload")}
          className={cn(
            "flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300",
            activeTab === "upload"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>{t('upload')}</span>
          </motion.div>
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={cn(
            "flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300",
            activeTab === "gallery"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center space-x-2"
          >
            <ImageIcon className="h-4 w-4" />
            <span>{t('gallery')}</span>
            {uploadedImages.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {uploadedImages.length}
              </Badge>
            )}
          </motion.div>
        </button>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "upload" ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-muted to-background">
              <CardContent className="p-8">
                <div className="space-y-6">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {t('upload_images')}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('drag_drop_browse')}
                      </p>
                    </div>
                    <motion.div
                      animate={{ scale: selectedImages.length > 0 ? 1.05 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Badge
                        variant={selectedImages.length === maxImages ? "destructive" : "secondary"}
                        className="text-sm px-3 py-1 font-medium"
                      >
                        {selectedImages.length}/{maxImages}
                      </Badge>
                    </motion.div>
                  </div>

                  <motion.div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300",
                      dragActive
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-border",
                      "hover:border-primary hover:bg-primary/5 hover:scale-[1.01]",
                    )}
                    whileHover={{ scale: 1.01 }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <motion.div
                        animate={{
                          y: dragActive ? -5 : 0,
                          scale: dragActive ? 1.1 : 1,
                        }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="relative">
                          <Upload className="h-12 w-12 text-muted-foreground" />
                          {dragActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1.5, opacity: 0 }}
                              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                            />
                          )}
                        </div>
                      </motion.div>
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          {t('drag_drop_here')}{" "}
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary hover:text-primary/80 font-semibold"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {t('browse_files')}
                          </Button>
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {t('supports')}: {acceptedTypes.map((type) => type.split("/")[1]).join(", ")} • {t('max')} {maxFileSize}MB {t('each')}
                        </p>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={acceptedTypes.join(",")}
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-muted to-background">
              <CardContent className="p-8">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">
                      {t('image_gallery')}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('click_to_select_up_to')} {maxImages} {t('images')}
                    </p>
                  </div>
                </div>

                {isLoadingGallery ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="text-lg text-foreground font-medium">{t('loading_gallery')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('please_wait_fetch_images')}</p>
                  </motion.div>
                ) : uploadedImages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    >
                      <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    </motion.div>
                    <p className="text-lg text-foreground font-medium">{t('no_images_uploaded')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('upload_images_to_start')}</p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                      {uploadedImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 300,
                          }}
                          className={cn(
                            "relative cursor-pointer group rounded-xl overflow-hidden border-2 transition-all duration-300",
                            isImageSelected(image.id)
                              ? "border-primary ring-4 ring-primary/20 shadow-lg"
                              : "border-transparent hover:border-primary/50 hover:shadow-md",
                            selectedImages.length >= maxImages && !isImageSelected(image.id)
                              ? "opacity-50 cursor-not-allowed"
                              : "",
                          )}
                          onClick={() => {
                            if (selectedImages.length >= maxImages && !isImageSelected(image.id)) {
                              return
                            }
                            handleImageSelect(image)
                          }}
                          whileHover={{
                            scale: selectedImages.length >= maxImages && !isImageSelected(image.id) ? 1 : 1.02,
                          }}
                          whileTap={{
                            scale: selectedImages.length >= maxImages && !isImageSelected(image.id) ? 1 : 0.98,
                          }}
                        >
                          <div className="aspect-square bg-muted">
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt={image.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>

                          <AnimatePresence>
                            {isImageSelected(image.id) && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-primary/20 flex items-center justify-center"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: "spring", stiffness: 300 }}
                                  className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg"
                                >
                                  <Check className="h-5 w-5" />
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Images Section */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-accent to-background">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-primary">
                      {t('selected_images')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedImages.length}/{maxImages} {t('images')} {t('selected')}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: selectedImages.length * 10 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <Check className="h-5 w-5 text-primary" />
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <AnimatePresence>
                    {selectedImages.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                        }}
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setPreviewImage(image)}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted shadow-sm">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <motion.button
                          className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/90 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveSelected(image.id)
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <X className="h-3 w-3" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Apply Selection Button for Multi-Select */}
                {maxImages > 1 && selectedImages.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={() => onSelectionChange?.(selectedImages)}
                      className="px-6 py-2 cursor-pointer"
                      size="default"
                    >
                      {t('apply_selection')} ({selectedImages.length} {selectedImages.length === 1 ? t('image') : t('images')})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="rounded-full h-8 w-8 border-4 border-muted border-t-primary"
                    />
                    <div>
                      <p className="font-semibold text-lg text-foreground">{t('uploading_images')}</p>
                      <p className="text-sm text-muted-foreground">{t('please_wait_process_files')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {previewImage ? `${t('image')}: ${previewImage.name}` : t('image')}
          </DialogTitle>
          {previewImage && (
            <div className="relative">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="w-full h-auto max-h-[85vh] object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4">
                <p className="text-lg font-medium">{previewImage.name}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
