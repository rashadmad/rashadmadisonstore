import React from 'react'
import { render, screen } from '@testing-library/react'
import { SubmitButton } from '../components/submit-button'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Button: ({ children, ...props }: any) => React.createElement('button', props, children),
}))

// Mock useFormStatus
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormStatus: jest.fn(() => ({ pending: false })),
}))

describe('Submit Button', () => {
  it('should render button with children', () => {
    render(React.createElement(SubmitButton, { children: 'Submit' }))
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('should have type submit', () => {
    const { container } = render(React.createElement(SubmitButton, { children: 'Submit' }))
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should apply variant prop', () => {
    const { container } = render(React.createElement(SubmitButton, { children: 'Submit', variant: 'secondary' }))
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('variant', 'secondary')
  })

  it('should apply className when provided', () => {
    const { container } = render(React.createElement(SubmitButton, { children: 'Submit', className: 'custom-class' }))
    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should apply data-testid when provided', () => {
    render(React.createElement(SubmitButton, { children: 'Submit', 'data-testid': 'submit-btn' }))
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
  })

  it('should default to primary variant', () => {
    const { container } = render(React.createElement(SubmitButton, { children: 'Submit' }))
    const button = container.querySelector('button')
    expect(button).toHaveAttribute('variant', 'primary')
  })
})
