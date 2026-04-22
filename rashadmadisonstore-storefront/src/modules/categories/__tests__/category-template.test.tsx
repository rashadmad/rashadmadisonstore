import React from 'react'
import { render, screen } from '@testing-library/react'
import CategoryTemplate from '../templates'
import { HttpTypes } from '@medusajs/types'
import { SortOptions } from '@modules/store/components/refinement-list/sort-products'

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('notFound')
  }),
}))

// Mock React Suspense
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }: any) => children,
}))

// Mock all components with simple divs
jest.mock('@modules/store/templates/paginated-products', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'paginated-products' }, 'Products'),
}))

jest.mock('@modules/common/components/interactive-link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => React.createElement('a', { href }, children),
}))

jest.mock('@modules/common/components/localized-client-link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => React.createElement('a', { href }, children),
}))

jest.mock('@modules/skeletons/templates/skeleton-product-grid', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'skeleton-grid' }, 'Loading products...'),
}))

jest.mock('@modules/store/components/refinement-list', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'sort-by-container' }, 'Refinement List'),
}))

const mockNotFound = require('next/navigation').notFound

describe('Category Template', () => {
  const mockCategory: HttpTypes.StoreProductCategory = {
    id: 'category-1',
    name: 'Test Category',
    handle: 'test-category',
    description: 'This is a test category description',
    category_children: [
      {
        id: 'child-1',
        name: 'Child Category 1',
        handle: 'child-category-1',
      } as any,
    ],
    parent_category: {
      id: 'parent-1',
      name: 'Parent Category',
      handle: 'parent-category',
    } as any,
  }

  const defaultProps = {
    category: mockCategory,
    sortBy: 'created_at' as SortOptions,
    page: '1',
    countryCode: 'us',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render category container', () => {
    render(React.createElement(CategoryTemplate, defaultProps))
    expect(screen.getByTestId('category-container')).toBeInTheDocument()
  })

  it('should render category title', () => {
    render(React.createElement(CategoryTemplate, defaultProps))
    expect(screen.getByTestId('category-page-title')).toHaveTextContent('Test Category')
  })

  it('should render category description when present', () => {
    render(React.createElement(CategoryTemplate, defaultProps))
    expect(screen.getByText('This is a test category description')).toBeInTheDocument()
  })

  it('should render parent category breadcrumb', () => {
    render(React.createElement(CategoryTemplate, defaultProps))
    expect(screen.getByText('Parent Category')).toBeInTheDocument()
  })

  it('should render child categories', () => {
    render(React.createElement(CategoryTemplate, defaultProps))
    expect(screen.getByText('Child Category 1')).toBeInTheDocument()
  })

  it('should render refinement list', () => {
    render(React.createElement(CategoryTemplate, defaultProps))
    expect(screen.getByTestId('sort-by-container')).toBeInTheDocument()
  })

  it('should render paginated products', () => {
    render(React.createElement(CategoryTemplate, defaultProps))
    expect(screen.getByTestId('paginated-products')).toBeInTheDocument()
  })

  it('should call notFound when category is null', () => {
    expect(() => {
      render(React.createElement(CategoryTemplate, { ...defaultProps, category: null as any }))
    }).toThrow('notFound')
  })

  it('should call notFound when countryCode is missing', () => {
    expect(() => {
      render(React.createElement(CategoryTemplate, { ...defaultProps, countryCode: '' }))
    }).toThrow('notFound')
  })
})