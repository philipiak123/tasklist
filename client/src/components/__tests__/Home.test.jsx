import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../Home';

describe('Home component redirect', () => {
  beforeEach(() => {
    delete window.location;
    window.location = { href: '' };

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('przekierowuje do /login, gdy nie ma ciasteczka token', async () => {
    render(<Home />);

    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });
  });

  test('nie przekierowuje, gdy jest ciasteczko token i fetch zwraca 200', async () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'token=valid-token',
    });

    fetch.mockImplementation((url) => {
      if (url === 'http://localhost:5001/auth/data') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ email: 'test@example.com', darkMode: false }),
        });
      }

      if (url === 'http://localhost:5001/list/lists') {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve([]),
        });
      }

      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<Home />);

    await new Promise((r) => setTimeout(r, 100));
    expect(window.location.href).toBe('');
  });
});

describe('Home component list management', () => {
  beforeEach(() => {
    delete window.location;
    window.location = { href: '' };

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'token=valid-token',
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('usuwa listę po kliknięciu Delete', async () => {
    const listsInitial = [
      { id: 1, name: 'List 1' },
      { id: 2, name: 'List 2' },
    ];
    const listsAfterDelete = [
      { id: 2, name: 'List 2' },
    ];

    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ email: 'test@example.com' }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(listsInitial),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(listsAfterDelete),
        })
      );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('List 1')).toBeInTheDocument();
      expect(screen.getByText('List 2')).toBeInTheDocument();
    });

    jest.spyOn(window, 'confirm').mockReturnValueOnce(true);

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(screen.queryByText('List 1')).not.toBeInTheDocument();
      expect(screen.getByText('List 2')).toBeInTheDocument();
    });

    window.confirm.mockRestore();
  });

  test('edytuje nazwę listy', async () => {
    const listsInitial = [{ id: 1, name: 'List 1' }];
    const listsAfterEdit = [{ id: 1, name: 'Edited List' }];

    fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ email: 'test@example.com' }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(listsInitial),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({ ok: true })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(listsAfterEdit),
        })
      );

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('List 1')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    const input = screen.getByDisplayValue('List 1');
    fireEvent.change(input, { target: { value: 'Edited List' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.queryByText('Edit')).not.toBeNull();
      expect(screen.getByText('Edited List')).toBeInTheDocument();
    });
  });
});
