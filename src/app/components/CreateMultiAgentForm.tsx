import React, { useState } from "react";
import styles from "./CreateMultiAgentForm.module.css";
import { useCopilotContext } from "@copilotkit/react-core";
import AgGridTable from "./AgGridTable";
import { Agent } from "./MainLayout";
import { LLM_TYPES, DEFAULT_LLM_CONFIGS, LLMType } from "./LlmConfigs";

interface CreateMultiAgentFormProps {
  agents: Agent[];
  onCreate: (agent: {
    name: string;
    url: string;
    subAgents: Agent[];
    instructions: string;
    framework: string;
    description: string;
    type: string;
    session_id: string;
    usage:number;
    llmData?: Record<string, any>;
  }) => void;
  onCancel: () => void;
}

export default function CreateMultiAgentForm({
  agents,
  onCreate,
  onCancel,
}: CreateMultiAgentFormProps) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null); // New state
  const threadId = useCopilotContext().threadId;

  const handleCreate = () => {
    // Check for duplicates
    if (agents.some((agent) => agent.name === name.trim())) {
      setError("Orchestrator with the given name already exists. Please use a different name.");
      return;
    }

    setError(null); // Clear any previous error

    const selectedAgents = agents.filter((a) =>
      selected.includes(a.name + a.url)
    );

    onCreate({
      name: name.trim(),
      url: "", // Add appropriate URL or input
      subAgents: selectedAgents,
      instructions: instructions.trim(),
      framework: "", // Define as needed
      description: "", // Define as needed
      type: "multi-agent",
      session_id: threadId,
      usage: 0, // Initialize as needed
    });
  };

  return (
    <form className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter orchestrator name"
      />
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Enter instructions"
      />
      {/* Add more inputs as needed */}
      <button type="button" onClick={handleCreate}>
        Create Orchestrator
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
          >
            Create
          </button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <div className={styles.separator}></div>

      <div className={`${styles.inputSection} ${styles.customScrollbar}`}>
        <div className={styles.inputs}>
          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="llm-type">
              LLM Type
            </label>
            <select
              id="llm-type"
              className={styles.input}
              value={selectedLLMType}
              onChange={(e) => {
                const newType = e.target.value as LLMType;
                setSelectedLLMType(newType);
                setLLMConfig(DEFAULT_LLM_CONFIGS[newType]);
              }}
              required
            >
              {LLM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="llm-config">
              LLM Configuration
            </label>
            <textarea
              id="llm-config"
              className={styles.textarea}
              value={llmConfig}
              onChange={(e) => setLLMConfig(e.target.value)}
              onBlur={() => {
                if (!validateLLMConfig(llmConfig)) {
                  alert("The LLM Configuration string format is incorrect");
                  setLLMConfig(DEFAULT_LLM_CONFIGS[selectedLLMType]);
                }
              }}
              rows={6}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="orchestrator-name">
              Orchestrator Name
            </label>
            <input
              id="orchestrator-name"
              className={styles.input}
              type="text"
              placeholder="e.g. My Orchestrator Agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="system-instructions">
              System Instructions
            </label>
            <textarea
              id="system-instructions"
              className={styles.textarea}
              placeholder="Supervisor instruction for managing multiple agents"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label}>Select Agents</label>
            <div className={styles.tableContainer}>
              <AgGridTable
                agents={agents.filter((a) => a.type === "a2a_agent")}
                selected={selected}
                setSelected={setSelected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}