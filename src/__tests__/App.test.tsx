import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Look for the game loading text instead
    const gameElement = screen.getByText(/Loading Game\.\.\./i);
    expect(gameElement).toBeInTheDocument();
  });
});