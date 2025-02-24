import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import LoginForm from '@/components/auth/LoginForm';

// Mock Firebase and Next.js router
jest.mock('firebase/auth');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe('LoginForm', () => {
  const mockRouter = { replace: jest.fn() };
  
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('validates email format before submission', async () => {
    render(<LoginForm />);
    
    // Test invalid email
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('requires .edu email for Google sign-in', async () => {
    (signInWithPopup as jest.Mock).mockResolvedValueOnce({
      user: { email: 'test@gmail.com' }
    });

    render(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    
    expect(screen.getByText(/please use your university email address/i)).toBeInTheDocument();
  });

  it('handles successful email login', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { email: 'test@university.edu' }
    });

    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@university.edu' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/development/dashboard');
    });
  });
}); 