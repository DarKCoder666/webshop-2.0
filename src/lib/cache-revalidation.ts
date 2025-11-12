'use server';

import { revalidateTag } from 'next/cache';

/**
 * Server action to revalidate layout cache
 * This must be a server action as revalidateTag can only be used in server context
 */
export async function revalidateLayoutsCache(): Promise<void> {
  revalidateTag('layouts');
}

/**
 * Server action to revalidate site config cache
 */
export async function revalidateSiteConfigCache(): Promise<void> {
  revalidateTag('site-config');
  revalidateTag('layouts');
}

