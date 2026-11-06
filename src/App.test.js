import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('muestra el menú y empieza una partida', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: /mina/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /jugar/i }));

  expect(screen.getByText('Ronda 1')).toBeInTheDocument();
  expect(
    screen.getByRole('group', { name: /tablero de 8 por 8/i })
  ).toBeInTheDocument();
  expect(screen.getAllByRole('button', { name: /casilla/i })).toHaveLength(64);
});
