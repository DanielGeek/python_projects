import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { vi } from 'vitest'
import { act } from 'react'
import Form from './Form'
import api from '../api'

// Mock the api module
vi.mock('../api')

const MockWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

MockWrapper.propTypes = {
  children: PropTypes.node.isRequired,
}

describe('Form Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  test('renders login form correctly', () => {
    render(
      <MockWrapper>
        <Form route="/api/token/" method="login" />
      </MockWrapper>
    )

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })

  test('renders register form correctly', () => {
    render(
      <MockWrapper>
        <Form route="/api/user/register/" method="register" />
      </MockWrapper>
    )

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument()
  })

  test('updates input values when user types', async () => {
    const user = userEvent.setup()
    render(
      <MockWrapper>
        <Form route="/api/token/" method="login" />
      </MockWrapper>
    )

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'testpass123')

    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('testpass123')
  })

  test('submits login form successfully', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      data: {
        access: 'mock-access-token',
        refresh: 'mock-refresh-token',
      },
    }
    api.post.mockResolvedValue(mockResponse)

    render(
      <MockWrapper>
        <Form route="/api/token/" method="login" />
      </MockWrapper>
    )

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await act(async () => {
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'testpass123')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/token/', {
        username: 'testuser',
        password: 'testpass123',
      })
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'access',
      'mock-access-token'
    )
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'refresh',
      'mock-refresh-token'
    )
  })

  test('submits registration form successfully', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      data: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      },
    }
    api.post.mockResolvedValue(mockResponse)

    render(
      <MockWrapper>
        <Form route="/api/user/register/" method="register" />
      </MockWrapper>
    )

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Register' })

    await act(async () => {
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'testpass123')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/user/register/', {
        username: 'testuser',
        password: 'testpass123',
      })
    })
  })

  test('handles form submission error', async () => {
    const user = userEvent.setup()
    const mockError = new Error('Invalid credentials')
    api.post.mockRejectedValue(mockError)
    
    // Mock alert
    window.alert = vi.fn()

    render(
      <MockWrapper>
        <Form route="/api/token/" method="login" />
      </MockWrapper>
    )

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await act(async () => {
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'wrongpass')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(mockError)
    })
  })

  test('disables button and shows loading state during submission', async () => {
    const user = userEvent.setup()
    api.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <MockWrapper>
        <Form route="/api/token/" method="login" />
      </MockWrapper>
    )

    const usernameInput = screen.getByPlaceholderText('Username')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    await act(async () => {
      await user.type(usernameInput, 'testuser')
      await user.type(passwordInput, 'testpass123')
      await user.click(submitButton)
    })

    expect(submitButton).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument()
  })

  test('displays correct description for login form', () => {
    render(
      <MockWrapper>
        <Form route="/api/token/" method="login" />
      </MockWrapper>
    )

    expect(
      screen.getByText('Enter your credentials to access your account')
    ).toBeInTheDocument()
  })

  test('displays correct description for register form', () => {
    render(
      <MockWrapper>
        <Form route="/api/user/register/" method="register" />
      </MockWrapper>
    )

    expect(
      screen.getByText('Create a new account to get started')
    ).toBeInTheDocument()
  })
})
