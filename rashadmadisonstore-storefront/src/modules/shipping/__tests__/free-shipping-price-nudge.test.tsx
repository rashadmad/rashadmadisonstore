import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ShippingPriceNudge from '../components/free-shipping-price-nudge'
import { HttpTypes } from '@medusajs/types'

// Mock the money utility
jest.mock('@lib/util/money', () => ({
  convertToLocale: jest.fn(({ amount, currency_code }) => `$${amount} ${currency_code}`),
}))

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Button: ({ children, onClick, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
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

// Mock icons
jest.mock('@medusajs/icons', () => ({
  CheckCircleSolid: ({ className }: any) => <div className={className} data-testid="check-circle">✓</div>,
  XMark: ({ className }: any) => <div className={className} data-testid="x-mark">×</div>,
}))

// Mock common components
jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href, className, ...props }: any) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    )
  }
})

const mockConvertToLocale = require('@lib/util/money').convertToLocale

describe('ShippingPriceNudge Component', () => {
  const mockCart: HttpTypes.StoreCart = {
    id: 'cart-1',
    currency_code: 'USD',
    item_total: 5000, // $50.00
    items: [],
  } as any

  const mockShippingOption: HttpTypes.StoreCartShippingOption = {
    id: 'shipping-1',
    name: 'Free Shipping',
    calculated_price: {
      amount: 0,
      currency_code: 'USD',
      price_list_id: null,
      calculated_amount: 0,
    },
    prices: [
      {
        id: 'price-1',
        currency_code: 'USD',
        amount: 0,
        price_rules: [
          {
            id: 'rule-1',
            attribute: 'item_total',
            operator: 'gte',
            value: '7500', // $75.00 threshold
          },
        ],
      },
    ],
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('computeTarget function behavior through component', () => {
    it('should calculate correct target for gte operator', () => {
      render(
        <ShippingPriceNudge cart={mockCart} shippingOptions={[mockShippingOption]} />
      )

      // The component should show "$2500 USD" remaining for the $75 threshold
      expect(screen.getByText('$2500 USD')).toBeInTheDocument()
      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 2500,
        currency_code: 'USD',
      })
    })

    it('should show target reached when cart total meets threshold', () => {
      const cartWithTargetReached = { ...mockCart, item_total: 8000 }

      render(
        <ShippingPriceNudge
          variant="inline"
          cart={cartWithTargetReached}
          shippingOptions={[mockShippingOption]}
        />
      )

      expect(screen.getByText('Free Shipping unlocked!')).toBeInTheDocument()
      expect(screen.getByTestId('check-circle')).toBeInTheDocument()
    })
  })

  describe('ShippingPriceNudge component', () => {
    it('should return null when no cart is provided', () => {
      const { container } = render(
        <ShippingPriceNudge cart={null as any} shippingOptions={[mockShippingOption]} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should return null when no shipping options are provided', () => {
      const { container } = render(
        <ShippingPriceNudge cart={mockCart} shippingOptions={[]} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should return null when no free shipping price is found', () => {
      const shippingOptionWithoutFreeShipping = {
        ...mockShippingOption,
        prices: [
          {
            id: 'price-1',
            currency_code: 'USD',
            amount: 500, // Not free
            price_rules: [],
          },
        ],
      }

      const { container } = render(
        <ShippingPriceNudge cart={mockCart} shippingOptions={[shippingOptionWithoutFreeShipping]} />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render inline variant by default', () => {
      render(
        <ShippingPriceNudge cart={mockCart} shippingOptions={[mockShippingOption]} />
      )

      expect(screen.getByText('Unlock Free Shipping')).toBeInTheDocument()
      expect(screen.getByText('$2500 USD')).toBeInTheDocument()
      expect(mockConvertToLocale).toHaveBeenCalledWith({
        amount: 2500,
        currency_code: 'USD',
      })
    })

    it('should render inline variant when specified', () => {
      render(
        <ShippingPriceNudge
          variant="inline"
          cart={mockCart}
          shippingOptions={[mockShippingOption]}
        />
      )

      expect(screen.getByText('Unlock Free Shipping')).toBeInTheDocument()
    })

    it('should render popup variant when specified', () => {
      render(
        <ShippingPriceNudge
          variant="popup"
          cart={mockCart}
          shippingOptions={[mockShippingOption]}
        />
      )

      expect(screen.getByText('Unlock Free Shipping')).toBeInTheDocument()
      expect(screen.getByText('View cart')).toBeInTheDocument()
      expect(screen.getByText('View products')).toBeInTheDocument()
      expect(screen.getByTestId('x-mark')).toBeInTheDocument()
    })

    it('should show "Free Shipping unlocked!" when target is reached', () => {
      const cartWithTargetReached = { ...mockCart, item_total: 8000 }

      render(
        <ShippingPriceNudge
          variant="inline"
          cart={cartWithTargetReached}
          shippingOptions={[mockShippingOption]}
        />
      )

      expect(screen.getByText('Free Shipping unlocked!')).toBeInTheDocument()
      expect(screen.getByTestId('check-circle')).toBeInTheDocument()
    })

    it('should hide popup when close button is clicked', () => {
      render(
        <ShippingPriceNudge
          variant="popup"
          cart={mockCart}
          shippingOptions={[mockShippingOption]}
        />
      )

      const closeButton = screen.getByTestId('x-mark').closest('button')
      fireEvent.click(closeButton!)

      // The popup container should have the hidden classes
      // Find the fixed positioned container
      const popupContainer = document.querySelector('.fixed.bottom-5.right-5')
      expect(popupContainer).toHaveClass('opacity-0', 'invisible')
    })

    it('should hide popup when target is reached', () => {
      const cartWithTargetReached = { ...mockCart, item_total: 8000 }

      render(
        <ShippingPriceNudge
          variant="popup"
          cart={cartWithTargetReached}
          shippingOptions={[mockShippingOption]}
        />
      )

      // The popup container should have the hidden classes with delay
      const popupContainer = document.querySelector('.fixed.bottom-5.right-5')
      expect(popupContainer).toHaveClass('opacity-0', 'invisible', 'delay-1000')
    })

    it('should filter shipping options by currency code', () => {
      const shippingOptionWrongCurrency = {
        ...mockShippingOption,
        prices: [
          {
            id: 'price-1',
            currency_code: 'EUR', // Different currency
            amount: 0,
            price_rules: [
              {
                id: 'rule-1',
                attribute: 'item_total',
                operator: 'gte',
                value: '7500',
              },
            ],
          },
        ],
      }

      const { container } = render(
        <ShippingPriceNudge
          cart={mockCart}
          shippingOptions={[shippingOptionWrongCurrency]}
        />
      )

      // Should not render because currency doesn't match
      expect(container.firstChild).toBeNull()
    })

    it('should only consider prices with item_total rules', () => {
      const shippingOptionWrongRule = {
        ...mockShippingOption,
        prices: [
          {
            id: 'price-1',
            currency_code: 'USD',
            amount: 0,
            price_rules: [
              {
                id: 'rule-1',
                attribute: 'customer_group', // Different attribute
                operator: 'eq',
                value: 'vip',
              },
            ],
          },
        ],
      }

      const { container } = render(
        <ShippingPriceNudge
          cart={mockCart}
          shippingOptions={[shippingOptionWrongRule]}
        />
      )

      // Should not render because rule attribute is not item_total
      expect(container.firstChild).toBeNull()
    })
  })
})