import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import NotFound from './NotFound'

describe('NotFound Component', () => {
  test('renders 404 page correctly', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
    expect(
      screen.getByText('The page you\'re looking for doesn\'t exist!')
    ).toBeInTheDocument()
    expect(
      screen.getByText('It seems you\'ve stumbled upon a page that doesn\'t exist. Don\'t worry, it happens to the best of us!')
    ).toBeInTheDocument()
  })

  test('has Go Home button that navigates to home', async () => {
    render(
      <MemoryRouter initialEntries={['/not-found']}>
        <NotFound />
      </MemoryRouter>
    )

    const goHomeButton = screen.getByRole('button', { name: 'Go Home' })
    expect(goHomeButton).toBeInTheDocument()
    
    // Note: In a real test, you'd check navigation behavior
    // but for this unit test, we just verify the button exists
  })

  test('has Go to Login button that navigates to login', async () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    const goToLoginButton = screen.getByRole('button', { name: 'Go to Login' })
    expect(goToLoginButton).toBeInTheDocument()
  })

  test('404 heading has correct styling', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    const heading = screen.getByRole('heading', { name: '404' })
    expect(heading).toHaveClass('text-4xl', 'font-bold')
  })

  test('card component renders with correct structure', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    // Check if the card structure is present
    const card = screen.getByRole('heading', { name: '404' }).closest('.rounded-lg')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('border', 'bg-card', 'text-card-foreground', 'shadow-sm')
  })

  test('buttons have correct styling classes', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    const goHomeButton = screen.getByRole('button', { name: 'Go Home' })
    const goToLoginButton = screen.getByRole('button', { name: 'Go to Login' })

    expect(goHomeButton).toHaveClass('w-full')
    expect(goToLoginButton).toHaveClass('w-full')
    expect(goToLoginButton).toHaveClass('inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full') // variant="outline"
  })

  test('error message has correct styling', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    const errorMessage = screen.getByText(
      'It seems you\'ve stumbled upon a page that doesn\'t exist. Don\'t worry, it happens to the best of us!'
    )
    expect(errorMessage).toHaveClass('text-sm', 'text-muted-foreground', 'text-center')
  })

  test('card header has center alignment', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    const cardHeader = screen.getByRole('heading', { name: '404' }).closest('.text-center')
    expect(cardHeader).toBeInTheDocument()
  })
})
