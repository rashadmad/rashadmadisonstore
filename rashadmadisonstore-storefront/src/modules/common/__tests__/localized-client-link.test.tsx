import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { NavigationContext } from '@lib/context/navigation'

import LocalizedClientLink from '../components/localized-client-link'

// Mock Next.js components and hooks
jest.mock('next/link', () => {
  return function MockLink({ children, href, onNavigate, onClick, ...props }: any) {
    return <a href={href} {...props} data-testid="next-link" onClick={(event) => {
      onClick?.(event)
      if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && props.target !== "_blank") {
        onNavigate?.({ preventDefault: () => event.preventDefault() })
      }
    }}>{children}</a>
  }
})

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

const mockUseParams = require('next/navigation').useParams

describe('LocalizedClientLink Component', () => {
  const router = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('tracks internal navigation while preserving scroll options', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })
    render(
      <NavigationContext.Provider value={router}>
        <LocalizedClientLink href="/checkout?step=payment" scroll={false}>Payment</LocalizedClientLink>
      </NavigationContext.Provider>
    )
    fireEvent.click(screen.getByText('Payment'))
    expect(router.push).toHaveBeenCalledWith('/us/checkout?step=payment', { scroll: false })
  })

  it('preserves replace navigation', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })
    render(
      <NavigationContext.Provider value={router}>
        <LocalizedClientLink href="/cart" replace>Cart</LocalizedClientLink>
      </NavigationContext.Provider>
    )
    fireEvent.click(screen.getByText('Cart'))
    expect(router.replace).toHaveBeenCalledWith('/us/cart', { scroll: undefined })
    expect(router.push).not.toHaveBeenCalled()
  })

  it('respects navigation cancellation', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })
    render(
      <NavigationContext.Provider value={router}>
        <LocalizedClientLink href="/cart" onNavigate={(event: { preventDefault: () => void }) => event.preventDefault()}>Cart</LocalizedClientLink>
      </NavigationContext.Provider>
    )
    fireEvent.click(screen.getByText('Cart'))
    expect(router.push).not.toHaveBeenCalled()
  })

  it('leaves modified clicks to Next.js instead of starting tracked navigation', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })
    render(
      <NavigationContext.Provider value={router}>
        <LocalizedClientLink href="/cart">Cart</LocalizedClientLink>
      </NavigationContext.Provider>
    )
    fireEvent.click(screen.getByText('Cart'), { metaKey: true })
    expect(router.push).not.toHaveBeenCalled()
  })

  it('should render with country code prepended to href', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    render(
      <LocalizedClientLink href="/products">
        <span>Products</span>
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/us/products')
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('should handle different country codes', () => {
    mockUseParams.mockReturnValue({ countryCode: 'ca' })

    render(
      <LocalizedClientLink href="/cart">
        Cart
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/ca/cart')
  })

  it('should handle href with leading slash', () => {
    mockUseParams.mockReturnValue({ countryCode: 'uk' })

    render(
      <LocalizedClientLink href="/checkout">
        Checkout
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/uk/checkout')
  })

  it('should pass through additional props to Link', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    render(
      <LocalizedClientLink
        href="/store"
        className="store-link"
        data-testid="next-link"
        onClick={() => {}}
      >
        Store
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/us/store')
    expect(link).toHaveClass('store-link')
  })

  it('should handle empty href', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    render(
      <LocalizedClientLink href="">
        Home
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/us')
  })

  it('should handle href without leading slash', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    render(
      <LocalizedClientLink href="products">
        Products
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/usproducts')
  })

  it('should handle complex href with query parameters', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    render(
      <LocalizedClientLink href="/search?q=shoes&page=1">
        Search Results
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/us/search?q=shoes&page=1')
  })

  it('should handle href with hash fragments', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    render(
      <LocalizedClientLink href="/products#featured">
        Featured Products
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/us/products#featured')
  })

  it('should handle undefined countryCode gracefully', () => {
    mockUseParams.mockReturnValue({})

    render(
      <LocalizedClientLink href="/products">
        Products
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/undefined/products')
  })

  it('should handle null countryCode gracefully', () => {
    mockUseParams.mockReturnValue({ countryCode: null })

    render(
      <LocalizedClientLink href="/products">
        Products
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/null/products')
  })

  it('should render children correctly', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    render(
      <LocalizedClientLink href="/test">
        <div>
          <span>Child 1</span>
          <span>Child 2</span>
        </div>
      </LocalizedClientLink>
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('should handle dynamic href construction', () => {
    mockUseParams.mockReturnValue({ countryCode: 'us' })

    const dynamicHref = '/categories/electronics'

    render(
      <LocalizedClientLink href={dynamicHref}>
        Electronics
      </LocalizedClientLink>
    )

    const link = screen.getByTestId('next-link')
    expect(link).toHaveAttribute('href', '/us/categories/electronics')
  })
})