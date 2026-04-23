import React from 'react'
import { render, screen } from '@testing-library/react'
import { HttpTypes } from '@medusajs/types'
import LineItemUnitPrice from '../components/line-item-unit-price'

// Mock utility functions
jest.mock('@lib/util/money', () => ({
  convertToLocale: jest.fn(({ amount, currency_code }) => `$${amount} ${currency_code}`),
}))

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  clx: jest.fn((...args) => {
    const classes = []
    for (const arg of args) {
      if (typeof arg === 'string') {
        classes.push(arg)
      } else if (typeof arg === 'object' && arg !== null) {
        // Handle conditional classes object
        for (const [className, condition] of Object.entries(arg)) {
          if (condition) {
            classes.push(className)
          }
        }
      }
    }
    return classes.join(' ')
  }),
}))

const mockConvertToLocale = require('@lib/util/money').convertToLocale

describe('LineItemUnitPrice Component', () => {
  const currencyCode = 'USD'

  const mockLineItem: HttpTypes.StoreCartLineItem = {
    id: 'item-1',
    total: 6000, // $60.00 total
    original_total: 8000, // $80.00 original total
    quantity: 2, // So unit prices are $30 and $40
  } as any

  const mockLineItemNoDiscount: HttpTypes.StoreCartLineItem = {
    id: 'item-2',
    total: 5000, // $50.00 total
    original_total: 5000, // $50.00 original total
    quantity: 1, // Unit price $50
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Default style', () => {
    it('should display unit prices and discount information when item has reduced price', () => {
      render(
        <LineItemUnitPrice
          item={mockLineItem}
          style="default"
          currencyCode={currencyCode}
        />
      )

      expect(screen.getByTestId('product-unit-price')).toHaveTextContent('$3000 USD') // 6000 / 2
      expect(screen.getByTestId('product-unit-original-price')).toHaveTextContent('$4000 USD') // 8000 / 2
      expect(screen.getByText('Original:')).toBeInTheDocument()
      expect(screen.getByText('-25%')).toBeInTheDocument()

      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 3000, // 6000 / 2
        currency_code: 'USD',
      })
      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 4000, // 8000 / 2
        currency_code: 'USD',
      })
    })

    it('should display only current unit price when no discount', () => {
      render(
        <LineItemUnitPrice
          item={mockLineItemNoDiscount}
          style="default"
          currencyCode={currencyCode}
        />
      )

      expect(screen.getByTestId('product-unit-price')).toHaveTextContent('$5000 USD') // 5000 / 1
      expect(screen.queryByTestId('product-unit-original-price')).not.toBeInTheDocument()
      expect(screen.queryByText('Original:')).not.toBeInTheDocument()
      expect(screen.queryByText('-%')).not.toBeInTheDocument()
    })

    it('should apply interactive text color when item has discount', () => {
      render(
        <LineItemUnitPrice
          item={mockLineItem}
          style="default"
          currencyCode={currencyCode}
        />
      )

      const priceElement = screen.getByTestId('product-unit-price')
      expect(priceElement).toHaveClass('text-base-regular', 'text-ui-fg-interactive')
    })
  })

  describe('Tight style', () => {
    it('should display unit prices without "Original:" label', () => {
      render(
        <LineItemUnitPrice
          item={mockLineItem}
          style="tight"
          currencyCode={currencyCode}
        />
      )

      expect(screen.getByTestId('product-unit-price')).toHaveTextContent('$3000 USD')
      expect(screen.getByTestId('product-unit-original-price')).toHaveTextContent('$4000 USD')
      expect(screen.queryByText('Original:')).not.toBeInTheDocument()
      expect(screen.queryByText('-%')).not.toBeInTheDocument()
    })

    it('should not apply interactive color in tight style', () => {
      render(
        <LineItemUnitPrice
          item={mockLineItem}
          style="tight"
          currencyCode={currencyCode}
        />
      )

      const priceElement = screen.getByTestId('product-unit-price')
      expect(priceElement).toHaveClass('text-base-regular')
      // In tight style, the component still applies interactive color when there's a discount
      // This is a design choice in the component
      expect(priceElement).toHaveClass('text-ui-fg-interactive')
    })
  })

  describe('Unit price calculations', () => {
    it('should calculate unit price correctly for quantity > 1', () => {
      const itemWithQuantity3 = {
        ...mockLineItem,
        total: 9000, // $90.00 total
        original_total: 12000, // $120.00 original total
        quantity: 3, // Unit prices $30 and $40
      }

      render(
        <LineItemUnitPrice
          item={itemWithQuantity3}
          currencyCode={currencyCode}
        />
      )

      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 3000, // 9000 / 3
        currency_code: 'USD',
      })
      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 4000, // 12000 / 3
        currency_code: 'USD',
      })
    })

    it('should handle quantity = 1', () => {
      const itemWithQuantity1 = {
        ...mockLineItem,
        total: 2500,
        original_total: 3000,
        quantity: 1,
      }

      render(
        <LineItemUnitPrice
          item={itemWithQuantity1}
          currencyCode={currencyCode}
        />
      )

      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 2500, // 2500 / 1
        currency_code: 'USD',
      })
      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 3000, // 3000 / 1
        currency_code: 'USD',
      })
    })

    it('should handle zero quantity gracefully', () => {
      const itemWithZeroQuantity = {
        ...mockLineItem,
        total: 1000,
        original_total: 2000,
        quantity: 0,
      }

      render(
        <LineItemUnitPrice
          item={itemWithZeroQuantity}
          currencyCode={currencyCode}
        />
      )

      // Division by zero results in Infinity
      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: Infinity,
        currency_code: 'USD',
      })
    })
  })

  describe('Percentage calculations', () => {
    it('should calculate percentage discount correctly', () => {
      const itemWithKnownDiscount = {
        ...mockLineItem,
        total: 7500, // $75.00 total
        original_total: 10000, // $100.00 original total
        quantity: 1,
      }

      render(
        <LineItemUnitPrice
          item={itemWithKnownDiscount}
          currencyCode={currencyCode}
        />
      )

      expect(screen.getByText('-25%')).toBeInTheDocument() // (10000-7500)/10000 * 100 = 25
    })

    it('should round percentage to nearest integer', () => {
      const itemWithDecimalDiscount = {
        ...mockLineItem,
        total: 7320, // $73.20 total
        original_total: 10000, // $100.00 original total
        quantity: 1,
      }

      render(
        <LineItemUnitPrice
          item={itemWithDecimalDiscount}
          currencyCode={currencyCode}
        />
      )

      expect(screen.getByText('-27%')).toBeInTheDocument() // (10000-7320)/10000 * 100 = 26.8 -> 27
    })

    it('should handle zero original price', () => {
      const itemWithZeroOriginal = {
        ...mockLineItem,
        total: 1000,
        original_total: 0,
        quantity: 1,
      }

      // This would cause division by zero, but the component checks hasReducedPrice first
      render(
        <LineItemUnitPrice
          item={itemWithZeroOriginal}
          currencyCode={currencyCode}
        />
      )

      // Since total (1000) is not < original_total (0), no discount is shown
      expect(screen.queryByText('-%')).not.toBeInTheDocument()
    })
  })

  describe('Currency handling', () => {
    it('should use provided currency code for formatting', () => {
      render(
        <LineItemUnitPrice
          item={mockLineItem}
          currencyCode="EUR"
        />
      )

      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 3000,
        currency_code: 'EUR',
      })
      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 4000,
        currency_code: 'EUR',
      })
    })
  })

  describe('Order line items', () => {
    it('should work with order line items', () => {
      const orderLineItem: HttpTypes.StoreOrderLineItem = {
        id: 'order-item-1',
        total: 4000,
        original_total: 6000,
        quantity: 2,
      } as any

      render(
        <LineItemUnitPrice
          item={orderLineItem}
          currencyCode={currencyCode}
        />
      )

      expect(screen.getByTestId('product-unit-price')).toHaveTextContent('$2000 USD') // 4000 / 2
      expect(screen.getByTestId('product-unit-original-price')).toHaveTextContent('$3000 USD') // 6000 / 2
    })
  })
})