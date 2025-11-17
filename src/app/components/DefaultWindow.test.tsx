import React from "react";
import { render, screen } from "@testing-library/react";
import DefaultWindow from "./DefaultWindow";

describe("DefaultWindow Component", () => {
  it("renders correctly", () => {
    render(<DefaultWindow />);

    // Assert that the h1 text is rendered correctly
    expect(screen.getByText("Select an agent to start!"))
      .toBeInTheDocument();
  });

  it("has correct structure", () => {
    render(<DefaultWindow />);

    // Assert the presence of container div and content div
    const container = document.querySelector('.content');
    expect(container).toHaveClass("content");

    const content = document.querySelector('.content');
    expect(content).toHaveClass("content");
  });
});