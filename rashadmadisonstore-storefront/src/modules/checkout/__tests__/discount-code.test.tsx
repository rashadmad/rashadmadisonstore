import React from 'react'
import { render, screen } from '@testing-library/react'
import DiscountCode from '../components/discount-code'
import { HttpTypes } from '@medusajs/types'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Badge: ({ children, ...props }: any) => React.createElement('span', { ...props, className: 'badge' }, children),
  Heading: ({ children, ...props }: any) => React.createElement('h3', props, children),
  Input: ({ ...props }: any) => React.createElement('input', props),
  Label: ({ children, ...props }: any) => React.createElement('label', props, children),
  Text: ({ children, ...props }: any) => React.createElement('p', props, children),
}))

// Mock data function
jest.mock('@lib/data/cart', () => ({
  applyPromotions: jest.fn(),
}))

// Mock utility functions
jest.mock('@lib/util/money', () => ({
  convertToLocale: jest.fn((value) => value),
}))

// Mock icons
jest.mock('@modules/common/icons/trash', () => ({
  __esModule: true,
  default: () => React.createElement('span', null, 'Trash'),
}))

// Mock error message component
jest.mock('../components/error-message', () => ({
  __esModule: true,
  default: ({ error }: any) => error ? React.createElement('div', { 'data-testid': 'error' }, error) : null,
}))

// Mock submit button
jest.mock('../components/submit-button', () => ({
  SubmitButton: ({ children, ...props }: any) => {
    const { isLoading, ...restProps } = props
    return React.createElement('button', restProps, children)
  },
}))

const { applyPromotions } = require('@lib/data/cart')

describe('Discount Code', () => {
  const mockCart: HttpTypes.StoreCart & { promotions: HttpTypes.StorePromotion[] } = {
    id: 'cart-1',
    items: [],
    promotions: [
      {
        id: 'promo-1',
        code: 'SAVE10',
        type: 'standard' as const,
      } as any,
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    applyPromotions.mockResolvedValue({})
  })

  it('should render discount code component', () => {
    const { container } = render(React.createElement(DiscountCode, { cart: mockCart }))
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should display applied promotion codes', () => {
    render(React.createElement(DiscountCode, { cart: mockCart }))
    expect(screen.getByText('SAVE10')).toBeInTheDocument()
  })

  it('should have button elements', () => {
    render(React.createElement(DiscountCode, { cart: mockCart }))
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should handle cart with no promotions', () => {
    const cartWithoutPromotions = {
      ...mockCart,
      promotions: [],
    }
    render(React.createElement(DiscountCode, { cart: cartWithoutPromotions }))
    expect(screen.queryByText('SAVE10')).not.toBeInTheDocument()
  })

  it('should handle cart with undefined promotions', () => {
    const cartWithUndefinedPromotions = {
      ...mockCart,
      promotions: undefined as any,
    }
    const { container } = render(React.createElement(DiscountCode, { cart: cartWithUndefinedPromotions }))
    expect(container.firstChild).toBeInTheDocument()
  })
})
