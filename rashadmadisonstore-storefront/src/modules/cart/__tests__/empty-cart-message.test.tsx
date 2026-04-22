import React from 'react'
import { render, screen } from '@testing-library/react'
import EmptyCartMessage from '../components/empty-cart-message'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Heading: ({ children, level, ...props }: any) => {
    const Component = level ? level : 'h1'
    return React.createElement(Component, props, children)
  },
  Text: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}))

// Mock InteractiveLink
jest.mock('@modules/common/components/interactive-link', () => {
  return function MockInteractiveLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('Empty Cart Message', () => {
  it('should render empty cart message', () => {
    render(<EmptyCartMessage />)
    expect(screen.getByTestId('empty-cart-message')).toBeInTheDocument()
  })

  it('should display cart heading', () => {
    render(<EmptyCartMessage />)
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('should display empty cart text', () => {
    render(<EmptyCartMessage />)
    expect(screen.getByText(/You don't have anything in your cart/)).toBeInTheDocument()
  })

  it('should render explore products link', () => {
    render(<EmptyCartMessage />)
    const link = screen.getByText('Explore products')
    expect(link).toBeInTheDocument()
    expect(link.closest('a')).toHaveAttribute('href', '/store')
  })
})