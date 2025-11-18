'use client'
import Link from 'next/link'

import { Menu, X } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { CartButtonWithDialog } from '@/components/cart/cart-dialog'
import { useProductCategories } from '@/queries/products'
import useClickOutside from '@/components/motion-primitives/useClickOutside'
import { SiteConfig } from '@/lib/builder-types'
import { getAllLayouts } from '@/api/webshop-api'
import { LanguageSwitcher } from '@/components/sections/header/language-switcher'
import { t, useI18n } from '@/lib/i18n'
import type { LanguageCode } from '@/lib/stores/language-store'
import { useAuthStore } from '@/lib/stores/auth-store'
import { Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const HeroHeader = ({ config }: { config?: SiteConfig }) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)
    const [mobileCategoriesOpen, setMobileCategoriesOpen] = React.useState(false)
    const [desktopCategoriesOpen, setDesktopCategoriesOpen] = React.useState(false)
    const desktopCategoriesRef = React.useRef<HTMLLIElement>(null)
    const { data: categoriesData } = useProductCategories()
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => { setMounted(true) }, [])
    const langForSSR: LanguageCode | undefined = mounted ? undefined : 'ru'
    const tt = useI18n()
    const categories = categoriesData?.results || []
    
    // Get initial values from config if available, otherwise use defaults
    const getInitialNavSettings = () => {
        if (config) {
            const navBlock = config.blocks.find((b) => b.type === 'navigation')
            const props = (navBlock?.props as any) || {}
            return {
                logoImageSrc: (props.logoImageSrc as string) || '/billy.svg',
                logoText: (props.logoText?.text as string) || '',
                showCartIcon: props.showCartIcon !== false,
                menuItems: (props.menuItems as Array<{ name: string; href: string }>) || []
            }
        }
        // Default values to prevent flash
        return {
            logoImageSrc: '/billy.svg',
            logoText: '',
            showCartIcon: true,
            menuItems: []
        }
    }
    
    const initialSettings = getInitialNavSettings()
    const [navLogoImageSrc, setNavLogoImageSrc] = React.useState<string>(initialSettings.logoImageSrc)
    const [navLogoText, setNavLogoText] = React.useState<string>(initialSettings.logoText)
    const [navShowCartIcon, setNavShowCartIcon] = React.useState<boolean>(initialSettings.showCartIcon)
    const [navMenuItems, setNavMenuItems] = React.useState<Array<{ name: string; href: string }>>(initialSettings.menuItems)
    const { isAuthenticated, checkAuth, logout } = useAuthStore()
    const router = useRouter()

    useClickOutside(desktopCategoriesRef as React.RefObject<HTMLElement>, () => setDesktopCategoriesOpen(false))

    // Check authentication on mount
    React.useEffect(() => {
        checkAuth()
    }, [checkAuth])

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    React.useEffect(() => {
        const applyFromConfig = (cfg: SiteConfig) => {
            const navBlock = cfg.blocks.find((b) => b.type === 'navigation')
            const props = (navBlock?.props as any) || {}
            // Use default logo if none is set
            setNavLogoImageSrc((props.logoImageSrc as string) || '/billy.svg')
            setNavLogoText((props.logoText?.text as string) || '')
            setNavShowCartIcon(props.showCartIcon !== false)
            const items = (props.menuItems as Array<{ name: string; href: string }>) || []
            setNavMenuItems(items)
        }
        if (config) {
            applyFromConfig(config)
            return
        }
        let mounted = true
        const loadNav = async () => {
            try {
                const layouts = await getAllLayouts()
                const home = layouts.find((l) => l.pageType === 'home')
                if (home && mounted) {
                    applyFromConfig(home.config)
                }
            } catch (e) {
                console.error('Failed to load navigation settings for header', e)
            }
        }
        loadNav()
        return () => { mounted = false }
    }, [config])

    // Listen for navigation updates from builder
    React.useEffect(() => {
        const handleNavigationUpdate = (event: Event) => {
            const customEvent = event as CustomEvent
            const settings = customEvent.detail
            
            // If event has settings data, apply it immediately (from builder)
            if (settings) {
                setNavLogoImageSrc(settings.logoImageSrc || '/billy.svg')
                setNavLogoText(settings.logoText || '')
                setNavShowCartIcon(settings.showCartIcon !== false)
                setNavMenuItems(settings.menuItems || [])
            } else {
                // Fallback: re-fetch from API if no data in event
                (async () => {
                    try {
                        const layouts = await getAllLayouts()
                        const home = layouts.find((l) => l.pageType === 'home')
                        if (home) {
                            const navBlock = home.config.blocks.find((b) => b.type === 'navigation')
                            const props = (navBlock?.props as any) || {}
                            setNavLogoImageSrc((props.logoImageSrc as string) || '/billy.svg')
                            setNavLogoText((props.logoText?.text as string) || '')
                            setNavShowCartIcon(props.showCartIcon !== false)
                            const items = (props.menuItems as Array<{ name: string; href: string }>) || []
                            setNavMenuItems(items)
                        }
                    } catch (e) {
                        console.error('Failed to reload navigation after update', e)
                    }
                })()
            }
        }
        
        window.addEventListener('navigationUpdated', handleNavigationUpdate)
        return () => window.removeEventListener('navigationUpdated', handleNavigationUpdate)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed z-[100] w-full px-2">
                <div
                    className={cn(
                        isScrolled
                            ? 'mx-auto mt-2 max-w-4xl px-4 transition-all duration-300 lg:px-5 rounded-2xl border border-border bg-card/70 backdrop-blur-xl shadow-lg'
                            : 'container mx-auto mt-2 px-4 md:px-10 lg:px-16 transition-all duration-300'
                    )}
                >
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-1.5 lg:gap-0 lg:py-4">
                        {/* Mobile layout */}
                        <div className="relative flex w-full items-center justify-between lg:hidden">
                            {/* Hamburger - Left */}
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 flex cursor-pointer items-center justify-center">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 size-6 duration-200 text-foreground" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 size-6 -rotate-180 scale-0 opacity-0 duration-200 text-foreground" />
                            </button>
                            
                            {/* Logo - Center (absolutely positioned) */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                <div className="pointer-events-auto">
                                    <Link
                                        href="/"
                                        aria-label="home"
                                        className="flex items-center space-x-2">
                                        <Image 
                                            src={navLogoImageSrc || '/billy.svg'} 
                                            alt="logo" 
                                            width={100} 
                                            height={40} 
                                            className="h-5 w-auto object-contain"
                                            style={{ width: 'auto' }}
                                            priority
                                        />
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Cart - Right */}
                            <div className="flex items-center z-20">
                                {navShowCartIcon && <CartButtonWithDialog />}
                            </div>
                        </div>

                        {/* Desktop logo - Left */}
                        <Link
                            href="/"
                            aria-label="home"
                            className="hidden lg:flex items-center space-x-2 lg:w-auto">
                            <Image 
                                src={navLogoImageSrc || '/billy.svg'} 
                                alt="logo" 
                                width={100} 
                                height={40} 
                                className="h-10 w-auto object-contain"
                                style={{ width: 'auto' }}
                                priority
                            />
                        </Link>

                        {/* Desktop menu - Center */}
                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
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
                                {navMenuItems
                                    .filter((it) => it.href !== '/catalog' && it.name?.toLowerCase?.() !== 'catalog')
                                    .map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="block text-muted-foreground duration-150 hover:text-primary">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-card in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border p-6 shadow-2xl md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                            <div className="lg:hidden">
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
                                            <div className="mt-3 space-y-1 rounded-lg border border-border bg-card p-2 max-h-60 overflow-y-auto overscroll-contain">
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
                                    {navMenuItems
                                        .filter((it) => it.href !== '/catalog' && it.name?.toLowerCase?.() !== 'catalog')
                                        .map((item, index) => (
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
                                    {isAuthenticated && (
                                        <>
                                            <Link
                                                href="/builder"
                                                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                            >
                                                <Settings size={16} />
                                                <span>Builder</span>
                                            </Link>
                                            <button
                                                onClick={async () => {
                                                    await logout()
                                                    router.push('/')
                                                }}
                                                className="flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
                                                title="Logout"
                                            >
                                                <LogOut size={16} />
                                            </button>
                                        </>
                                    )}
                                    {navShowCartIcon && <CartButtonWithDialog className="hidden lg:inline-flex" />}
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