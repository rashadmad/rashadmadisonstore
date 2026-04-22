import React from 'react'
import { render, screen } from '@testing-library/react'
import CartTemplate from '../templates'
import { HttpTypes } from '@medusajs/types'

// Mock the sub-components
jest.mock('../templates/items', () => {
  return function MockItemsTemplate({ cart }: any) {
    return <div data-testid="items-template">Items: {cart?.items?.length || 0}</div>
  }
})

jest.mock('../templates/summary', () => {
  return function MockSummary({ cart }: any) {
    return <div data-testid="summary">Summary</div>
  }
})

jest.mock('../components/empty-cart-message', () => {
  return function MockEmptyCartMessage() {
    return <div data-testid="empty-cart-message">Empty Cart</div>
  }
})

jest.mock('../components/sign-in-prompt', () => {
  return function MockSignInPrompt() {
    return <div data-testid="sign-in-prompt">Sign In Prompt</div>
  }
})

jest.mock('@modules/common/components/divider', () => {
  return function MockDivider() {
    return <hr data-testid="divider" />
  }
})

describe('Cart Template', () => {
  const mockCartWithItems: HttpTypes.StoreCart = {
    id: 'cart-1',
    items: [
      {
        id: 'item-1',
        product_title: 'Test Product',
        quantity: 1,
      } as any,
    ],
    region: {
      id: 'region-1',
      currency_code: 'USD',
    } as any,
  }

  const mockCartEmpty: HttpTypes.StoreCart = {
    id: 'cart-2',
    items: [],
  }

  const mockCustomer: HttpTypes.StoreCustomer = {
    id: 'customer-1',
    email: 'test@example.com',
  }

  it('should render cart container', () => {
    render(<CartTemplate cart={mockCartWithItems} customer={mockCustomer} />)
    expect(screen.getByTestId('cart-container')).toBeInTheDocument()
  })

  it('should render items template and summary when cart has items and customer exists', () => {
    render(<CartTemplate cart={mockCartWithItems} customer={mockCustomer} />)

    expect(screen.getByTestId('items-template')).toBeInTheDocument()
    expect(screen.getByTestId('summary')).toBeInTheDocument()
    expect(screen.queryByTestId('sign-in-prompt')).not.toBeInTheDocument()
    expect(screen.queryByTestId('empty-cart-message')).not.toBeInTheDocument()
  })

  it('should render sign-in prompt when cart has items but no customer', () => {
    render(<CartTemplate cart={mockCartWithItems} customer={null} />)

    expect(screen.getByTestId('sign-in-prompt')).toBeInTheDocument()
    expect(screen.getByTestId('divider')).toBeInTheDocument()
    expect(screen.getByTestId('items-template')).toBeInTheDocument()
    expect(screen.getByTestId('summary')).toBeInTheDocument()
  })

  it('should render empty cart message when cart has no items', () => {
    render(<CartTemplate cart={mockCartEmpty} customer={mockCustomer} />)

    expect(screen.getByTestId('empty-cart-message')).toBeInTheDocument()
    expect(screen.queryByTestId('items-template')).not.toBeInTheDocument()
    expect(screen.queryByTestId('summary')).not.toBeInTheDocument()
    expect(screen.queryByTestId('sign-in-prompt')).not.toBeInTheDocument()
  })

  it('should handle null cart', () => {
    render(<CartTemplate cart={null} customer={mockCustomer} />)

    expect(screen.getByTestId('empty-cart-message')).toBeInTheDocument()
  })
})