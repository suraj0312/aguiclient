import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DefaultWindow from '../DefaultWindow';

// Mocking the CSS module to avoid import errors
jest.mock('../DefaultWindow.module.css', () => ({
    Window: 'mocked-Window-class',
    content: 'mocked-content-class',
}));

describe('DefaultWindow Component', () => {
    test('should render without crashing', () => {
        // Act
        render(<DefaultWindow />);

        // Assert
        const headerElement = screen.getByText('Select an agent to start!');
        expect(headerElement).toBeInTheDocument();
    });

    test('should contain the proper class for styling', () => {
        // Act
        render(<DefaultWindow />);

        // Assert
        const container = screen.getByText('Select an agent to start!').closest('div');
        expect(container?.className).toContain('mocked-content-class');
    });

    test('should match snapshot for consistent UI', () => {
        // Act
        const { container } = render(<DefaultWindow />);

        // Assert
        expect(container).toMatchSnapshot();
    });
});