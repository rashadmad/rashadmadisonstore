import React from 'react'
import { render, screen } from '@testing-library/react'
import CartTotals from '../components/cart-totals'

// Mock utility functions
jest.mock('@lib/util/money', () => ({
  convertToLocale: jest.fn(({ amount, currency_code }) => `$${amount} ${currency_code}`),
}))

const mockConvertToLocale = require('@lib/util/money').convertToLocale

describe('CartTotals Component', () => {
  const baseTotals = {
    currency_code: 'USD',
    total: 12500, // $125.00
    subtotal: 10000, // $100.00
    tax_total: 1250, // $12.50
    item_subtotal: 10000, // $100.00
    shipping_subtotal: 1000, // $10.00
    discount_subtotal: 0,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all cart totals correctly', () => {
    render(<CartTotals totals={baseTotals} />)

    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('$10000 USD')
    expect(screen.getByTestId('cart-shipping')).toHaveTextContent('$1000 USD')
    expect(screen.getByTestId('cart-taxes')).toHaveTextContent('$1250 USD')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$12500 USD')

    expect(screen.getByText('Subtotal (excl. shipping and taxes)')).toBeInTheDocument()
    expect(screen.getByText('Shipping')).toBeInTheDocument()
    expect(screen.getByText('Taxes')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('should include data-value attributes for testing', () => {
    render(<CartTotals totals={baseTotals} />)

    expect(screen.getByTestId('cart-subtotal')).toHaveAttribute('data-value', '10000')
    expect(screen.getByTestId('cart-shipping')).toHaveAttribute('data-value', '1000')
    expect(screen.getByTestId('cart-taxes')).toHaveAttribute('data-value', '1250')
    expect(screen.getByTestId('cart-total')).toHaveAttribute('data-value', '12500')
  })

  it('should not render discount section when discount_subtotal is 0', () => {
    render(<CartTotals totals={baseTotals} />)

    expect(screen.queryByTestId('cart-discount')).not.toBeInTheDocument()
    expect(screen.queryByText('Discount')).not.toBeInTheDocument()
  })

  it('should not render discount section when discount_subtotal is null', () => {
    const totalsWithoutDiscount = {
      ...baseTotals,
      discount_subtotal: null,
    }

    render(<CartTotals totals={totalsWithoutDiscount} />)

    expect(screen.queryByTestId('cart-discount')).not.toBeInTheDocument()
    expect(screen.queryByText('Discount')).not.toBeInTheDocument()
  })

  it('should not render discount section when discount_subtotal is undefined', () => {
    const totalsWithoutDiscount = {
      ...baseTotals,
      discount_subtotal: undefined,
    }

    render(<CartTotals totals={totalsWithoutDiscount} />)

    expect(screen.queryByTestId('cart-discount')).not.toBeInTheDocument()
    expect(screen.queryByText('Discount')).not.toBeInTheDocument()
  })

  it('should render discount section when discount_subtotal is greater than 0', () => {
    const totalsWithDiscount = {
      ...baseTotals,
      discount_subtotal: 2500, // $25.00 discount
      total: 10000, // Adjusted total
    }

    render(<CartTotals totals={totalsWithDiscount} />)

    expect(screen.getByTestId('cart-discount')).toHaveTextContent('- $2500 USD')
    expect(screen.getByTestId('cart-discount')).toHaveAttribute('data-value', '2500')
    expect(screen.getByTestId('cart-discount')).toHaveClass('text-ui-fg-interactive')
    expect(screen.getByText('Discount')).toBeInTheDocument()
  })

  it('should handle zero values correctly', () => {
    const totalsWithZeros = {
      ...baseTotals,
      total: 0,
      subtotal: 0,
      tax_total: 0,
      item_subtotal: 0,
      shipping_subtotal: 0,
      discount_subtotal: 0,
    }

    render(<CartTotals totals={totalsWithZeros} />)

    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-shipping')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-taxes')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$0 USD')
  })

  it('should handle null values with fallbacks to 0', () => {
    const totalsWithNulls = {
      currency_code: 'USD',
      total: null,
      subtotal: null,
      tax_total: null,
      item_subtotal: null,
      shipping_subtotal: null,
      discount_subtotal: null,
    }

    render(<CartTotals totals={totalsWithNulls} />)

    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-shipping')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-taxes')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$0 USD')
  })

  it('should handle undefined values with fallbacks to 0', () => {
    const totalsWithUndefined = {
      currency_code: 'USD',
      total: undefined,
      subtotal: undefined,
      tax_total: undefined,
      item_subtotal: undefined,
      shipping_subtotal: undefined,
      discount_subtotal: undefined,
    }

    render(<CartTotals totals={totalsWithUndefined} />)

    expect(screen.getByTestId('cart-subtotal')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-shipping')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-taxes')).toHaveTextContent('$0 USD')
    expect(screen.getByTestId('cart-total')).toHaveTextContent('$0 USD')
  })

  it('should use correct currency code for all price formatting', () => {
    const totalsEUR = {
      ...baseTotals,
      currency_code: 'EUR',
    }

    render(<CartTotals totals={totalsEUR} />)

    expect(mockConvertToLocale).toHaveBeenCalledWith({
      amount: 10000,
      currency_code: 'EUR',
    })
    expect(mockConvertToLocale).toHaveBeenCalledWith({
      amount: 1000,
      currency_code: 'EUR',
    })
    expect(mockConvertToLocale).toHaveBeenCalledWith({
      amount: 1250,
      currency_code: 'EUR',
    })
    expect(mockConvertToLocale).toHaveBeenCalledWith({
      amount: 12500,
      currency_code: 'EUR',
    })
  })

  it('should handle different currency codes', () => {
    const totalsGBP = {
      ...baseTotals,
      currency_code: 'GBP',
    }

    render(<CartTotals totals={totalsGBP} />)

    const calls = mockConvertToLocale.mock.calls
    calls.forEach(call => {
      expect(call[0].currency_code).toBe('GBP')
    })
  })

  it('should render discount with negative sign and proper formatting', () => {
    const totalsWithDiscount = {
      ...baseTotals,
      discount_subtotal: 5000, // $50.00 discount
    }

    render(<CartTotals totals={totalsWithDiscount} />)

    expect(screen.getByTestId('cart-discount')).toHaveTextContent('- $5000 USD')
    expect(mockConvertToLocale).toHaveBeenCalledWith({
      amount: 5000,
      currency_code: 'USD',
    })
  })

  it('should maintain proper layout structure', () => {
    render(<CartTotals totals={baseTotals} />)

    // Check that the component has the expected structure
    const container = screen.getByTestId('cart-total').closest('div')
    expect(container).toBeInTheDocument()

    // Check for separator lines (represented as hr-like elements)
    const separators = document.querySelectorAll('.border-b')
    expect(separators).toHaveLength(2)
  })
})