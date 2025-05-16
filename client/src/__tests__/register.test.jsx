import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from '../components/RegisterForm';

describe('RegisterForm', () => {
  test('successfully fills the form and submits with valid password', async () => {
    const { container } = render(<RegisterForm />);

    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');
    const submitButton = container.querySelector('#submitButton');

    // Wypełnij formularz poprawnymi danymi
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Valid123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Valid123!' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/successful register. Please confirm your account on email/i)).toBeInTheDocument();
    });
  });

  test('displays error when email is already taken', async () => {
    const { container } = render(<RegisterForm />);

    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');
    const submitButton = container.querySelector('#submitButton');

    // Wypełnij formularz z już istniejącym emailem
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Valid123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Valid123!' } });

    fireEvent.click(submitButton);

    // Oczekuj, że pojawi się komunikat o błędzie
    await waitFor(() => {
      expect(screen.getByText(/Email is already in use/i)).toBeInTheDocument();
    });
  });

  test('displays error when password does not meet requirements', async () => {
    const { container } = render(<RegisterForm />);

    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');
    const submitButton = container.querySelector('#submitButton');

    // Wypełnij formularz z hasłem, które nie spełnia wymagań (np. za krótkie)
    fireEvent.change(emailInput, { target: { value: 'testerrrr@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } }); // Zbyt krótkie hasło
    fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });

    fireEvent.click(submitButton);

    // Oczekuj, że pojawi się komunikat o błędzie
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character/i)).toBeInTheDocument();
    });
  });

  test('displays error when passwords do not match', async () => {
    const { container } = render(<RegisterForm />);

    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const confirmPasswordInput = container.querySelector('#confirmPassword');
    const submitButton = container.querySelector('#submitButton');

    // Wypełnij formularz z niezgodnymi hasłami
    fireEvent.change(emailInput, { target: { value: 'tester@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Valid123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Invalid123!' } }); // Niepasujące hasło

    fireEvent.click(submitButton);

    // Oczekuj, że pojawi się komunikat o błędzie
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
