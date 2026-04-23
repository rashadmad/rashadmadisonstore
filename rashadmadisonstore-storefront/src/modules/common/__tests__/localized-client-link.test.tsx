import React from 'react'
import { render, screen } from '@testing-library/react'

import LocalizedClientLink from '../components/localized-client-link'

// Mock Next.js components and hooks
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props} data-testid="next-link">{children}</a>
  }
})

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

const mockUseParams = require('next/navigation').useParams

describe('LocalizedClientLink Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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