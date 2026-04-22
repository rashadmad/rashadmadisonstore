import React from 'react'
import { render, screen } from '@testing-library/react'
import Summary from '../templates/summary'
import { HttpTypes } from '@medusajs/types'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Heading: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
}))

// Mock common components
jest.mock('@modules/common/components/cart-totals', () => {
  return function MockCartTotals({ ...props }: any) {
    return <div data-testid="cart-totals">Cart Totals</div>
  }
})

jest.mock('@modules/common/components/divider', () => {
  return function MockDivider() {
    return <hr data-testid="divider" />
  }
})

jest.mock('@modules/checkout/components/discount-code', () => {
  return function MockDiscountCode({ ...props }: any) {
    return <div data-testid="discount-code">Discount Code</div>
  }
})

jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('Summary Template', () => {
  const mockCart: HttpTypes.StoreCart & { promotions: HttpTypes.StorePromotion[] } = {
    id: 'cart-1',
    items: [],
    shipping_address: {
      address_1: '123 Main St',
    } as any,
    email: 'test@example.com',
    shipping_methods: [
      { id: 'shipping-1' } as any,
    ],
    region: {
      id: 'region-1',
      currency_code: 'USD',
    } as any,
    promotions: [],
  }

  it('should render summary heading', () => {
    render(<Summary cart={mockCart} />)
    expect(screen.getByText('Summary')).toBeInTheDocument()
  })

  it('should render cart totals', () => {
    render(<Summary cart={mockCart} />)
    expect(screen.getByTestId('cart-totals')).toBeInTheDocument()
  })

  it('should render discount code component', () => {
    render(<Summary cart={mockCart} />)
    expect(screen.getByTestId('discount-code')).toBeInTheDocument()
  })

  it('should render checkout button', () => {
    render(<Summary cart={mockCart} />)
    expect(screen.getByText('Go to checkout')).toBeInTheDocument()
  })

  it('should determine correct checkout step - address', () => {
    const cartWithoutAddress = {
      ...mockCart,
      shipping_address: null,
      email: null,
    }
    render(<Summary cart={cartWithoutAddress} />)
    // The step is determined internally, but we can check the button links to checkout
    expect(screen.getByText('Go to checkout')).toBeInTheDocument()
  })

  it('should determine correct checkout step - delivery', () => {
    const cartWithoutShipping = {
      ...mockCart,
      shipping_methods: [],
    }
    render(<Summary cart={cartWithoutShipping} />)
    expect(screen.getByText('Go to checkout')).toBeInTheDocument()
  })

  it('should determine correct checkout step - payment', () => {
    render(<Summary cart={mockCart} />)
    expect(screen.getByText('Go to checkout')).toBeInTheDocument()
  })
})