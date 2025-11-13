import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatWindow from './ChatWindow';

describe('ChatWindow', () => {
  it('renders without crashing', () => {
    render(<ChatWindow selectedAgentName="Test Agent" selectedAgentDescription="A test description" />);
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
  });

  it('displays the correct initial message with provided agent name and description', () => {
    const agentName = 'My Agent';
    const agentDescription = 'This is my super agent.';
    render(<ChatWindow selectedAgentName={agentName} selectedAgentDescription={agentDescription} />);
    
    expect(screen.getByText(`Hi! I'm connected to **${agentName}** - ${agentDescription}. How can I help?`)).toBeInTheDocument();
  });

  it('applies the chatWindow CSS class to the main div', () => {
    const { container } = render(<ChatWindow selectedAgentName="Agent" selectedAgentDescription="Description" />);
    expect(container.firstChild).toHaveClass('chatWindow');
  });

  it('updates the initial message when props change', () => {
    const { rerender } = render(<ChatWindow selectedAgentName="Agent1" selectedAgentDescription="Desc1" />);
    expect(screen.getByText("Hi! I'm connected to **Agent1** - Desc1. How can I help?")).toBeInTheDocument();

    rerender(<ChatWindow selectedAgentName="Agent2" selectedAgentDescription="Desc2" />);
    expect(screen.getByText("Hi! I'm connected to **Agent2** - Desc2. How can I help?")).toBeInTheDocument();
  });

  it('renders correctly with empty agent name and description', () => {
    render(<ChatWindow selectedAgentName="" selectedAgentDescription="" />);
    expect(screen.getByText('Chat Assistant')).toBeInTheDocument();
    expect(screen.getByText(`Hi! I'm connected to **** - . How can I help?`)).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<ChatWindow selectedAgentName="Snapshot Agent" selectedAgentDescription="Snapshot Description" />);
    expect(asFragment()).toMatchSnapshot();
  });
});