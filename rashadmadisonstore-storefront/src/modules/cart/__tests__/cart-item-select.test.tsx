import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import CartItemSelect from '../components/cart-item-select'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  IconBadge: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  clx: jest.fn((...args) => args.join(' ')),
}))

// Mock ChevronDown icon
jest.mock('@modules/common/icons/chevron-down', () => {
  return function MockChevronDown() {
    return <svg data-testid="chevron-down">↓</svg>
  }
})

describe('Cart Item Select', () => {
  it('should render select element', () => {
    render(<CartItemSelect data-testid="cart-select" />)
    expect(screen.getByTestId('cart-select')).toBeInTheDocument()
  })

  it('should render children options', () => {
    render(
      <CartItemSelect>
        <option value="1">1</option>
        <option value="2">2</option>
      </CartItemSelect>
    )
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should handle value changes', () => {
    const handleChange = jest.fn()
    render(
      <CartItemSelect onChange={handleChange}>
        <option value="1">1</option>
        <option value="2">2</option>
      </CartItemSelect>
    )

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '2' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<CartItemSelect className="custom-class" data-testid="cart-select" />)
    const select = screen.getByTestId('cart-select')
    expect(select).toHaveClass('custom-class')
  })

  it('should render chevron down icon', () => {
    render(<CartItemSelect />)
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
  })
})