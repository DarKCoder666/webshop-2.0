export interface ImageData {
  id: string
  url: string
  name: string
  size: number
  _id?: string // Backend ID for uploaded images
}

export interface ImageManagerProps {
  maxImages?: number
  initialSelectedImages?: ImageData[]
  onSelectionChange?: (images: ImageData[]) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  uploadFunction?: (file: File) => Promise<ImageData> // Custom upload function
}

export interface ImageManagerDialogProps extends ImageManagerProps {
  children: React.ReactNode
  className?: string
  showOnHover?: boolean // For desktop hover behavior
  showOverlayButton?: boolean // Control overlay trigger visibility
  triggerOnChildClick?: boolean // Treat child as trigger
}

export interface EmptyImageStateProps {
  onOpenManager: () => void
  title?: string
  description?: string
  className?: string
}



