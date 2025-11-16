'use client'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
// import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { CartButtonWithDialog } from '@/components/cart/cart-dialog'
import { SiteConfig } from '@/lib/builder-types'
import { LanguageSwitcher } from '@/components/sections/header/language-switcher'
import { t, useI18n } from '@/lib/i18n'
import type { LanguageCode } from '@/lib/stores/language-store'
import useClickOutside from '@/components/motion-primitives/useClickOutside'
import { useProductCategories } from '@/queries/products'


export interface NavigationProps {
    config?: SiteConfig
    blockId?: string
    logoPosition?: 'left' | 'middle'
    logoImageSrc?: string
    menuItems?: Array<{ name: string; href: string }>
    showCartIcon?: boolean
}

export const Navigation = ({ 
    config,
    blockId: _blockId,
    logoPosition = 'left',
    logoImageSrc = '/billy.svg',
    menuItems,
    showCartIcon = true
}: NavigationProps) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [desktopCategoriesOpen, setDesktopCategoriesOpen] = React.useState(false)
    const desktopCategoriesRef = React.useRef<HTMLLIElement>(null)
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => { setMounted(true) }, [])
    const langForSSR: LanguageCode | undefined = mounted ? undefined : 'ru'
    const tt = useI18n()

    const { data: categoriesData } = useProductCategories()
    const categories = categoriesData?.results || []

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const LogoComponent = () => (
        <Link
            href="/"
            aria-label="home"
            className="flex items-center space-x-2">
            <Image 
                src={logoImageSrc || '/billy.svg'} 
                alt="logo" 
                width={100} 
                height={40} 
                className="h-10 w-auto object-contain"
                style={{ width: 'auto' }}
                priority
            />
        </Link>
    )

    useClickOutside(desktopCategoriesRef as React.RefObject<HTMLElement>, () => setDesktopCategoriesOpen(false))

    const MenuItemsComponent = () => (
        <ul className="flex gap-8 text-sm">
            {/* Categories click-open panel */}
            <li ref={desktopCategoriesRef} className="relative">
                <button
                    onClick={() => setDesktopCategoriesOpen((v) => !v)}
                    className="text-muted-foreground duration-150 hover:text-primary"
                    aria-haspopup="menu"
                    aria-expanded={desktopCategoriesOpen}
                    aria-controls="desktop-categories-panel">
                    <span>{mounted ? tt('categories') : t('categories', langForSSR)}</span>
                </button>
                {desktopCategoriesOpen && (
                    <div
                        id="desktop-categories-panel"
                        className="absolute left-0 mt-2 z-50 w-[720px] rounded-lg border border-border bg-card p-4 shadow-2xl">
                        <div className="max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-3 gap-1">
                                {categories.length === 0 ? (
                                    <div className="col-span-3 px-2 py-1 text-sm text-muted-foreground">{mounted ? tt('no_categories') : t('no_categories', langForSSR)}</div>
                                ) : (
                                    categories.map((c) => (
                                        <Link
                                            key={c._id}
                                            href={`/category/${c._id}`}
                                            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                                            onClick={() => setDesktopCategoriesOpen(false)}>
                                            {c.name}
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </li>
            {/* Always show Catalog */}
            <li>
                <Link
                    href="/catalog"
                    className="block text-muted-foreground duration-150 hover:text-primary">
                    <span>{mounted ? tt('catalog') : t('catalog', langForSSR)}</span>
                </Link>
            </li>
            {menuItems?.map((item, index) => (
                <li key={index}>
                    <Link
                        href={item.href}
                        className="block text-muted-foreground duration-150 hover:text-primary">
                        <span>{item.name}</span>
                    </Link>
                </li>
            ))}
        </ul>
    )

    const CartIcon = () => showCartIcon && (
        <CartButtonWithDialog />
    )

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-50 w-full px-2">
                <div className={cn(
                    'mx-auto mt-2 max-w-7xl px-6 transition-all duration-300 lg:px-12', 
                    isScrolled && 'max-w-4xl rounded-2xl border border-border bg-card/70 backdrop-blur-xl shadow-lg lg:px-5'
                )}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        {/* Mobile layout */}
                        <div className="flex w-full justify-between lg:hidden">
                            <LogoComponent />
                            <div className="flex items-center gap-2">
                                <CartIcon />
                                <button
                                    onClick={() => setMenuState(!menuState)}
                                    aria-label={menuState ? (mounted ? tt('close_menu') : t('close_menu', langForSSR)) : (mounted ? tt('open_menu') : t('open_menu', langForSSR))}
                                    className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5">
                                    <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200 text-foreground" />
                                    <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 text-foreground" />
                                </button>
                            </div>
                        </div>

                        {/* Desktop layout */}
                        <div className="hidden lg:flex lg:w-full lg:items-center lg:justify-between">
                            {logoPosition === 'left' ? (
                                <>
                                    <LogoComponent />
                                    <div className="flex items-center">
                                        <MenuItemsComponent />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <CartIcon />
                                        <LanguageSwitcher />
                                        <DarkModeToggle config={config} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center">
                                        <MenuItemsComponent />
                                    </div>
                                    <div className="absolute inset-0 m-auto size-fit">
                                        <LogoComponent />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <CartIcon />
                                        <LanguageSwitcher />
                                        <DarkModeToggle config={config} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile menu */}
                        <div className="bg-card in-data-[state=active]:block lg:hidden mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border p-6 shadow-2xl md:flex-nowrap">
                            <div>
                                <ul className="space-y-6 text-base">
                                    {/* Categories collapsible */}
                                    <li>
                                        <button
                                            className="w-full text-left text-muted-foreground duration-150 hover:text-primary"
                                            onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                                            aria-expanded={mobileCategoriesOpen}>
                                            <span>{mounted ? tt('categories') : t('categories', langForSSR)}</span>
                                        </button>
                                        {mobileCategoriesOpen && (
                                            <div className="mt-3 space-y-1 rounded-lg border border-border bg-card p-2">
                                                {categories.length === 0 ? (
                                                    <div className="px-2 py-1 text-sm text-muted-foreground">{mounted ? tt('no_categories') : t('no_categories', langForSSR)}</div>
                                                ) : (
                                                    categories.map((c) => (
                                                        <Link
                                                            key={c._id}
                                                            href={`/category/${c._id}`}
                                                            className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent"
                                                            onClick={() => setMenuState(false)}>
                                                            {c.name}
                                                        </Link>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </li>
                                    {/* Always show Catalog */}
                                    <li>
                                        <Link
                                            href="/catalog"
                                            className="block text-muted-foreground duration-150 hover:text-primary"
                                            onClick={() => setMenuState(false)}>
                                            <span>{mounted ? tt('catalog') : t('catalog', langForSSR)}</span>
                                        </Link>
                                    </li>
                                    {menuItems?.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="block text-muted-foreground duration-150 hover:text-primary"
                                                onClick={() => setMenuState(false)}>
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit md:items-center">
                                <div className="flex items-center gap-4">
                                    <LanguageSwitcher />
                                    <DarkModeToggle config={config} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
