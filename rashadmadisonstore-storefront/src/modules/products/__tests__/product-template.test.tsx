import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductTemplate from '../templates'
import { HttpTypes } from '@medusajs/types'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound')
  }),
}))

// Mock React Suspense
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }: any) => children,
}))

// Mock components
jest.mock('@modules/products/components/image-gallery', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'image-gallery' }, 'Image Gallery'),
}))

jest.mock('@modules/products/components/product-onboarding-cta', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'onboarding-cta' }, 'Onboarding CTA'),
}))

jest.mock('@modules/products/components/product-tabs', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'product-tabs' }, 'Product Tabs'),
}))

jest.mock('@modules/products/components/related-products', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'related-products' }, 'Related Products'),
}))

jest.mock('@modules/products/templates/product-info', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'product-info' }, 'Product Info'),
}))

jest.mock('@modules/products/templates/product-actions-wrapper', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'product-actions-wrapper' }, 'Actions Wrapper'),
}))

jest.mock('@modules/skeletons/templates/skeleton-related-products', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'skeleton-related' }, 'Loading...'),
}))

const mockNotFound = require('next/navigation').notFound

describe('Product Template', () => {
  const mockProduct: HttpTypes.StoreProduct = {
    id: 'product-1',
    title: 'Test Product',
    handle: 'test-product',
    description: 'A great product',
  }

  const mockRegion: HttpTypes.StoreRegion = {
    id: 'region-1',
    name: 'US',
    currency_code: 'usd',
  }

  const mockImages: HttpTypes.StoreProductImage[] = [
    { id: 'img-1', url: 'image1.jpg' },
    { id: 'img-2', url: 'image2.jpg' },
  ]

  const defaultProps = {
    product: mockProduct,
    region: mockRegion,
    countryCode: 'us',
    images: mockImages,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render product container', () => {
    render(React.createElement(ProductTemplate, defaultProps))
    expect(screen.getByTestId('product-container')).toBeInTheDocument()
  })

  it('should render product info', () => {
    render(React.createElement(ProductTemplate, defaultProps))
    expect(screen.getByTestId('product-info')).toBeInTheDocument()
  })

  it('should render product tabs', () => {
    render(React.createElement(ProductTemplate, defaultProps))
    expect(screen.getByTestId('product-tabs')).toBeInTheDocument()
  })

  it('should render image gallery', () => {
    render(React.createElement(ProductTemplate, defaultProps))
    expect(screen.getByTestId('image-gallery')).toBeInTheDocument()
  })

  it('should render onboarding CTA', () => {
    render(React.createElement(ProductTemplate, defaultProps))
    expect(screen.getByTestId('onboarding-cta')).toBeInTheDocument()
  })

  it('should render product actions wrapper', () => {
    render(React.createElement(ProductTemplate, defaultProps))
    expect(screen.getByTestId('product-actions-wrapper')).toBeInTheDocument()
  })

  it('should render related products', () => {
    render(React.createElement(ProductTemplate, defaultProps))
    expect(screen.getByTestId('related-products')).toBeInTheDocument()
  })

  it('should call notFound when product is null', () => {
    expect(() => {
      render(React.createElement(ProductTemplate, { ...defaultProps, product: null as any }))
    }).toThrow('notFound')
  })

  it('should call notFound when product has no id', () => {
    expect(() => {
      render(React.createElement(ProductTemplate, { ...defaultProps, product: { ...mockProduct, id: undefined } as any }))
    }).toThrow('notFound')
  })

  it('should handle product with multiple images', () => {
    const multiImageProduct = {
      ...defaultProps,
      images: [
        { id: 'img-1', url: 'image1.jpg' },
        { id: 'img-2', url: 'image2.jpg' },
        { id: 'img-3', url: 'image3.jpg' },
      ],
    }
    render(React.createElement(ProductTemplate, multiImageProduct))
    expect(screen.getByTestId('image-gallery')).toBeInTheDocument()
  })
})
