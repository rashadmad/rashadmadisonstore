import React from 'react'
import { render, screen } from '@testing-library/react'
import ItemsTemplate from '../templates/items'
import { HttpTypes } from '@medusajs/types'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Heading: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  Table: Object.assign(
    ({ children, ...props }: any) => <table {...props}>{children}</table>,
    {
      Header: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
      Row: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
      HeaderCell: ({ children, ...props }: any) => <th {...props}>{children}</th>,
      Body: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
    }
  ),
}))

// Mock Item component
jest.mock('../components/item', () => {
  return function MockItem({ item }: any) {
    return <tr data-testid={`cart-item-${item.id}`}>{item.product_title}</tr>
  }
})

// Mock SkeletonLineItem
jest.mock('@modules/skeletons/components/skeleton-line-item', () => {
  return function MockSkeletonLineItem() {
    return <tr data-testid="skeleton-line-item">Loading...</tr>
  }
})

// Mock repeat utility
jest.mock('@lib/util/repeat', () => {
  return jest.fn((n: number) => Array.from({ length: n }, (_, i) => i))
})

describe('Items Template', () => {
  const mockCart: HttpTypes.StoreCart = {
    id: 'cart-1',
    items: [
      {
        id: 'item-1',
        product_title: 'Product 1',
        quantity: 2,
      } as any,
      {
        id: 'item-2',
        product_title: 'Product 2',
        quantity: 1,
      } as any,
    ],
  }

  it('should render cart heading', () => {
    render(<ItemsTemplate cart={mockCart} />)
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('should render table headers', () => {
    render(<ItemsTemplate cart={mockCart} />)
    expect(screen.getByText('Item')).toBeInTheDocument()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('should render cart items', () => {
    render(<ItemsTemplate cart={mockCart} />)
    expect(screen.getByTestId('cart-item-item-1')).toBeInTheDocument()
    expect(screen.getByTestId('cart-item-item-2')).toBeInTheDocument()
  })

  it('should handle empty cart', () => {
    const emptyCart = { ...mockCart, items: [] }
    render(<ItemsTemplate cart={emptyCart} />)
    // Should still render the table structure but no items
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })

  it('should handle undefined cart', () => {
    render(<ItemsTemplate cart={undefined} />)
    expect(screen.getByText('Cart')).toBeInTheDocument()
  })
})