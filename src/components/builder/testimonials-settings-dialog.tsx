"use client";

import React from "react";
import { 
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
} from "@/components/motion-primitives/morphing-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlockInstance, RichText } from "@/lib/builder-types";
import { Plus, Quote, Trash } from "lucide-react";
import { getRichTextContent } from "@/lib/text-utils";
import { getCurrentLanguage } from "@/lib/stores/language-store";

type TestimonialsSettingsDialogProps = {
  block: BlockInstance;
  onSave: (props: Record<string, unknown>) => void;
};

export function TestimonialsSettingsDialog({ block, onSave }: TestimonialsSettingsDialogProps) {
  const initial = block.props || {};
  type Review = { name: string | RichText; text: string | RichText };
  
  const buildInitialReviews = (): Review[] => {
    const fromArray = (initial as any).reviews as Review[] | undefined;
    if (Array.isArray(fromArray) && fromArray.length) return fromArray;
    const out: Review[] = [];
    for (let i = 1; i <= 8; i++) {
      const n = (initial as Record<string, any>)[`r${i}Name`];
      const t = (initial as Record<string, any>)[`r${i}Text`];
      if (n || t) out.push({ name: n ?? { text: "" }, text: t ?? { text: "" } });
    }
    return out;
  };

  const [reviews, setReviews] = React.useState<Review[]>(buildInitialReviews());

  React.useEffect(() => {
    setReviews(buildInitialReviews());
  }, [block.id]);

  const updateReview = (idx: number, key: "name" | "text", value: string) => {
    setReviews((previousReviews) =>
      previousReviews.map((review, i) => {
        if (i !== idx) return review;
        const previousField = (review as any)[key];
        const currentLang = getCurrentLanguage();
        
        // Preserve multi-language content if it exists
        let nextField;
        if (typeof previousField === "string") {
          // Convert string to RichText with ALL languages (to avoid content loss on language switch)
          nextField = { 
            ru: value,
            en: value,
            uz: value,
          };
        } else if (previousField && typeof previousField === "object") {
          // Check if it has language keys (ru, en, uz)
          const hasLangKeys = previousField.ru || previousField.en || previousField.uz;
          if (hasLangKeys) {
            // Multi-language object exists
            // Check if other languages have different content
            const languages = ['ru', 'en', 'uz'] as const;
            const uniqueValues = new Set(languages.map(lang => previousField[lang]).filter(Boolean));
            
            if (uniqueValues.size <= 1) {
              // All languages have the same value (or only one language exists)
              // Update all languages to keep them in sync
              nextField = { 
                ru: value,
                en: value,
                uz: value,
              };
            } else {
              // Different languages have different content - preserve them, only update current
              nextField = { 
                ...previousField,
                [currentLang]: value
              };
            }
          } else if (previousField.text !== undefined) {
            // It's a simple { text: "..." } format, convert to multi-language
            nextField = { 
              ru: value,
              en: value,
              uz: value,
            };
          } else {
            // Unknown format, create new with all languages
            nextField = { 
              ru: value,
              en: value,
              uz: value,
            };
          }
        } else {
          // No previous field, create new with all languages
          nextField = { 
            ru: value,
            en: value,
            uz: value,
          };
        }
        
        return { ...review, [key]: nextField } as Review;
      })
    );
  };

  const addReview = () => {
    // Create new review with all languages to avoid content disappearing on language switch
    setReviews((prev) => [...prev, { 
      name: { ru: "", en: "", uz: "" }, 
      text: { ru: "", en: "", uz: "" } 
    }]);
  };

  const removeReview = (idx: number) => {
    setReviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    // Filter out empty reviews based on the displayed content (using getRichTextContent)
    const normalized = reviews.filter((r) => {
      const nameContent = getRichTextContent(r.name).trim();
      const textContent = getRichTextContent(r.text).trim();
      return nameContent || textContent;
    });

    onSave({ reviews: normalized });
    // Close the dialog after local update
    setTimeout(() => {
      const closeButton = document.querySelector('[aria-label="Close dialog"]') as HTMLButtonElement | null;
      closeButton?.click();
    }, 50);
  };

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-card-foreground hover:bg-muted">
        <Quote className="h-4 w-4" />
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-card border border-border rounded-lg shadow-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <MorphingDialogClose />
          <div className="p-6 space-y-6">
            <MorphingDialogTitle className="text-lg font-semibold">Настройки отзывов</MorphingDialogTitle>

            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="space-y-2 rounded-md border border-border p-3 bg-card">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Отзыв #{i + 1}</label>
                    <button
                      type="button"
                      onClick={() => removeReview(i)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border hover:bg-muted text-muted-foreground"
                      aria-label="Remove review"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-xs font-medium">Имя</label>
                    <Input
                      value={getRichTextContent(r.name)}
                      onChange={(e) => updateReview(i, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Текст</label>
                    <Textarea
                      rows={3}
                      value={getRichTextContent(r.text)}
                      onChange={(e) => updateReview(i, "text", e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <div>
                <button
                  type="button"
                  onClick={addReview}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium hover:bg-muted text-card-foreground"
                >
                  <Plus className="h-4 w-4" /> Добавить отзыв
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="button" onClick={handleSave} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Сохранить</button>
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}


