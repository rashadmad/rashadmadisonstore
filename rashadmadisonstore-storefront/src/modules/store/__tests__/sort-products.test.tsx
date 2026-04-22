import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SortProducts, { SortOptions } from '../components/refinement-list/sort-products'

// Mock the FilterRadioGroup component
jest.mock('@modules/common/components/filter-radio-group', () => ({
  __esModule: true,
  default: ({ title, items, value, handleChange, 'data-testid': dataTestId }: any) =>
    React.createElement('div', { 'data-testid': dataTestId || 'filter-radio-group' }, [
      React.createElement('h3', { key: 'title' }, title),
      ...items.map((item: any) =>
        React.createElement('button', {
          key: item.value,
          'data-testid': `option-${item.value}`,
          'data-selected': value === item.value,
          onClick: () => handleChange(item.value)
        }, item.label)
      )
    ]),
}))

describe('SortProducts', () => {
  const mockSetQueryParams = jest.fn()

  const defaultProps = {
    sortBy: 'created_at' as SortOptions,
    setQueryParams: mockSetQueryParams,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render filter radio group with correct title', () => {
    render(React.createElement(SortProducts, defaultProps))

    expect(screen.getByText('Sort by')).toBeInTheDocument()
  })

  it('should render all sort options', () => {
    render(React.createElement(SortProducts, defaultProps))

    expect(screen.getByTestId('option-created_at')).toHaveTextContent('Latest Arrivals')
    expect(screen.getByTestId('option-price_asc')).toHaveTextContent('Price: Low -> High')
    expect(screen.getByTestId('option-price_desc')).toHaveTextContent('Price: High -> Low')
  })

  it('should mark current sort option as selected', () => {
    render(React.createElement(SortProducts, defaultProps))

    const latestArrivalsOption = screen.getByTestId('option-created_at')
    expect(latestArrivalsOption.getAttribute('data-selected')).toBe('true')

    const priceAscOption = screen.getByTestId('option-price_asc')
    expect(priceAscOption.getAttribute('data-selected')).toBe('false')
  })

  it('should call setQueryParams when option is clicked', () => {
    render(React.createElement(SortProducts, defaultProps))

    const priceAscOption = screen.getByTestId('option-price_asc')
    fireEvent.click(priceAscOption)

    expect(mockSetQueryParams).toHaveBeenCalledWith('sortBy', 'price_asc')
  })

  it('should handle different sortBy values', () => {
    const testCases: SortOptions[] = ['created_at', 'price_asc', 'price_desc']

    testCases.forEach((sortBy) => {
      const { rerender } = render(React.createElement(SortProducts, { ...defaultProps, sortBy }))

      const selectedOption = screen.getByTestId(`option-${sortBy}`)
      expect(selectedOption.getAttribute('data-selected')).toBe('true')

      rerender(React.createElement('div')) // Clean up
    })
  })

  it('should pass data-testid to filter radio group', () => {
    const props = { ...defaultProps, 'data-testid': 'custom-sort-products' }
    render(React.createElement(SortProducts, props))

    expect(screen.getByTestId('custom-sort-products')).toBeInTheDocument()
  })

  it('should render with default data-testid when not provided', () => {
    render(React.createElement(SortProducts, defaultProps))

    expect(screen.getByTestId('filter-radio-group')).toBeInTheDocument()
  })

  it('should call handleChange with correct value for each option', () => {
    render(React.createElement(SortProducts, defaultProps))

    fireEvent.click(screen.getByTestId('option-price_desc'))
    expect(mockSetQueryParams).toHaveBeenCalledWith('sortBy', 'price_desc')

    fireEvent.click(screen.getByTestId('option-created_at'))
    expect(mockSetQueryParams).toHaveBeenCalledWith('sortBy', 'created_at')
  })

  it('should maintain sort options structure', () => {
    render(React.createElement(SortProducts, defaultProps))

    const options = [
      { value: 'created_at', label: 'Latest Arrivals' },
      { value: 'price_asc', label: 'Price: Low -> High' },
      { value: 'price_desc', label: 'Price: High -> Low' },
    ]

    options.forEach((option) => {
      const element = screen.getByTestId(`option-${option.value}`)
      expect(element).toHaveTextContent(option.label)
    })
  })
})