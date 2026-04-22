import React from 'react'
import { render, screen } from '@testing-library/react'
import CheckoutSummary from '../templates/checkout-summary'
import { HttpTypes } from '@medusajs/types'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Heading: ({ children, ...props }: any) => React.createElement('h2', props, children),
}))

// Mock common components
jest.mock('@modules/cart/templates/preview', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'items-preview' }, 'Items Preview'),
}))

jest.mock('@modules/checkout/components/discount-code', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'discount-code' }, 'Discount Code'),
}))

jest.mock('@modules/common/components/cart-totals', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'cart-totals' }, 'Cart Totals'),
}))

jest.mock('@modules/common/components/divider', () => ({
  __esModule: true,
  default: () => React.createElement('hr', { 'data-testid': 'divider' }),
}))

describe('Checkout Summary', () => {
  const mockCart = {
    id: 'cart-1',
    items: [{ id: 'item-1' }],
  }

  it('should render summary heading', () => {
    render(React.createElement(CheckoutSummary, { cart: mockCart }))
    expect(screen.getByText('In your Cart')).toBeInTheDocument()
  })

  it('should render cart totals', () => {
    render(React.createElement(CheckoutSummary, { cart: mockCart }))
    expect(screen.getByTestId('cart-totals')).toBeInTheDocument()
  })

  it('should render items preview', () => {
    render(React.createElement(CheckoutSummary, { cart: mockCart }))
    expect(screen.getByTestId('items-preview')).toBeInTheDocument()
  })

  it('should render discount code component', () => {
    render(React.createElement(CheckoutSummary, { cart: mockCart }))
    expect(screen.getByTestId('discount-code')).toBeInTheDocument()
  })

  it('should render dividers', () => {
    render(React.createElement(CheckoutSummary, { cart: mockCart }))
    const dividers = screen.getAllByTestId('divider')
    expect(dividers.length).toBeGreaterThan(0)
  })
})
