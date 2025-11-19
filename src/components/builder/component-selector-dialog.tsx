"use client";
import React from "react";
import { ComponentType } from "@/lib/builder-types";
import { Plus, Type, Image as ImageIcon, MousePointerClick } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export function ComponentSelectorDialog({ onPick }: { onPick: (type: ComponentType) => void }) {
    const [open, setOpen] = React.useState(false);
    
    const handlePick = (type: ComponentType) => {
        onPick(type);
        setOpen(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="secondary" className="rounded-full h-6 w-6 md:h-8 md:w-8 shadow-md bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{t('add_component') || "Add Component"}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
                     <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50" onClick={() => handlePick('text')}>
                        <Type className="h-8 w-8 text-primary" />
                        <span>Text</span>
                     </Button>
                     <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50" onClick={() => handlePick('button')}>
                        <MousePointerClick className="h-8 w-8 text-primary" />
                        <span>Button</span>
                     </Button>
                     <Button variant="outline" className="h-24 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50" onClick={() => handlePick('image')}>
                        <ImageIcon className="h-8 w-8 text-primary" />
                        <span>Image</span>
                     </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
