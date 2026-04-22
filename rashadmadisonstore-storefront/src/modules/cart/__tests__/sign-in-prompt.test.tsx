import React from 'react'
import { render, screen } from '@testing-library/react'
import SignInPrompt from '../components/sign-in-prompt'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Button: ({ children, variant, ...props }: any) => <button {...props}>{children}</button>,
  Heading: ({ children, level, ...props }: any) => {
    const Component = level ? level : 'h1'
    return React.createElement(Component, props, children)
  },
  Text: ({ children, ...props }: any) => <p {...props}>{children}</p>,
}))

// Mock LocalizedClientLink
jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

describe('Sign In Prompt', () => {
  it('should render sign in prompt', () => {
    render(<SignInPrompt />)
    expect(screen.getByText('Already have an account?')).toBeInTheDocument()
  })

  it('should display sign in message', () => {
    render(<SignInPrompt />)
    expect(screen.getByText('Sign in for a better experience.')).toBeInTheDocument()
  })

  it('should render sign in button', () => {
    render(<SignInPrompt />)
    const button = screen.getByTestId('sign-in-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Sign in')
  })

  it('should link to account page', () => {
    render(<SignInPrompt />)
    const link = screen.getByTestId('sign-in-button').closest('a')
    expect(link).toHaveAttribute('href', '/account')
  })
})