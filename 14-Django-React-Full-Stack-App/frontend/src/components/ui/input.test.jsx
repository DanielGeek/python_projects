import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Input } from './input'

describe('Input Component', () => {
  test('renders input with default props', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border', 'border-input')
  })

  test('renders input with custom type', () => {
    render(<Input type="password" placeholder="Password" />)
    
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
  })

  test('renders input with email type', () => {
    render(<Input type="email" placeholder="Email" />)
    
    const input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('type', 'email')
  })

  test('applies custom className', () => {
    render(<Input className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-class')
  })

  test('handles user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })

  test('calls onChange handler', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    expect(handleChange).toHaveBeenCalledTimes(4) // Once for each character
  })

  test('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />)
    
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  test('has required attribute when specified', () => {
    render(<Input required placeholder="Required field" />)
    
    const input = screen.getByPlaceholderText('Required field')
    expect(input).toBeRequired()
  })

  test('forwards ref correctly', () => {
    const ref = { current: null }
    
    render(<Input ref={ref} placeholder="Ref input" />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    expect(ref.current).toBe(screen.getByPlaceholderText('Ref input'))
  })

  test('has correct accessibility attributes', () => {
    render(<Input aria-label="Custom label" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-label', 'Custom label')
  })

  test('handles focus events', async () => {
    const user = userEvent.setup()
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.tab() // Move focus away
    
    expect(handleFocus).toHaveBeenCalledTimes(1)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  test('combines default classes with custom className correctly', () => {
    render(<Input className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('flex', 'h-10', 'w-full') // Default classes
    expect(input).toHaveClass('custom-class') // Custom class
  })

  test('has focus-visible styles applied', () => {
    render(<Input />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2')
  })

  test('placeholder text is visible', () => {
    render(<Input placeholder="Placeholder text" />)
    
    const input = screen.getByPlaceholderText('Placeholder text')
    expect(input).toBeInTheDocument()
    expect(input.getAttribute('placeholder')).toBe('Placeholder text')
  })
})
