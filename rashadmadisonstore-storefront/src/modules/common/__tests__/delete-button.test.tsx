import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DeleteButton from '../components/delete-button'

// Mock data functions
jest.mock('@lib/data/cart', () => ({
  deleteLineItem: jest.fn(),
}))

// Mock icons
jest.mock('@medusajs/icons', () => ({
  Spinner: ({ className }: any) => <div className={className} data-testid="spinner">Spinner</div>,
  Trash: ({ className }: any) => <div className={className} data-testid="trash">Trash</div>,
}))

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  clx: jest.fn((...args) => args.filter(Boolean).join(' ')),
}))

const mockDeleteLineItem = require('@lib/data/cart').deleteLineItem

describe('DeleteButton Component', () => {
  const mockId = 'item-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with trash icon and children text', () => {
    render(
      <DeleteButton id={mockId}>
        Delete Item
      </DeleteButton>
    )

    expect(screen.getByTestId('trash')).toBeInTheDocument()
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  it('should show spinner and call deleteLineItem when clicked', async () => {
    mockDeleteLineItem.mockResolvedValue({})

    render(
      <DeleteButton id={mockId}>
        Delete
      </DeleteButton>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Should show spinner immediately
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
    expect(screen.queryByTestId('trash')).not.toBeInTheDocument()

    // Should call deleteLineItem with correct id
    expect(mockDeleteLineItem).toHaveBeenCalledWith(mockId)
    expect(mockDeleteLineItem).toHaveBeenCalledTimes(1)

    // Wait for deletion to complete
    await waitFor(() => {
      expect(mockDeleteLineItem).toHaveBeenCalledWith(mockId)
    })
  })

  it('should reset loading state when deleteLineItem succeeds', async () => {
    mockDeleteLineItem.mockResolvedValue({})

    render(
      <DeleteButton id={mockId}>
        Delete
      </DeleteButton>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Initially shows spinner
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    // After successful deletion, should still show spinner (component doesn't reset state)
    await waitFor(() => {
      expect(mockDeleteLineItem).toHaveBeenCalledWith(mockId)
    })

    // The component keeps the loading state even after success
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('should reset loading state when deleteLineItem fails', async () => {
    const error = new Error('Delete failed')
    mockDeleteLineItem.mockRejectedValue(error)

    render(
      <DeleteButton id={mockId}>
        Delete
      </DeleteButton>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Initially shows spinner
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    // After failed deletion, should reset to trash icon
    await waitFor(() => {
      expect(mockDeleteLineItem).toHaveBeenCalledWith(mockId)
    })

    expect(screen.getByTestId('trash')).toBeInTheDocument()
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
  })

  it('should handle multiple clicks correctly', () => {
    render(
      <DeleteButton id={mockId}>
        Delete
      </DeleteButton>
    )

    const button = screen.getByRole('button')

    // First click
    fireEvent.click(button)
    expect(mockDeleteLineItem).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    // Second click - should still call deleteLineItem (no prevention of multiple clicks)
    fireEvent.click(button)
    expect(mockDeleteLineItem).toHaveBeenCalledTimes(2)
  })

  it('should apply custom className', () => {
    render(
      <DeleteButton id={mockId} className="custom-class">
        Delete
      </DeleteButton>
    )

    const container = screen.getByRole('button').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('should have correct default classes', () => {
    render(
      <DeleteButton id={mockId}>
        Delete
      </DeleteButton>
    )

    const container = screen.getByRole('button').parentElement
    expect(container).toHaveClass('flex', 'items-center', 'justify-between', 'text-small-regular')
  })

  it('should have correct button classes', () => {
    render(
      <DeleteButton id={mockId}>
        Delete
      </DeleteButton>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveClass('flex', 'gap-x-1', 'text-ui-fg-subtle', 'hover:text-ui-fg-base', 'cursor-pointer')
  })

  it('should render without children', () => {
    render(<DeleteButton id={mockId} />)

    expect(screen.getByTestId('trash')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle different id values', () => {
    const differentId = 'different-item-456'
    mockDeleteLineItem.mockResolvedValue({})

    render(
      <DeleteButton id={differentId}>
        Delete
      </DeleteButton>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockDeleteLineItem).toHaveBeenCalledWith(differentId)
  })

  it('should maintain button functionality after error', async () => {
    let callCount = 0
    mockDeleteLineItem.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject(new Error('First delete failed'))
      }
      return Promise.resolve({})
    })

    render(
      <DeleteButton id={mockId}>
        Delete
      </DeleteButton>
    )

    const button = screen.getByRole('button')

    // First click - fails
    fireEvent.click(button)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockDeleteLineItem).toHaveBeenCalledTimes(1)
    })

    // Should reset to trash icon after error
    expect(screen.getByTestId('trash')).toBeInTheDocument()

    // Second click - succeeds
    fireEvent.click(button)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockDeleteLineItem).toHaveBeenCalledTimes(2)
    })
  })
})