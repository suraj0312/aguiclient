import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import AgentRibbon from "./AgentRibbon";

const mockProps = {
  agents: [
    { name: "Agent 1", url: "http://agent1.com", type: "a2a_agent" },
    { name: "Agent 2", url: "http://agent2.com", type: "orchestrator" },
    { name: "Agent 3", url: "http://agent3.com", type: "local_agent" },
    { name: "MCP Agent", url: "http://mcp.com", type: "mcp" },
  ],
  selectedAgentUrl: "http://agent1.com",
  selectedAgentName: "Agent 1",
  onSelectAgent: jest.fn(),
  agentType: "a2a_agent",
  setAgentType: jest.fn(),
};

describe("AgentRibbon Component", () => {
  test("renders the component correctly", () => {
    render(<AgentRibbon {...mockProps} />);

    // Check if radio buttons are rendered
    expect(screen.getByLabelText(/A2A Agents/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Orchestrators/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Local Agents/i)).toBeInTheDocument();

    // Check if agent buttons are rendered
    expect(screen.getByText("Agent 1")).toBeInTheDocument();
  });

  test("filters agents based on agentType", () => {
    render(<AgentRibbon {...mockProps} />);

    // A2A Agents should be shown
    expect(screen.getByText("Agent 1")).toBeInTheDocument();
    expect(screen.queryByText("Agent 2")).not.toBeInTheDocument();
    expect(screen.queryByText("Agent 3")).not.toBeInTheDocument();
  });

  test("displays a message when there are no agents of the selected type", () => {
    render(
      <AgentRibbon
        {...mockProps}
        agents={mockProps.agents.filter((agent) => agent.type === "mcp")}
        agentType="local_agent"
      />
    );

    expect(screen.getByText(/No agents available/i)).toBeInTheDocument();
  });

  test("calls setAgentType when a radio button is clicked", () => {
    render(<AgentRibbon {...mockProps} />);

    const orchestratorsRadio = screen.getByLabelText(/Orchestrators/i);

    fireEvent.click(orchestratorsRadio);

    expect(mockProps.setAgentType).toHaveBeenCalledWith("orchestrator");
  });

  test("calls onSelectAgent when an agent button is clicked", () => {
    render(<AgentRibbon {...mockProps} />);

    const agentButton = screen.getByText("Agent 1");
    fireEvent.click(agentButton);

    expect(mockProps.onSelectAgent).toHaveBeenCalledWith({
      name: "Agent 1",
      url: "http://agent1.com",
      type: "a2a_agent",
    });
  });

  test("applies the selected style to the selected agent", () => {
  render(<AgentRibbon {...mockProps} />);

  // Find the button for the selected agent
  const selectedAgentButton = screen.getByText("Agent 1");

  // Ensure it has the "selected" class
  expect(selectedAgentButton).toHaveClass("selected");
});

test("displays 'No agents available' when no agents match the filter", () => {
  render(
    <AgentRibbon
      {...mockProps}
      agents={[]}
    />
  );

  expect(screen.getByText(/No agents available/i)).toBeInTheDocument();
});

test("does not render 'mcp' type agents", () => {
  render(
    <AgentRibbon
      {...mockProps}
      agents={[
        { name: "MCP Agent", url: "http://mcp.com", type: "mcp" },
      ]}
    />
  );

  expect(screen.queryByText("MCP Agent")).not.toBeInTheDocument();
});

test("calls onSelectAgent correctly when button is clicked", () => {
  render(<AgentRibbon {...mockProps} />);

  const agentButton = screen.getByText("Agent 1");
  fireEvent.click(agentButton);

  expect(mockProps.onSelectAgent).toHaveBeenCalledWith({
    name: "Agent 1",
    url: "http://agent1.com",
    type: "a2a_agent",
  });
});
});

