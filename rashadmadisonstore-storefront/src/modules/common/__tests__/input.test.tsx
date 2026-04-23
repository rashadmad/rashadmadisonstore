import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../components/input'

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
}))

// Mock icons
jest.mock('@modules/common/icons/eye', () => {
  return function MockEye() {
    return <div data-testid="eye-icon">Eye</div>
  }
})

jest.mock('@modules/common/icons/eye-off', () => {
  return function MockEyeOff() {
    return <div data-testid="eye-off-icon">EyeOff</div>
  }
})

describe('Input Component', () => {
  const defaultProps = {
    name: 'test-input',
    label: 'Test Label',
  }

  it('should render input with label', () => {
    render(<Input {...defaultProps} />)

    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('name', 'test-input')
    expect(input).toHaveAttribute('placeholder', ' ')

    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('should show required asterisk when required prop is true', () => {
    render(<Input {...defaultProps} required />)

    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('*')).toHaveClass('text-rose-500')
  })

  it('should not show required asterisk when required prop is false', () => {
    render(<Input {...defaultProps} required={false} />)

    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('should render top label when provided', () => {
    render(<Input {...defaultProps} topLabel="Top Label" />)

    expect(screen.getByText('Top Label')).toBeInTheDocument()
    expect(screen.getByText('Top Label')).toHaveClass('mb-2', 'txt-compact-medium-plus')
  })

  it('should not render top label when not provided', () => {
    render(<Input {...defaultProps} />)

    expect(screen.queryByText('Top Label')).not.toBeInTheDocument()
  })

  it('should forward input props correctly', () => {
    render(
      <Input
        {...defaultProps}
        type="email"
        value="test@example.com"
        onChange={() => {}}
        disabled
        maxLength={50}
      />
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveValue('test@example.com')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('maxLength', '50')
  })

  it('should have correct CSS classes', () => {
    render(<Input {...defaultProps} />)

    const input = screen.getByRole('textbox')
    expect(input).toHaveClass(
      'pt-4',
      'pb-1',
      'block',
      'w-full',
      'h-11',
      'px-4',
      'mt-0',
      'bg-ui-bg-field',
      'border',
      'rounded-md',
      'appearance-none',
      'focus:outline-none',
      'focus:ring-0',
      'focus:shadow-borders-interactive-with-active',
      'border-ui-border-base',
      'hover:bg-ui-bg-field-hover'
    )
  })

  it('should have correct label classes', () => {
    render(<Input {...defaultProps} />)

    const label = screen.getByText('Test Label')
    expect(label).toHaveClass(
      'flex',
      'items-center',
      'justify-center',
      'mx-3',
      'px-1',
      'transition-all',
      'absolute',
      'duration-300',
      'top-3',
      '-z-1',
      'origin-0',
      'text-ui-fg-subtle'
    )
  })

  describe('Password input functionality', () => {
    const passwordProps = {
      ...defaultProps,
      type: 'password' as const,
    }

    it('should render password input with eye-off icon initially', () => {
      render(<Input {...passwordProps} />)

      const input = document.querySelector('input[name="test-input"]') as HTMLInputElement
      expect(input).toHaveAttribute('type', 'password')

      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument()
    })

    it('should toggle password visibility when eye button is clicked', () => {
      render(<Input {...passwordProps} />)

      const input = document.querySelector('input[name="test-input"]') as HTMLInputElement
      const toggleButton = screen.getByRole('button')

      // Initially password type
      expect(input).toHaveAttribute('type', 'password')
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()

      // Click to show password
      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('eye-off-icon')).not.toBeInTheDocument()

      // Click to hide password again
      fireEvent.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
      expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument()
    })

    it('should have correct toggle button classes', () => {
      render(<Input {...passwordProps} />)

      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toHaveClass(
        'text-ui-fg-subtle',
        'px-4',
        'focus:outline-none',
        'transition-all',
        'duration-150',
        'outline-none',
        'focus:text-ui-fg-base',
        'absolute',
        'right-0',
        'top-3'
      )
    })

    it('should not render toggle button for non-password inputs', () => {
      render(<Input {...defaultProps} type="email" />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      expect(screen.queryByTestId('eye-icon')).not.toBeInTheDocument()
      expect(screen.queryByTestId('eye-off-icon')).not.toBeInTheDocument()
    })
  })

  describe('Focus management', () => {
    it('should focus input when label is clicked', () => {
      render(<Input {...defaultProps} />)

      const label = screen.getByText('Test Label')
      const input = screen.getByRole('textbox')

      fireEvent.click(label)
      expect(input).toHaveFocus()
    })

    it('should handle imperative focus via ref', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input {...defaultProps} ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      if (ref.current) {
        ref.current.focus()
        expect(ref.current).toHaveFocus()
      }
    })
  })

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      render(<Input {...defaultProps} />)

      const input = screen.getByRole('textbox')
      const label = screen.getByText('Test Label')

      expect(input).toHaveAttribute('name', 'test-input')
      expect(label).toHaveAttribute('for', 'test-input')
    })

    it('should be keyboard accessible', () => {
      render(<Input {...defaultProps} />)

      const input = screen.getByRole('textbox')
      input.focus()
      expect(input).toHaveFocus()
    })
  })

  describe('Type handling', () => {
    it('should use the provided type attribute', () => {
      render(<Input {...defaultProps} type="email" />)

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should handle password type with toggle', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Input {...defaultProps} type="password" ref={ref} />)

      const input = ref.current
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should handle email input type', () => {
      render(<Input {...defaultProps} type="email" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
    })

    it('should handle url input type', () => {
      render(<Input {...defaultProps} type="url" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'url')
    })
  })

  describe('Error and touched props', () => {
    it('should accept errors and touched props without using them', () => {
      // The component accepts these props but doesn't use them in rendering
      render(
        <Input
          {...defaultProps}
          errors={{ test: 'Error message' }}
          touched={{ test: true }}
        />
      )

      // Component should still render normally
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
  })
})