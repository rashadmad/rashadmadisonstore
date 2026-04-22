import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Item from '../components/item'
import { HttpTypes } from '@medusajs/types'

// Mock the updateLineItem function
jest.mock('@lib/data/cart', () => ({
  updateLineItem: jest.fn(),
}))

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Table: {
    Row: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
    Cell: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  },
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  clx: jest.fn((...args) => args.join(' ')),
}))

// Mock common components
jest.mock('@modules/common/components/delete-button', () => {
  return function MockDeleteButton({ id, ...props }: any) {
    return <button {...props} data-testid="delete-button">Delete</button>
  }
})

jest.mock('@modules/common/components/line-item-options', () => {
  return function MockLineItemOptions({ variant, ...props }: any) {
    return <div {...props}>Variant Options</div>
  }
})

jest.mock('@modules/common/components/line-item-price', () => {
  return function MockLineItemPrice({ ...props }: any) {
    return <span {...props}>Price</span>
  }
})

jest.mock('@modules/common/components/line-item-unit-price', () => {
  return function MockLineItemUnitPrice({ ...props }: any) {
    return <span {...props}>Unit Price</span>
  }
})

jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

jest.mock('@modules/common/icons/spinner', () => {
  return function MockSpinner() {
    return <div data-testid="spinner">Loading...</div>
  }
})

jest.mock('@modules/products/components/thumbnail', () => {
  return function MockThumbnail({ ...props }: any) {
    return <img {...props} alt="thumbnail" />
  }
})

jest.mock('@modules/cart/components/cart-item-select', () => {
  return function MockCartItemSelect({ children, value, onChange, ...props }: any) {
    return (
      <select value={value} onChange={onChange} {...props}>
        {children}
      </select>
    )
  }
})

jest.mock('@modules/checkout/components/error-message', () => {
  return function MockErrorMessage({ error }: any) {
    return error ? <div data-testid="error-message">{error}</div> : null
  }
})

const mockUpdateLineItem = require('@lib/data/cart').updateLineItem

describe('Cart Item Component', () => {
  const mockItem: HttpTypes.StoreCartLineItem = {
    id: 'item-1',
    product_title: 'Test Product',
    product_handle: 'test-product',
    quantity: 2,
    thumbnail: 'test-thumbnail.jpg',
    variant: {
      id: 'variant-1',
      manage_inventory: true,
      product: {
        images: [{ url: 'test-image.jpg' }],
      },
    },
  } as any

  const currencyCode = 'USD'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render cart item correctly', () => {
    render(<Item item={mockItem} currencyCode={currencyCode} />)

    expect(screen.getByTestId('product-row')).toBeInTheDocument()
    expect(screen.getByTestId('product-title')).toHaveTextContent('Test Product')
    expect(screen.getByTestId('product-variant')).toBeInTheDocument()
    expect(screen.getByTestId('product-delete-button')).toBeInTheDocument()
    expect(screen.getByTestId('product-select-button')).toBeInTheDocument()
  })

  it('should render in preview mode', () => {
    render(<Item item={mockItem} type="preview" currencyCode={currencyCode} />)

    expect(screen.getByTestId('product-row')).toBeInTheDocument()
  })

  it('should call updateLineItem when quantity changes', async () => {
    mockUpdateLineItem.mockResolvedValue({})

    render(<Item item={mockItem} currencyCode={currencyCode} />)

    const select = screen.getByTestId('product-select-button')
    fireEvent.change(select, { target: { value: '3' } })

    await waitFor(() => {
      expect(mockUpdateLineItem).toHaveBeenCalledWith({
        lineId: 'item-1',
        quantity: 3,
      })
    })
  })

  it('should show error message when updateLineItem fails', async () => {
    const errorMessage = 'Update failed'
    mockUpdateLineItem.mockRejectedValue(new Error(errorMessage))

    render(<Item item={mockItem} currencyCode={currencyCode} />)

    const select = screen.getByTestId('product-select-button')
    fireEvent.change(select, { target: { value: '4' } })

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(errorMessage)
    })
  })

  it('should show spinner while updating', async () => {
    mockUpdateLineItem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<Item item={mockItem} currencyCode={currencyCode} />)

    const select = screen.getByTestId('product-select-button')
    fireEvent.change(select, { target: { value: '5' } })

    // Spinner should be visible during update
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
    })
  })
})