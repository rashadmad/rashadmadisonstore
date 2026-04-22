import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from '../components/pagination'

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

// Mock clx utility
jest.mock('@medusajs/ui', () => ({
  clx: (...args: any[]) => {
    let classes = []
    for (const arg of args) {
      if (typeof arg === 'string') {
        classes.push(arg)
      } else if (typeof arg === 'object') {
        for (const [key, value] of Object.entries(arg)) {
          if (value) classes.push(key)
        }
      }
    }
    return classes.join(' ')
  },
}))

describe('Pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render page buttons', () => {
      render(React.createElement(Pagination, { page: 1, totalPages: 5 }))

      // Should render buttons for pages 1-5
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })

    it('should render with custom data-testid', () => {
      render(React.createElement(Pagination, {
        page: 1,
        totalPages: 5,
        'data-testid': 'custom-pagination'
      }))

      expect(screen.getByTestId('custom-pagination')).toBeInTheDocument()
    })

    it('should have correct container classes', () => {
      const { container } = render(React.createElement(Pagination, { page: 1, totalPages: 5 }))

      const mainContainer = container.firstChild as HTMLElement
      expect(mainContainer).toHaveClass('flex', 'justify-center', 'w-full', 'mt-12')
    })
  })

  describe('Page button rendering', () => {
    it('should render all pages when totalPages <= 7', () => {
      render(React.createElement(Pagination, { page: 1, totalPages: 5 }))

      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })

    it('should disable current page button', () => {
      render(React.createElement(Pagination, { page: 3, totalPages: 5 }))

      const currentPageButton = screen.getByText('3')
      expect(currentPageButton).toBeDisabled()
      expect(currentPageButton).toHaveClass('text-ui-fg-base', 'hover:text-ui-fg-subtle')
    })

    it('should enable other page buttons', () => {
      render(React.createElement(Pagination, { page: 3, totalPages: 5 }))

      const page1Button = screen.getByText('1')
      const page2Button = screen.getByText('2')
      const page4Button = screen.getByText('4')
      const page5Button = screen.getByText('5')

      expect(page1Button).not.toBeDisabled()
      expect(page2Button).not.toBeDisabled()
      expect(page4Button).not.toBeDisabled()
      expect(page5Button).not.toBeDisabled()

      expect(page1Button).toHaveClass('txt-xlarge-plus', 'text-ui-fg-muted')
    })
  })

  describe('Pagination logic for totalPages > 7', () => {
    it('should show 1, 2, 3, 4, 5, ..., lastpage when page <= 4', () => {
      render(React.createElement(Pagination, { page: 3, totalPages: 10 }))

      // Should show pages 1-5
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }

      // Should show ellipsis
      expect(screen.getByText('...')).toBeInTheDocument()

      // Should show last page
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should show 1, ..., page-1, page, page+1, ..., lastpage when page is in middle', () => {
      render(React.createElement(Pagination, { page: 7, totalPages: 12 }))

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('6')).toBeInTheDocument()
      expect(screen.getByText('7')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getAllByText('...')).toHaveLength(2)
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('should show 1, ..., lastpage-4 to lastpage when page >= totalPages-3', () => {
      render(React.createElement(Pagination, { page: 9, totalPages: 12 }))

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('...')).toBeInTheDocument()

      // Should show pages 8-12
      for (let i = 8; i <= 12; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })
  })

  describe('Navigation', () => {
    it('should navigate to correct page when button clicked', () => {
      render(React.createElement(Pagination, { page: 1, totalPages: 5 }))

      const page3Button = screen.getByText('3')
      fireEvent.click(page3Button)

      expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?page=3`)
    })

    it('should preserve existing search params', () => {
      mockSearchParams = new URLSearchParams('sortBy=price_asc&category=test')

      render(React.createElement(Pagination, { page: 1, totalPages: 5 }))

      const page2Button = screen.getByText('2')
      fireEvent.click(page2Button)

      expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?sortBy=price_asc&category=test&page=2`)

      mockSearchParams = new URLSearchParams()
    })

    it('should update existing page param', () => {
      mockSearchParams = new URLSearchParams('page=1&sortBy=price_asc')

      render(React.createElement(Pagination, { page: 1, totalPages: 5 }))

      const page4Button = screen.getByText('4')
      fireEvent.click(page4Button)

      expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?sortBy=price_asc&page=4`)

      mockSearchParams = new URLSearchParams()
    })
  })

  describe('Edge cases', () => {
    it('should handle totalPages = 1 (no pagination)', () => {
      render(React.createElement(Pagination, { page: 1, totalPages: 1 }))

      // Should still render the container
      const mainContainer = screen.getByRole('generic', { hidden: true })
      expect(mainContainer).toHaveClass('flex', 'justify-center', 'w-full', 'mt-12')

      // Should have one disabled button for page 1
      const pageButton = screen.getByText('1')
      expect(pageButton).toBeDisabled()
    })

    it('should handle page = 1 with totalPages = 7 (boundary case)', () => {
      render(React.createElement(Pagination, { page: 1, totalPages: 7 }))

      for (let i = 1; i <= 7; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })

    it('should handle page = 7 with totalPages = 7 (boundary case)', () => {
      render(React.createElement(Pagination, { page: 7, totalPages: 7 }))

      for (let i = 1; i <= 7; i++) {
        expect(screen.getByText(i.toString())).toBeInTheDocument()
      }
    })
  })
})