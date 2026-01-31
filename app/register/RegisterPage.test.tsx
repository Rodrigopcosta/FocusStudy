import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from './page';
import { useRouter } from 'next/navigation';

// Mock do next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do Supabase (ajuste o caminho se necessário)
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: jest.fn(),
    },
  }),
}));

// Mock do next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

describe('RegisterPage - Validações do Formulário', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
    });
  });

  it('deve exibir erro se a senha tiver menos de 6 caracteres', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText(/senha/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/a senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
  });

  it('deve exibir erro se a senha não contiver letras maiúsculas', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(passwordInput, { target: { value: 'short1!' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/a senha deve conter pelo menos uma letra maiúscula/i)).toBeInTheDocument();
  });

  it('deve exibir erro se a senha não contiver caracteres especiais', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(passwordInput, { target: { value: 'Senha123' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/a senha deve conter pelo menos um caractere especial/i)).toBeInTheDocument();
  });

  it('deve exibir erro se as senhas não coincidirem', async () => {
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });

    fireEvent.change(passwordInput, { target: { value: 'Senha123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Senha321!' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/as senhas não coincidem/i)).toBeInTheDocument();
  });

  it('deve exibir erro se os termos não forem aceitos', async () => {
    render(<RegisterPage />);
    
    const submitButton = screen.getByRole('button', { name: /cadastrar/i });
    
    // Preenche campos válidos mas mantém o checkbox desmarcado
    fireEvent.change(screen.getByLabelText(/nome/i), { target: { value: 'Rodrigo' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'rodrigo@teste.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'Senha123!' } });
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), { target: { value: 'Senha123!' } });
    
    fireEvent.click(submitButton);

    expect(await screen.findByText(/você deve aceitar os termos e condições/i)).toBeInTheDocument();
  });
});