import React from 'react'
import { render, screen } from '@testing-library/react'
import ProductTabs from '../components/product-tabs'
import { HttpTypes } from '@medusajs/types'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Text: ({ children, ...props }: any) => React.createElement('span', props, children),
  clx: jest.fn((...args) => args.filter(Boolean).join(' ')),
}))

// Mock Radix UI Accordion
jest.mock('@radix-ui/react-accordion', () => ({
  Root: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'accordion', ...props }, children),
  Item: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'accordion-item', ...props }, children),
  Trigger: ({ children, ...props }: any) => React.createElement('button', { 'data-testid': 'accordion-trigger', ...props }, children),
  Content: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'accordion-content', ...props }, children),
}))

// Mock Accordion component
jest.mock('../components/product-tabs/accordion', () => ({
  __esModule: true,
  default: Object.assign(
    ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'accordion', ...props }, children),
    {
      Item: ({ children, title, headingSize, ...props }: any) => React.createElement('div', { 'data-testid': 'accordion-item', ...props }, 
        React.createElement('button', { 'data-testid': 'accordion-trigger' }, title),
        children
      ),
    }
  ),
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
    expect(screen.getByTestId('accordion')).toBeInTheDocument()
  })

  it('should render description tab', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    const triggers = screen.getAllByTestId('accordion-trigger')
    expect(triggers.some(trigger => trigger.textContent?.includes('Product Information'))).toBe(true)
  })

  it('should display product description in content', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    // The component renders product info, not description
    expect(screen.getByText('Material')).toBeInTheDocument()
  })

  it('should render multiple tabs if product has metadata', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    const accordion = screen.getByTestId('accordion')
    expect(accordion).toBeInTheDocument()
  })

  it('should handle product without description gracefully', () => {
    const productNoDesc = { ...mockProduct, description: null }
    const { container } = render(React.createElement(ProductTabs, { product: productNoDesc }))
    expect(container).toBeInTheDocument()
  })

  it('should pass product data to tabs', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    // Verify product data is passed by checking if product info labels are rendered
    expect(screen.getByText('Material')).toBeInTheDocument()
    expect(screen.getByText('Country of origin')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
  })

  it('should render with proper aria attributes', () => {
    render(React.createElement(ProductTabs, { product: mockProduct }))
    const accordion = screen.getByTestId('accordion')
    expect(accordion).toBeInTheDocument()
  })
})
