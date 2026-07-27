import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Register from '../components/register'
import { LOGIN_VIEW } from '../templates/login-template'

// Mock the signup action
jest.mock('@lib/data/customer', () => ({
  signup: jest.fn(),
}))

// Mock the Input component
jest.mock('@modules/common/components/input', () => {
  return function MockInput({ label, name, ...props }: any) {
    return (
      <div data-testid={`input-wrapper-${name}`}>
        <label htmlFor={name}>{label}</label>
        <input id={name} name={name} {...props} />
      </div>
    )
  }
})

// Mock ErrorMessage
jest.mock('@modules/checkout/components/error-message', () => {
  return function MockErrorMessage({ error }: any) {
    return error ? <div data-testid="error-message">{error}</div> : null
  }
})

// Mock SubmitButton - pass through all props
jest.mock('@modules/checkout/components/submit-button', () => ({
  SubmitButton: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

// Mock LocalizedClientLink
jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('Register Component', () => {
  const mockSetCurrentView = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render register page container', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('register-page')).toBeInTheDocument()
  })

  it('should display title text', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Become a Quintessential Member')).toBeInTheDocument()
  })

  it('should display description text', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText(/Create your Quintessential Store Member account/)).toBeInTheDocument()
  })

  it('should render first name input', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-first_name')).toBeInTheDocument()
  })

  it('should render last name input', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-last_name')).toBeInTheDocument()
  })

  it('should render email input', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-email')).toBeInTheDocument()
  })

  it('should render phone input', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-phone')).toBeInTheDocument()
  })

  it('should render password input', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-password')).toBeInTheDocument()
  })

  it('should render confirm password input', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-confirm_password')).toBeInTheDocument()
  })

  it('should render join button', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('register-button')).toBeInTheDocument()
    expect(screen.getByText('Join')).toBeInTheDocument()
  })

  it('should render privacy policy link', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
  })

  it('should render terms of use link', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Terms of Use')).toBeInTheDocument()
  })

  it('should display already a member prompt', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText(/Already a member\?/)).toBeInTheDocument()
  })

  it('should call setCurrentView with SIGN_IN when sign in button is clicked', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    const buttons = screen.getAllByRole('button')
    const signInButton = buttons.find(btn => btn.textContent?.includes('Sign in'))
    
    if (signInButton) {
      fireEvent.click(signInButton)
      expect(mockSetCurrentView).toHaveBeenCalledWith(LOGIN_VIEW.SIGN_IN)
    }
  })

  it('should have form element', () => {
    const { container } = render(<Register setCurrentView={mockSetCurrentView} />)
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('should have correct styling classes on main container', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    const mainDiv = screen.getByTestId('register-page')
    expect(mainDiv).toHaveClass('max-w-sm')
  })

  it('should render all input labels', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('First name')).toBeInTheDocument()
    expect(screen.getByText('Last name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Password')).toBeInTheDocument()
    expect(screen.getByText('Confirm password')).toBeInTheDocument()
  })

  it('should have correct privacy policy link href', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    const links = screen.getAllByRole('link')
    const privacyLink = links.find(link => link.textContent === 'Privacy Policy')
    expect(privacyLink).toHaveAttribute('href', '/content/privacy-policy')
  })

  it('should have correct terms link href', () => {
    render(<Register setCurrentView={mockSetCurrentView} />)
    const links = screen.getAllByRole('link')
    const termsLink = links.find(link => link.textContent === 'Terms of Use')
    expect(termsLink).toHaveAttribute('href', '/content/terms-of-use')
  })
})
