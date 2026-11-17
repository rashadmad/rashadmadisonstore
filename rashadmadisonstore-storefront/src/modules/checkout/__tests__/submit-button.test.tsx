import React from 'react'
import { render, screen } from '@testing-library/react'
import { SubmitButton } from '../components/submit-button'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Button: ({ children, isLoading, ...props }: any) => React.createElement('button', props, children),
}))

// Mock useFormStatus
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: jest.fn(() => ({ pending: false })),
}))

describe('Submit Button', () => {
  it('should render button with children', () => {
    render(<SubmitButton>Submit</SubmitButton>)
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('should have type submit', () => {
    const { container } = render(<SubmitButton>Submit</SubmitButton>)
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should apply variant prop', () => {
    const { container } = render(<SubmitButton variant="secondary">Submit</SubmitButton>)
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('variant', 'secondary')
  })

  it('should apply className when provided', () => {
    const { container } = render(<SubmitButton className="custom-class">Submit</SubmitButton>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should apply data-testid when provided', () => {
    render(<SubmitButton data-testid="submit-btn">Submit</SubmitButton>)
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
  })

  it('should default to primary variant', () => {
    const { container } = render(<SubmitButton>Submit</SubmitButton>)
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('variant', 'primary')
  })
})
