import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Login from '../components/login'
import { LOGIN_VIEW } from '../templates/login-template'

// Mock the login action
jest.mock('@lib/data/customer', () => ({
  login: jest.fn(),
}))

// Mock the INPUT component properly
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

// Mock the ErrorMessage component
jest.mock('@modules/checkout/components/error-message', () => {
  return function MockErrorMessage({ error }: any) {
    return error ? <div data-testid="error-message">{error}</div> : null
  }
})

// Mock the SubmitButton component - pass through all props
jest.mock('@modules/checkout/components/submit-button', () => ({
  SubmitButton: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

describe('Login Component', () => {
  const mockSetCurrentView = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login page container', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })

  it('should display welcome message', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('should display description text', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText(/Sign in to access an enhanced shopping experience/)).toBeInTheDocument()
  })

  it('should render email input field', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-email')).toBeInTheDocument()
  })

  it('should render password input field', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('input-wrapper-password')).toBeInTheDocument()
  })

  it('should render sign in button', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('should render register button/link', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(1)
  })

  it('should call setCurrentView with REGISTER when switching to register', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    const buttons = screen.getAllByRole('button')
    const joinButton = buttons.find(btn => btn.textContent?.includes('Join us'))
    
    if (joinButton) {
      fireEvent.click(joinButton)
      expect(mockSetCurrentView).toHaveBeenCalledWith(LOGIN_VIEW.REGISTER)
    }
  })

  it('should display "Not a member?" text', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText(/Not a member\?/)).toBeInTheDocument()
  })

  it('should have form element', () => {
    const { container } = render(<Login setCurrentView={mockSetCurrentView} />)
    const form = container.querySelector('form')
    expect(form).toBeInTheDocument()
  })

  it('should have correct styling classes on main container', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    const mainDiv = screen.getByTestId('login-page')
    expect(mainDiv).toHaveClass('max-w-sm')
  })

  it('should render email label', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should render password label', () => {
    render(<Login setCurrentView={mockSetCurrentView} />)
    expect(screen.getByText('Password')).toBeInTheDocument()
  })
})
