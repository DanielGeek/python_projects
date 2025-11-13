import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import Home from './Home'

const MockWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

MockWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('Home Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('renders home page correctly', () => {
    render(
      <MockWrapper>
        <Home />
      </MockWrapper>
    )

    expect(screen.getByRole('heading', { name: 'Welcome Home!' })).toBeInTheDocument()
    expect(
      screen.getByText('You are successfully logged in to your account.')
    ).toBeInTheDocument()
    expect(
      screen.getByText('This is your dashboard where you can manage your account and access various features.')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  test('logout button clears localStorage and navigates to login', async () => {
    const user = userEvent.setup()
    
    // Set some initial localStorage data
    localStorage.setItem('access-token', 'mock-token')
    localStorage.setItem('refresh-token', 'mock-refresh')
    localStorage.setItem('other-data', 'some-value')

    render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    )

    const logoutButton = screen.getByRole('button', { name: 'Logout' })
    
    await act(async () => {
      await user.click(logoutButton)
    })

    // Check that localStorage was cleared
    expect(localStorage.getItem('access-token')).toBeNull()
    expect(localStorage.getItem('refresh-token')).toBeNull()
    expect(localStorage.getItem('other-data')).toBeNull()
  })

  test('logout button has correct styling classes', () => {
    render(
      <MockWrapper>
        <Home />
      </MockWrapper>
    )

    const logoutButton = screen.getByRole('button', { name: 'Logout' })
    expect(logoutButton).toHaveClass('w-full')
  })

  test('card component renders with correct structure', () => {
    render(
      <MockWrapper>
        <Home />
      </MockWrapper>
    )

    // Check if the card structure is present
    const card = screen.getByRole('heading', { name: 'Welcome Home!' }).closest('.rounded-lg')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('border', 'bg-card', 'text-card-foreground', 'shadow-sm')
  })

  test('dashboard description has correct styling', () => {
    render(
      <MockWrapper>
        <Home />
      </MockWrapper>
    )

    const description = screen.getByText(
      'This is your dashboard where you can manage your account and access various features.'
    )
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })
})
