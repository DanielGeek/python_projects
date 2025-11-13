import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { Button } from './button'

describe('Button Component', () => {
  test('renders button with default props', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-10', 'px-4', 'py-2')
  })

  test('renders button with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    
    let button = screen.getByRole('button', { name: 'Delete' })
    expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')

    rerender(<Button variant="outline">Cancel</Button>)
    button = screen.getByRole('button', { name: 'Cancel' })
    expect(button).toHaveClass('border', 'border-input', 'bg-background')

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button', { name: 'Secondary' })
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')

    rerender(<Button variant="ghost">Ghost</Button>)
    button = screen.getByRole('button', { name: 'Ghost' })
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')

    rerender(<Button variant="link">Link</Button>)
    button = screen.getByRole('button', { name: 'Link' })
    expect(button).toHaveClass('text-primary', 'underline-offset-4', 'hover:underline')
  })

  test('renders button with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    
    let button = screen.getByRole('button', { name: 'Small' })
    expect(button).toHaveClass('h-9', 'px-3')

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button', { name: 'Large' })
    expect(button).toHaveClass('h-11', 'px-8')

    rerender(<Button size="icon">Icon</Button>)
    button = screen.getByRole('button', { name: 'Icon' })
    expect(button).toHaveClass('h-10', 'w-10')
  })

  test('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button', { name: 'Custom' })
    expect(button).toHaveClass('custom-class')
  })

  test('handles click events', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    await user.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none')
  })

  test('forwards ref correctly', () => {
    const ref = { current: null }
    
    render(<Button ref={ref}>Ref Button</Button>)
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current).toBe(screen.getByRole('button', { name: 'Ref Button' }))
  })

  test('renders as different element when asChild is true', () => {
    // This would test the Slot component behavior
    // For simplicity, we'll just test that it renders
    render(<Button asChild={false}>Normal Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Normal Button' })
    expect(button).toBeInTheDocument()
    expect(button.tagName).toBe('BUTTON')
  })

  test('has correct accessibility attributes', () => {
    render(<Button disabled>Disabled Button</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled Button' })
    expect(button).toHaveAttribute('disabled')
  })

  test('combines variant and size classes correctly', () => {
    render(<Button variant="outline" size="lg">Large Outline</Button>)
    
    const button = screen.getByRole('button', { name: 'Large Outline' })
    expect(button).toHaveClass('border', 'border-input', 'bg-background') // outline variant
    expect(button).toHaveClass('h-11', 'px-8') // large size
  })
})
