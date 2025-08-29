'use client'

import React from 'react';
import { useLanguageStore, LanguageCode } from '@/lib/stores/language-store';

export function LanguageSwitcher() {
  const language = useLanguageStore(s => s.language);
  const setLanguage = useLanguageStore(s => s.setLanguage);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode);
  };

  return (
    <select
      value={language}
      onChange={handleChange}
      aria-label="Language"
      className="rounded-md border border-border bg-card text-card-foreground px-2 py-1 text-xs"
    >
      <option value="ru">RU</option>
      <option value="en">EN</option>
      <option value="uz">UZ</option>
    </select>
  );
}


