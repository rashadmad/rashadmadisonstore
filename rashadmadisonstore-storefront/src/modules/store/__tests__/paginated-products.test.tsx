import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import PaginatedProducts from '../templates/paginated-products'
import { HttpTypes } from '@medusajs/types'

// Mock the data functions
jest.mock('@lib/data/products', () => ({
  listProductsWithSort: jest.fn(),
}))

jest.mock('@lib/data/regions', () => ({
  getRegion: jest.fn(),
}))

// Mock components
jest.mock('@modules/products/components/product-preview', () => ({
  __esModule: true,
  default: ({ product }: { product: HttpTypes.StoreProduct }) =>
    React.createElement('div', { 'data-testid': `product-preview-${product.id}` }, product.title),
}))

jest.mock('@modules/store/components/pagination', () => ({
  Pagination: ({ page, totalPages }: { page: number; totalPages: number }) =>
    React.createElement('div', { 'data-testid': 'pagination' }, `Page ${page} of ${totalPages}`),
}))

describe('PaginatedProducts', () => {
  const mockRegion: HttpTypes.StoreRegion = {
    id: 'region-1',
    name: 'US',
    currency_code: 'usd',
  }

  const mockProducts: HttpTypes.StoreProduct[] = [
    {
      id: 'product-1',
      title: 'Product 1',
      handle: 'product-1',
      thumbnail: 'thumb1.jpg',
    },
    {
      id: 'product-2',
      title: 'Product 2',
      handle: 'product-2',
      thumbnail: 'thumb2.jpg',
    },
  ]

  const defaultProps = {
    page: 1,
    countryCode: 'us',
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mocks
    const { getRegion } = require('@lib/data/regions')
    const { listProductsWithSort } = require('@lib/data/products')

    getRegion.mockResolvedValue(mockRegion)
    listProductsWithSort.mockResolvedValue({
      response: {
        products: mockProducts,
        count: 2,
      },
    })
  })

  it('should render products list', async () => {
    render(await PaginatedProducts(defaultProps))

    await waitFor(() => {
      expect(screen.getByTestId('products-list')).toBeInTheDocument()
    })

    expect(screen.getByTestId('product-preview-product-1')).toHaveTextContent('Product 1')
    expect(screen.getByTestId('product-preview-product-2')).toHaveTextContent('Product 2')
  })

  it('should render pagination when total pages > 1', async () => {
    const { listProductsWithSort } = require('@lib/data/products')
    listProductsWithSort.mockResolvedValue({
      response: {
        products: mockProducts,
        count: 25, // More than 12 (PRODUCT_LIMIT)
      },
    })

    render(await PaginatedProducts(defaultProps))

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument()
    })

    expect(screen.getByTestId('pagination')).toHaveTextContent('Page 1 of 3')
  })

  it('should not render pagination when total pages = 1', async () => {
    render(await PaginatedProducts(defaultProps))

    await waitFor(() => {
      expect(screen.getByTestId('products-list')).toBeInTheDocument()
    })

    expect(screen.queryByTestId('pagination')).not.toBeInTheDocument()
  })

  it('should call getRegion with correct country code', async () => {
    const { getRegion } = require('@lib/data/regions')

    render(await PaginatedProducts({ ...defaultProps, countryCode: 'ca' }))

    await waitFor(() => {
      expect(getRegion).toHaveBeenCalledWith('ca')
    })
  })

  it('should call listProductsWithSort with correct parameters', async () => {
    const { listProductsWithSort } = require('@lib/data/products')

    render(await PaginatedProducts(defaultProps))

    await waitFor(() => {
      expect(listProductsWithSort).toHaveBeenCalledWith({
        page: 1,
        queryParams: { limit: 12 },
        sortBy: undefined,
        countryCode: 'us',
      })
    })
  })

  it('should handle collectionId parameter', async () => {
    const { listProductsWithSort } = require('@lib/data/products')

    render(await PaginatedProducts({ ...defaultProps, collectionId: 'collection-1' }))

    await waitFor(() => {
      expect(listProductsWithSort).toHaveBeenCalledWith({
        page: 1,
        queryParams: {
          limit: 12,
          collection_id: ['collection-1'],
        },
        sortBy: undefined,
        countryCode: 'us',
      })
    })
  })

  it('should handle categoryId parameter', async () => {
    const { listProductsWithSort } = require('@lib/data/products')

    render(await PaginatedProducts({ ...defaultProps, categoryId: 'category-1' }))

    await waitFor(() => {
      expect(listProductsWithSort).toHaveBeenCalledWith({
        page: 1,
        queryParams: {
          limit: 12,
          category_id: ['category-1'],
        },
        sortBy: undefined,
        countryCode: 'us',
      })
    })
  })

  it('should handle productsIds parameter', async () => {
    const { listProductsWithSort } = require('@lib/data/products')

    render(await PaginatedProducts({ ...defaultProps, productsIds: ['prod-1', 'prod-2'] }))

    await waitFor(() => {
      expect(listProductsWithSort).toHaveBeenCalledWith({
        page: 1,
        queryParams: {
          limit: 12,
          id: ['prod-1', 'prod-2'],
        },
        sortBy: undefined,
        countryCode: 'us',
      })
    })
  })

  it('should handle sortBy created_at', async () => {
    const { listProductsWithSort } = require('@lib/data/products')

    render(await PaginatedProducts({ ...defaultProps, sortBy: 'created_at' }))

    await waitFor(() => {
      expect(listProductsWithSort).toHaveBeenCalledWith({
        page: 1,
        queryParams: {
          limit: 12,
          order: 'created_at',
        },
        sortBy: 'created_at',
        countryCode: 'us',
      })
    })
  })

  it('should return null when region is not found', async () => {
    const { getRegion } = require('@lib/data/regions')
    getRegion.mockResolvedValue(null)

    const result = await PaginatedProducts(defaultProps)

    expect(result).toBeNull()
  })

  it('should render products with correct grid classes', async () => {
    render(await PaginatedProducts(defaultProps))

    await waitFor(() => {
      const productsList = screen.getByTestId('products-list')
      expect(productsList).toHaveClass('grid', 'grid-cols-2', 'w-full', 'small:grid-cols-3', 'medium:grid-cols-4', 'gap-x-6', 'gap-y-8')
    })
  })

  it('should render each product in a list item', async () => {
    render(await PaginatedProducts(defaultProps))

    await waitFor(() => {
      const listItems = screen.getByTestId('products-list').querySelectorAll('li')
      expect(listItems).toHaveLength(2)
      expect(screen.getByTestId('product-preview-product-1')).toBeInTheDocument()
      expect(screen.getByTestId('product-preview-product-2')).toBeInTheDocument()
    })
  })
})