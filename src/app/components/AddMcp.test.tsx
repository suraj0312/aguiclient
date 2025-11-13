import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddAgentModal from "./AddMcp";

jest.mock("@copilotkit/react-core", () => ({
  useCopilotContext: () => ({
    threadId: "mock-thread-id",
  }),
}));

describe("AddMcp Component", () => {
  const mockOnAdd = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    render(<AddAgentModal onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    expect(screen.getByText("Add MCP")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. My MCP")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. http://localhost:1234")).toBeInTheDocument();
  });

  it("calls onAdd with correct data", () => {
    render(<AddAgentModal onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    fireEvent.change(screen.getByPlaceholderText("e.g. My MCP"), {
      target: { value: "Test MCP" },
    });
    fireEvent.change(screen.getByPlaceholderText("e.g. http://localhost:1234"), {
      target: { value: "http://localhost:1234" },
    });

    fireEvent.click(screen.getByText("Add"));

    expect(mockOnAdd).toHaveBeenCalledWith({
      name: "Test MCP",
      url: "http://localhost:1234",
      subAgents: [],
      instructions: "{}",
      framework: "mcp",
      description: "",
      type: "mcp",
      session_id: "mock-thread-id",
      usage: 0,
    });

    expect(screen.getByPlaceholderText("e.g. My MCP")).toHaveValue("");
    expect(screen.getByPlaceholderText("e.g. http://localhost:1234")).toHaveValue("");
  });

  it("adds and removes header rows", () => {
    render(<AddAgentModal onAdd={mockOnAdd} onCancel={mockOnCancel} />);

    expect(screen.getAllByPlaceholderText("Header Key").length).toBe(1);

    // Add a new header row
    fireEvent.click(screen.getByTestId("add-header"));
    expect(screen.getAllByPlaceholderText("Header Key").length).toBe(2);

    // Remove the last header row
    fireEvent.click(screen.getAllByTestId("remove-header")[1]);
    expect(screen.getAllByPlaceholderText("Header Key").length).toBe(1);
  });
});