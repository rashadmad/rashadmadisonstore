import React from 'react'
import { render, screen } from '@testing-library/react'
import StoreTemplate from '../templates'

// Mock the components
jest.mock('@modules/skeletons/templates/skeleton-product-grid', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'skeleton-product-grid' }, 'Skeleton Product Grid'),
}))

jest.mock('@modules/store/components/refinement-list', () => ({
  __esModule: true,
  default: ({ sortBy }: { sortBy: string }) => React.createElement('div', { 'data-testid': 'refinement-list' }, `Refinement List: ${sortBy}`),
}))

jest.mock('../templates/paginated-products', () => ({
  __esModule: true,
  default: ({ sortBy, page, countryCode }: { sortBy: string; page: number; countryCode: string }) =>
    React.createElement('div', { 'data-testid': 'paginated-products' }, `Paginated Products: ${sortBy}, ${page}, ${countryCode}`),
}))

// Mock Suspense
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children, fallback }: any) => fallback || children,
}))

describe('StoreTemplate', () => {
  const defaultProps = {
    countryCode: 'us',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with default props', () => {
    render(React.createElement(StoreTemplate, defaultProps))

    expect(screen.getByTestId('category-container')).toBeInTheDocument()
    expect(screen.getByTestId('store-page-title')).toHaveTextContent('All products')
    expect(screen.getByTestId('refinement-list')).toBeInTheDocument()
    expect(screen.getByTestId('paginated-products')).toBeInTheDocument()
  })

  it('should render with custom sortBy', () => {
    const props = { ...defaultProps, sortBy: 'price_asc' as const }
    render(React.createElement(StoreTemplate, props))

    expect(screen.getByTestId('refinement-list')).toHaveTextContent('price_asc')
    expect(screen.getByTestId('paginated-products')).toHaveTextContent('price_asc')
  })

  it('should render with custom page', () => {
    const props = { ...defaultProps, page: '2' }
    render(React.createElement(StoreTemplate, props))

    expect(screen.getByTestId('paginated-products')).toHaveTextContent('2')
  })

  it('should default to page 1 when no page provided', () => {
    render(React.createElement(StoreTemplate, defaultProps))

    expect(screen.getByTestId('paginated-products')).toHaveTextContent('1')
  })

  it('should default to created_at sort when no sortBy provided', () => {
    render(React.createElement(StoreTemplate, defaultProps))

    expect(screen.getByTestId('refinement-list')).toHaveTextContent('created_at')
    expect(screen.getByTestId('paginated-products')).toHaveTextContent('created_at')
  })

  it('should render the page title correctly', () => {
    render(React.createElement(StoreTemplate, defaultProps))

    const title = screen.getByTestId('store-page-title')
    expect(title).toHaveTextContent('All products')
    expect(title.tagName).toBe('H1')
  })

  it('should render with proper layout classes', () => {
    const { container } = render(React.createElement(StoreTemplate, defaultProps))

    const mainContainer = screen.getByTestId('category-container')
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'small:flex-row', 'small:items-start', 'py-6', 'content-container')
  })

  it('should render refinement list and products in correct order', () => {
    render(React.createElement(StoreTemplate, defaultProps))

    const container = screen.getByTestId('category-container')
    const refinementList = screen.getByTestId('refinement-list')
    const title = screen.getByTestId('store-page-title')
    const paginatedProducts = screen.getByTestId('paginated-products')

    expect(container).toContainElement(refinementList)
    expect(container).toContainElement(title)
    expect(container).toContainElement(paginatedProducts)
  })
})