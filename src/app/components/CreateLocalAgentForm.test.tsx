import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateLocalAgentForm from './CreateLocalAgentForm';
import { useCopilotContext } from '@copilotkit/react-core';
import AgGridTable from './AgGridTable';
import { DEFAULT_LLM_CONFIGS, LLM_TYPES } from './LlmConfigs';

// Mock the useCopilotContext hook
jest.mock('@copilotkit/react-core', () => ({
  useCopilotContext: () => ({ threadId: 'test-thread-id' }),
}));

// Mock the AgGridTable component
jest.mock('./AgGridTable', () => ({
  __esModule: true,
  default: jest.fn(({ agents, selected, setSelected }) => (
    <div data-testid="ag-grid-table">
      {agents.map((agent) => (
        <label key={agent.name + agent.url}>
          <input
            type="checkbox"
            checked={selected.includes(agent.name + agent.url)}
            onChange={() => {
              const agentIdentifier = agent.name + agent.url;
              if (selected.includes(agentIdentifier)) {
                setSelected(selected.filter((item) => item !== agentIdentifier));
              } else {
                setSelected([...selected, agentIdentifier]);
              }
            }}
          />
          {agent.name}
        </label>
      ))}
    </div>
  )),
}));

const mockAgents = [
  { name: 'Agent1', url: 'url1', type: 'mcp', subAgents: [], instructions: '', framework: '', description: '', session_id: '', usage: 0 },
  { name: 'Agent2', url: 'url2', type: 'local_agent', subAgents: [], instructions: '', framework: '', description: '', session_id: '', usage: 0 },
  { name: 'Agent3', url: 'url3', type: 'mcp', subAgents: [], instructions: '', framework: '', description: '', session_id: '', usage: 0 },
];

