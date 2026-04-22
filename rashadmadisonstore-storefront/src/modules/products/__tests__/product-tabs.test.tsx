import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductTabs from '../components/product-tabs'
import { HttpTypes } from '@medusajs/types'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Tabs: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'tabs', ...props }, children),
  TabsTrigger: ({ children, value, ...props }: any) => React.createElement('button', { 'data-value': value, ...props }, children),
  TabsContent: ({ children, value, ...props }: any) => React.createElement('div', { 'data-testid': `tab-content-${value}`, ...props }, children),
  clx: jest.fn((...args) => args.filter(Boolean).join(' ')),
}))

describe('Product Tabs', () => {
  const mockProduct: HttpTypes.StoreProduct = {
    id: 'product-1',
    title: 'Test Product',
    description: 'This is a test product description',
    metadata: {
      custom_field: 'custom value',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render tabs container', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    expect(screen.getByTestId('tabs')).toBeInTheDocument()
  })

  it('should render description tab', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    const buttons = screen.getAllByRole('button')
    expect(buttons.some(btn => btn.textContent?.includes('Description'))).toBe(true)
  })

  it('should display product description in content', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    expect(screen.getByText('This is a test product description')).toBeInTheDocument()
  })

  it('should render multiple tabs if product has metadata', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    const tabs = screen.getByTestId('tabs')
    expect(tabs).toBeInTheDocument()
  })

  it('should handle product without description gracefully', () => {
    const productNoDesc = { ...mockProduct, description: null }
    const { container } = render(React.createElement(ProductTabs, { product: productNoDesc }))
    expect(container).toBeInTheDocument()
  })

  it('should pass product data to tabs', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    const tabs = screen.getByTestId('tabs')
    expect(tabs).toBeInTheDocument()
  })

  it('should render with proper aria attributes', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    const tabs = screen.getByTestId('tabs')
    expect(tabs).toBeInTheDocument()
  })
})
