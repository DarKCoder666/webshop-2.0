import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple translation function - replace with your i18n solution
export function t(key: string): string {
  const translations: Record<string, string> = {
    // Upload tab
    upload: "Upload",
    gallery: "Gallery", 
    upload_images: "Upload Images",
    drag_drop_browse: "Drag and drop or browse to upload",
    drag_drop_here: "Drop files here or",
    browse_files: "browse files",
    supports: "Supports",
    max: "Max",
    each: "each",
    
    // Gallery tab
    image_gallery: "Image Gallery",
    click_to_select_up_to: "Click to select up to",
    images: "images",
    loading_gallery: "Loading Gallery",
    please_wait_fetch_images: "Please wait while we fetch your images",
    no_images_uploaded: "No Images Uploaded",
    upload_images_to_start: "Upload some images to get started",
    
    // Selected images
    selected_images: "Selected Images",
    selected: "selected",
    apply_selection: "Apply Selection",
    image: "image",
    
    // States and actions
    uploading_images: "Uploading Images",
    please_wait_process_files: "Please wait while we process your files",
    failed_to_load_gallery: "Failed to load gallery",
    failed_to_upload: "Failed to upload",
    
    // Dialog
    manage_images: "Manage Images",
    manage_images_title: "Manage Images",
    
    // Empty state
    no_images_selected: "No Images Selected",
    add_images_to_section: "Add images to this section",
    add_images: "Add Images",
  }
  
  return translations[key] || key
}



