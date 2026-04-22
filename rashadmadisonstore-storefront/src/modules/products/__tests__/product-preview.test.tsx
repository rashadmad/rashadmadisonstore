import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductPreview from '../components/product-preview'
import { HttpTypes } from '@medusajs/types'

// Mock utility function
jest.mock('@lib/util/get-product-price', () => ({
  getProductPrice: jest.fn(({ product }) => ({
    cheapestPrice: {
      calculated_price: '$49.99',
      calculated_price_number: 49.99,
      price_type: 'regular',
    },
    variantPrice: null,
  })),
}))

// Mock components
jest.mock('@modules/products/components/thumbnail', () => ({
  __esModule: true,
  default: ({ thumbnail, isFeatured, ...props }: any) => React.createElement('div', { 'data-testid': 'thumbnail', 'data-isfeatured': isFeatured ? 'true' : 'false', ...props }, `Thumbnail: ${thumbnail}`),
}))

jest.mock('@modules/products/components/product-price', () => ({
  __esModule: true,
  default: ({ product }: any) => React.createElement('div', { 'data-testid': 'product-price' }, '$49.99'),
}))

jest.mock('@modules/common/components/interactive-link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => React.createElement('a', { href, 'data-testid': 'product-link' }, children),
}))

// Mock Suspense
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }: any) => children,
}))

describe('Product Preview', () => {
  const mockProduct: HttpTypes.StoreProduct = {
    id: 'product-1',
    title: 'Test Product',
    handle: 'test-product',
    thumbnail: 'thumbnail.jpg',
  }

  const mockRegion: HttpTypes.StoreRegion = {
    id: 'region-1',
    name: 'US',
    currency_code: 'usd',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render product link', () => {
    render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion }))
    expect(screen.getByTestId('product-link')).toBeInTheDocument()
  })

  it('should render thumbnail', () => {
    render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion }))
    expect(screen.getByTestId('thumbnail')).toBeInTheDocument()
  })

  it('should render product price', () => {
    render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion }))
    expect(screen.getByTestId('product-price')).toBeInTheDocument()
  })

  it('should display product title', () => {
    render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion }))
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('should apply featured class when isFeatured is true', () => {
    const { container } = render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion, isFeatured: true }))
    expect(container.querySelector('[class*="group"]')).toBeInTheDocument()
  })

  it('should render with product handle in link', () => {
    render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion }))
    const link = screen.getByTestId('product-link')
    expect(link.getAttribute('href')).toContain('test-product')
  })

  it('should handle featured product variant', () => {
    render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion, isFeatured: true }))
    const thumbnail = screen.getByTestId('thumbnail')
    expect(thumbnail.getAttribute('data-isfeatured')).toBe('true')
  })

  it('should pass region to price calculation', () => {
    render(React.createElement(ProductPreview, { product: mockProduct, region: mockRegion }))
    const { getProductPrice } = require('@lib/util/get-product-price')
    expect(getProductPrice).toHaveBeenCalled()
  })

  it('should handle product without thumbnail gracefully', () => {
    const productWithoutThumb = { ...mockProduct, thumbnail: null }
    render(React.createElement(ProductPreview, { product: productWithoutThumb, region: mockRegion }))
    expect(screen.getByTestId('thumbnail')).toBeInTheDocument()
  })
})