describe('CreateLocalAgentForm', () => {
  const mockOnCreate = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Create Local Agent')).toBeInTheDocument();
    expect(screen.getByLabelText('Local Agent Name')).toBeInTheDocument();
    expect(screen.getByLabelText('System Instructions')).toBeInTheDocument();
    expect(screen.getByLabelText('Agent Description')).toBeInTheDocument();
    expect(screen.getByLabelText('LLM Type')).toBeInTheDocument();
    expect(screen.getByLabelText('LLM Configuration')).toBeInTheDocument();
    expect(screen.getByText('Select MCPs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('initially disables the Create button', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  it('enables the Create button when all required fields are filled', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText('Local Agent Name'), {
      target: { value: 'New Agent' },
    });
    fireEvent.change(screen.getByLabelText('System Instructions'), {
      target: { value: 'Agent instructions.' },
    });
    fireEvent.change(screen.getByLabelText('Agent Description'), {
      target: { value: 'Agent description.' },
    });
    fireEvent.change(screen.getByLabelText('LLM Configuration'), {
      target: { value: 'API_KEY=test_key' },
    });

    expect(screen.getByRole('button', { name: 'Create' })).not.toBeDisabled();
  });

  it('calls onCancel when the Cancel button is clicked', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('updates input fields correctly', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('Local Agent Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'My Test Agent' } });
    expect(nameInput.value).toBe('My Test Agent');

    const instructionsInput = screen.getByLabelText('System Instructions') as HTMLTextAreaElement;
    fireEvent.change(instructionsInput, { target: { value: 'New instructions.' } });
    expect(instructionsInput.value).toBe('New instructions.');

    const descriptionInput = screen.getByLabelText('Agent Description') as HTMLTextAreaElement;
    fireEvent.change(descriptionInput, { target: { value: 'New description.' } });
    expect(descriptionInput.value).toBe('New description.');

    const llmConfigInput = screen.getByLabelText('LLM Configuration') as HTMLTextAreaElement;
    fireEvent.change(llmConfigInput, { target: { value: 'NEW_CONFIG=value' } });
    expect(llmConfigInput.value).toBe('NEW_CONFIG=value');
  });

  it('shows an alert when agent name contains special characters', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('Local Agent Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Agent@Name' } });

    expect(window.alert).toHaveBeenCalledWith('Local agent name cannot have special characters in name');
    expect(nameInput.value).toBe(''); // Value should not be updated
  });

  it('allows agent name without special characters', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText('Local Agent Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Agent Name' } });
    expect(nameInput.value).toBe('Agent Name');
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('changes LLM type and updates LLM config with default value', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    const llmTypeSelect = screen.getByLabelText('LLM Type') as HTMLSelectElement;
    const llmConfigTextarea = screen.getByLabelText('LLM Configuration') as HTMLTextAreaElement;

    expect(llmTypeSelect.value).toBe('Azure OpenAI');
    expect(llmConfigTextarea.value).toBe(DEFAULT_LLM_CONFIGS['Azure OpenAI']);

    fireEvent.change(llmTypeSelect, { target: { value: 'OpenAI' } });

    expect(llmTypeSelect.value).toBe('OpenAI');
    expect(llmConfigTextarea.value).toBe(DEFAULT_LLM_CONFIGS['OpenAI']);
  });

  it('shows an alert for incorrect LLM Configuration format on blur', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    const llmConfigTextarea = screen.getByLabelText('LLM Configuration') as HTMLTextAreaElement;
    fireEvent.change(llmConfigTextarea, { target: { value: 'invalid-config' } });
    fireEvent.blur(llmConfigTextarea);

    expect(window.alert).toHaveBeenCalledWith('The LLM Configuration string format is incorrect');
    expect(llmConfigTextarea.value).toBe(DEFAULT_LLM_CONFIGS['Azure OpenAI']); // Resets to default
  });

  it('does not show an alert for correct LLM Configuration format on blur', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    const llmConfigTextarea = screen.getByLabelText('LLM Configuration') as HTMLTextAreaElement;
    fireEvent.change(llmConfigTextarea, { target: { value: 'API_KEY=valid_key\nANOTHER_KEY=another_value' } });
    fireEvent.blur(llmConfigTextarea);

    expect(window.alert).not.toHaveBeenCalled();
    expect(llmConfigTextarea.value).toBe('API_KEY=valid_key\nANOTHER_KEY=another_value');
  });

  it('calls onCreate with correct data when form is valid and submitted (with duplicate validation)', async () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    // Attempt to create a duplicate agent
    fireEvent.change(screen.getByLabelText('Local Agent Name'), {
      target: { value: 'Agent2' },
    });

    fireEvent.change(screen.getByLabelText('System Instructions'), {
      target: { value: 'Duplicate instructions.' },
    });
    fireEvent.change(screen.getByLabelText('Agent Description'), {
      target: { value: 'Duplicate description.' },
    });
    fireEvent.change(screen.getByLabelText('LLM Configuration'), {
      target: { value: 'API_KEY=duplicate_key' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    expect(window.alert).toHaveBeenCalledWith('A local agent with this name already exists. Please choose a different name.');
    expect(mockOnCreate).not.toHaveBeenCalled();

    // Attempt for a fresh Create
    fireEvent.change(screen.getByLabelText('Local Agent Name'), {
      target: { value: 'Submit Agent' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        name: 'Submit Agent',
        url: '',
        subAgents: [],
        instructions: 'Duplicate instructions.',
        framework: '',
        description: 'Duplicate description.',
        type: 'local_agent',
        session_id: 'test-thread-id',
        usage: 0,
        llmData: {
          llmType: 'Azure OpenAI',
          llmConfig: { API_KEY: 'duplicate_key' },
        },
      });
    });
  });
    fireEvent.change(screen.getByLabelText('System Instructions'), {
      target: { value: 'Submit instructions.' },
    });
    fireEvent.change(screen.getByLabelText('Agent Description'), {
      target: { value: 'Submit description.' },
    });
    fireEvent.change(screen.getByLabelText('LLM Configuration'), {
      target: { value: 'API_KEY=submit_key' },
    });

    // Select an MCP agent
    fireEvent.click(screen.getByLabelText('Agent1'));

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledTimes(1);
      expect(mockOnCreate).toHaveBeenCalledWith({
        name: 'Submit Agent',
        url: '',
        subAgents: [
          { name: 'Agent1', url: 'url1', type: 'mcp', subAgents: [], instructions: '', framework: '', description: '', session_id: '', usage: 0 }
        ],
        instructions: 'Submit instructions.',
        framework: '',
        description: 'Submit description.',
        type: 'local_agent',
        session_id: 'test-thread-id',
        usage: 0,
        llmData: {
          llmType: 'Azure OpenAI',
          llmConfig: { API_KEY: 'submit_key' },
        },
      });
    });
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('does not call onCreate if LLM Configuration is invalid on submit', async () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByLabelText('Local Agent Name'), {
      target: { value: 'Submit Agent' },
    });
    fireEvent.change(screen.getByLabelText('System Instructions'), {
      target: { value: 'Submit instructions.' },
    });
    fireEvent.change(screen.getByLabelText('Agent Description'), {
      target: { value: 'Submit description.' },
    });
    fireEvent.change(screen.getByLabelText('LLM Configuration'), {
      target: { value: 'invalid-config' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('The LLM Configuration string format is incorrect');
    });
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('renders AgGridTable with filtered agents (only mcp type)', () => {
    render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );

    expect(AgGridTable).toHaveBeenCalledWith(
      expect.objectContaining({
        agents: [
          { name: 'Agent1', url: 'url1', type: 'mcp', subAgents: [], instructions: '', framework: '', description: '', session_id: '', usage: 0 },
          { name: 'Agent3', url: 'url3', type: 'mcp', subAgents: [], instructions: '', framework: '', description: '', session_id: '', usage: 0 },
        ],
        selected: expect.any(Array),
        setSelected: expect.any(Function),
      }),
      undefined // Explicitly expect the undefined second argument
    );
  });

  it('matches snapshot', () => {
    const { asFragment } = render(
      <CreateLocalAgentForm
        agents={mockAgents}
        onCreate={mockOnCreate}
        onCancel={mockOnCancel}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
