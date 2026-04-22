import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorMessage from '../components/error-message'

describe('Error Message', () => {
  it('should render nothing when error is null', () => {
    const { container } = render(React.createElement(ErrorMessage, { error: null }))
    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when error is undefined', () => {
    const { container } = render(React.createElement(ErrorMessage, { error: undefined }))
    expect(container.firstChild).toBeNull()
  })

  it('should render error message when error is provided', () => {
    render(React.createElement(ErrorMessage, { error: 'Something went wrong' }))
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should apply data-testid when provided', () => {
    render(React.createElement(ErrorMessage, { error: 'Test error', 'data-testid': 'error-msg' }))
    expect(screen.getByTestId('error-msg')).toBeInTheDocument()
  })

  it('should have error styling class', () => {
    const { container } = render(React.createElement(ErrorMessage, { error: 'Error' }))
    const div = container.querySelector('div')
    expect(div).toHaveClass('text-rose-500')
  })
})
