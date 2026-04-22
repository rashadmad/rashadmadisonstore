import React from 'react'
import { render, screen } from '@testing-library/react'
import CheckoutForm from '../templates/checkout-form'
import { HttpTypes } from '@medusajs/types'

// Mock data fetching functions
jest.mock('@lib/data/fulfillment', () => ({
  listCartShippingMethods: jest.fn(),
}))

jest.mock('@lib/data/payment', () => ({
  listCartPaymentMethods: jest.fn(),
}))

// Mock components
jest.mock('@modules/checkout/components/addresses', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'addresses-section' }, 'Addresses'),
}))

jest.mock('@modules/checkout/components/payment', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'payment-section' }, 'Payment'),
}))

jest.mock('@modules/checkout/components/review', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'review-section' }, 'Review'),
}))

jest.mock('@modules/checkout/components/shipping', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'shipping-section' }, 'Shipping'),
}))

const { listCartShippingMethods } = require('@lib/data/fulfillment')
const { listCartPaymentMethods } = require('@lib/data/payment')

describe('Checkout Form', () => {
  const mockCart: HttpTypes.StoreCart = {
    id: 'cart-1',
    items: [{ id: 'item-1' } as any],
    region: { id: 'region-1' } as any,
  }

  const mockCustomer: HttpTypes.StoreCustomer = {
    id: 'customer-1',
    email: 'test@example.com',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    listCartShippingMethods.mockResolvedValue([{ id: 'shipping-1' }])
    listCartPaymentMethods.mockResolvedValue([{ id: 'payment-1' }])
  })

  it('should return null when cart is null', async () => {
    const { container } = render(await CheckoutForm({ cart: null, customer: mockCustomer }))
    expect(container.firstChild).toBeNull()
  })

  it('should render all sections when cart and methods are available', async () => {
    render(await CheckoutForm({ cart: mockCart, customer: mockCustomer }))
    expect(screen.getByTestId('addresses-section')).toBeInTheDocument()
    expect(screen.getByTestId('shipping-section')).toBeInTheDocument()
    expect(screen.getByTestId('payment-section')).toBeInTheDocument()
    expect(screen.getByTestId('review-section')).toBeInTheDocument()
  })

  it('should fetch shipping methods with cart id', async () => {
    render(await CheckoutForm({ cart: mockCart, customer: mockCustomer }))
    expect(listCartShippingMethods).toHaveBeenCalledWith('cart-1')
  })

  it('should fetch payment methods with region id', async () => {
    render(await CheckoutForm({ cart: mockCart, customer: mockCustomer }))
    expect(listCartPaymentMethods).toHaveBeenCalledWith('region-1')
  })

  it('should return null when shipping methods are unavailable', async () => {
    listCartShippingMethods.mockResolvedValue(null)
    const { container } = render(await CheckoutForm({ cart: mockCart, customer: mockCustomer }))
    expect(container.firstChild).toBeNull()
  })

  it('should return null when payment methods are unavailable', async () => {
    listCartPaymentMethods.mockResolvedValue(null)
    const { container } = render(await CheckoutForm({ cart: mockCart, customer: mockCustomer }))
    expect(container.firstChild).toBeNull()
  })

  it('should handle null customer', async () => {
    render(await CheckoutForm({ cart: mockCart, customer: null }))
    expect(screen.getByTestId('addresses-section')).toBeInTheDocument()
  })
})
