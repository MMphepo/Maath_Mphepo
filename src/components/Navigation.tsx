'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigationItems = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Writing', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="portfolio-nav">
      <div className="portfolio-nav__inner">
        <Link className="portfolio-wordmark" href="/" onClick={() => setMenuOpen(false)}>
          Maath Mphepo
        </Link>
        <button
          aria-expanded={menuOpen}
          aria-controls="portfolio-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="portfolio-menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span>{menuOpen ? 'Close' : 'Menu'}</span>
        </button>
        <nav
          aria-label="Main navigation"
          className={`portfolio-menu${menuOpen ? ' is-open' : ''}`}
          id="portfolio-navigation"
        >
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/work' && pathname.startsWith('/work/'))

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className="portfolio-menu__link"
                href={item.href}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
