import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductPrice from '../components/product-price'
import { HttpTypes } from '@medusajs/types'

// Mock utility function
jest.mock('@lib/util/get-product-price', () => ({
  getProductPrice: jest.fn(({ product, variantId }) => {
    if (variantId === 'variant-sale') {
      return {
        cheapestPrice: {
          calculated_price: '$99.99',
          calculated_price_number: 99.99,
          price_type: 'regular',
        },
        variantPrice: {
          calculated_price: '$49.99',
          calculated_price_number: 49.99,
          price_type: 'sale',
        },
      }
    }
    return {
      cheapestPrice: {
        calculated_price: '$99.99',
        calculated_price_number: 99.99,
        price_type: 'regular',
      },
      variantPrice: null,
    }
  }),
}))

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  clx: jest.fn((...args) => args.join(' ')),
}))

describe('Product Price', () => {
  const mockProduct: HttpTypes.StoreProduct = {
    id: 'product-1',
    title: 'Test Product',
  }

  const mockVariant: HttpTypes.StoreProductVariant = {
    id: 'variant-1',
    title: 'Test Variant',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render product price', () => {
    render(React.createElement(ProductPrice, { product: mockProduct }))
    expect(screen.getByTestId('product-price')).toBeInTheDocument()
  })

  it('should display price text', () => {
    render(React.createElement(ProductPrice, { product: mockProduct }))
    expect(screen.getByText('$99.99')).toBeInTheDocument()
  })

  it('should show "From" prefix when no variant selected', () => {
    render(React.createElement(ProductPrice, { product: mockProduct }))
    expect(screen.getByText(/From/)).toBeInTheDocument()
  })

  it('should not show "From" prefix when variant is selected', () => {
    const { container } = render(React.createElement(ProductPrice, { product: mockProduct, variant: mockVariant }))
    const fromText = container.textContent?.includes('From')
    expect(fromText).toBeFalsy()
  })

  it('should display sale price when available', () => {
    const saleVariant = { ...mockVariant, id: 'variant-sale' }
    render(React.createElement(ProductPrice, { product: mockProduct, variant: saleVariant }))
    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })

  it('should have price data attributes', () => {
    render(React.createElement(ProductPrice, { product: mockProduct }))
    const priceElement = screen.getByTestId('product-price')
    expect(priceElement).toHaveAttribute('data-value', '99.99')
  })

  it('should handle missing price gracefully', () => {
    const { getProductPrice } = require('@lib/util/get-product-price')
    getProductPrice.mockReturnValue({
      cheapestPrice: null,
      variantPrice: null,
    })
    
    const { container } = render(React.createElement(ProductPrice, { product: mockProduct }))
    expect(container.querySelector('[class*="animate-pulse"]')).toBeInTheDocument()
  })
})
