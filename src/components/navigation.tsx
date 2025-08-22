'use client'
import Link from 'next/link'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { DarkModeToggle } from '@/components/dark-mode-toggle'
import { SiteConfig, RichText } from '@/lib/builder-types'
import { RenderableText } from '@/components/builder/renderable-text'

const defaultMenuItems = [
    { name: 'Features', href: '#link' },
    { name: 'Solution', href: '#link' },
    { name: 'Pricing', href: '#link' },
    { name: 'About', href: '#link' },
]

export interface NavigationProps {
    config?: SiteConfig
    blockId?: string
    logoPosition?: 'left' | 'middle'
    logoText?: RichText
    logoImageSrc?: string
    menuItems?: Array<{ name: string; href: string }>
    cartCount?: number
    showCartIcon?: boolean
}

export const Navigation = ({ 
    config, 
    blockId,
    logoPosition = 'left',
    logoText = { text: 'Your Logo' },
    logoImageSrc = '/billy.svg',
    menuItems = defaultMenuItems,
    cartCount = 0,
    showCartIcon = true
}: NavigationProps) => {
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

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
            {logoImageSrc ? (
                <Image 
                    src={logoImageSrc} 
                    alt="logo" 
                    width={100} 
                    height={20} 
                    className="invert dark:invert-0" 
                />
            ) : (
                <RenderableText 
                    text={logoText} 
                    blockId={blockId} 
                    fieldKey="logoText"
                    className="text-lg font-semibold"
                />
            )}
        </Link>
    )

    const MenuItemsComponent = () => (
        <ul className="flex gap-8 text-sm">
            {menuItems.map((item, index) => (
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
        <div className="relative">
            <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                )}
            </Button>
        </div>
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
                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200 text-foreground" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 text-foreground" />
                            </button>
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
                                        <DarkModeToggle config={config} />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile menu */}
                        <div className="bg-card in-data-[state=active]:block lg:hidden mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-border p-6 shadow-2xl md:flex-nowrap">
                            <div>
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
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
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit md:items-center">
                                <div className="flex items-center gap-4">
                                    <CartIcon />
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
