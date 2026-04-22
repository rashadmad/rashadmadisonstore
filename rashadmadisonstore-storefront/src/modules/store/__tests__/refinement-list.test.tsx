import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RefinementList from '../components/refinement-list'

// Mock Next.js navigation hooks
const mockPush = jest.fn()
const mockPathname = '/store'
let mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}))

// Mock the SortProducts component
jest.mock('../components/refinement-list/sort-products', () => ({
  __esModule: true,
  default: ({ sortBy, setQueryParams, 'data-testid': dataTestId }: any) =>
    React.createElement('div', {
      'data-testid': dataTestId || 'sort-products',
      onClick: () => setQueryParams('sortBy', 'price_asc')
    }, `Sort Products: ${sortBy}`),
}))

describe('RefinementList', () => {
  const defaultProps = {
    sortBy: 'created_at' as const,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with sort products component', () => {
    render(React.createElement(RefinementList, defaultProps))

    expect(screen.getByTestId('sort-products')).toBeInTheDocument()
    expect(screen.getByText('Sort Products: created_at')).toBeInTheDocument()
  })

  it('should pass data-testid to sort products component', () => {
    const props = { ...defaultProps, 'data-testid': 'custom-refinement-list' }
    render(React.createElement(RefinementList, props))

    expect(screen.getByTestId('custom-refinement-list')).toBeInTheDocument()
  })

  it('should create query string correctly', () => {
    render(React.createElement(RefinementList, defaultProps))

    const sortProducts = screen.getByTestId('sort-products')
    fireEvent.click(sortProducts)

    expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?sortBy=price_asc`)
  })

  it('should handle existing search params', () => {
    // Set up existing search params
    mockSearchParams = new URLSearchParams('existing=value')

    render(React.createElement(RefinementList, defaultProps))

    const sortProducts = screen.getByTestId('sort-products')
    fireEvent.click(sortProducts)

    expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?existing=value&sortBy=price_asc`)

    // Reset for other tests
    mockSearchParams = new URLSearchParams()
  })

  it('should render with correct layout classes', () => {
    const { container } = render(React.createElement(RefinementList, defaultProps))

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('flex', 'small:flex-col', 'gap-12', 'py-4', 'mb-8', 'small:px-0', 'pl-6', 'small:min-w-[250px]', 'small:ml-[1.675rem]')
  })

  it('should pass sortBy prop to SortProducts component', () => {
    const props = { ...defaultProps, sortBy: 'price_desc' as const }
    render(React.createElement(RefinementList, props))

    expect(screen.getByText('Sort Products: price_desc')).toBeInTheDocument()
  })

  it('should call setQueryParams when sort products triggers change', () => {
    render(React.createElement(RefinementList, defaultProps))

    const sortProducts = screen.getByTestId('sort-products')
    fireEvent.click(sortProducts)

    // The click triggers setQueryParams which calls router.push
    expect(mockPush).toHaveBeenCalledTimes(1)
  })

  it('should handle different sort options', () => {
    const testCases = [
      { sortBy: 'created_at' as const, expected: 'created_at' },
      { sortBy: 'price_asc' as const, expected: 'price_asc' },
      { sortBy: 'price_desc' as const, expected: 'price_desc' },
    ]

    testCases.forEach(({ sortBy, expected }) => {
      const { rerender } = render(React.createElement(RefinementList, { sortBy }))
      expect(screen.getByText(`Sort Products: ${expected}`)).toBeInTheDocument()
      rerender(React.createElement('div')) // Clean up for next test
    })
  })
})