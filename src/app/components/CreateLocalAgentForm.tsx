import React, { useState } from "react";
import styles from "./CreateLocalAgentForm.module.css";
import { useCopilotContext } from "@copilotkit/react-core";
import AgGridTable from "./AgGridTable";
import { Agent } from "./MainLayout";
import { LLM_TYPES, DEFAULT_LLM_CONFIGS, LLMType } from "./LlmConfigs";


interface CreateLocalAgentFormProps {
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
    usage: number;
    llmData?: Record<string, any>;
  }) => void;
  onCancel: () => void;
}

export default function CreateLocalAgentForm({
  agents,
  onCreate,
  onCancel,
}: CreateLocalAgentFormProps) {
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState(`You are an AI agent.
You can call tools. Use them automatically to answer questions accurately.
Always reply in clear, human-readable language. Use simple words, short sentences, and clean formatting.
Understand the user's intent before responding.`);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const threadId = useCopilotContext().threadId;

  // const isFormValid = name.trim() && instructions.trim() && description.trim();

  const selectedAgents = agents.filter((a) =>
    selected.includes(a.name + a.url)
  );


  // Add to existing state declarations:
  const [selectedLLMType, setSelectedLLMType] = useState<LLMType>("Azure OpenAI");
  const [llmConfig, setLLMConfig] = useState(DEFAULT_LLM_CONFIGS["Azure OpenAI"]);

  // Add this function to validate LLM config
  const validateLLMConfig = (config: string): boolean => {
    try {
      // Convert config string to key-value pairs
      const configObj = config.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);

      return Object.keys(configObj).length > 0;
    } catch (e) {
      return false;
    }
  };

  // Update isFormValid check
  const isFormValid = name.trim() && instructions.trim() && description.trim() && llmConfig.trim();

  // Add after other input containers:

  return (
    <div className={styles.Window}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Create Local Agent</h2>
        </div>
        <div className={styles.actions}>
          <button
            disabled={!isFormValid}
            // Update the onClick handler in the Create button
            onClick={() => {
              if (isFormValid) {
                if (!validateLLMConfig(llmConfig)) {
                  alert("The LLM Configuration string format is incorrect");
                  return;
                }

                const configObj = llmConfig.split('\n').reduce((acc, line) => {
                  const [key, value] = line.split('=');
                  if (key && value) {
                    acc[key.trim()] = value.trim();
                  }
                  return acc;
                }, {} as Record<string, string>);

                onCreate({
                  name,
                  url: "",
                  subAgents: selectedAgents,
                  instructions,
                  framework: "",
                  description,
                  type: "local_agent",
                  session_id: threadId,
                  usage: 0,
                  llmData: {
                    llmType: selectedLLMType,
                    llmConfig: configObj
                  }
                });
              }
            }}
            className={styles.primaryButton}
          >
            Create
          </button>
          <button onClick={onCancel} className={styles.secondaryButton}>
            Cancel
          </button>
        </div>
      </div>

      <div className={styles.separator} />

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
                const newConfigKeys = llmConfig.split('
').map(line => line.split('=')[0]?.trim());
                const defaultKeys = Object.keys(DEFAULT_LLM_CONFIGS[selectedLLMType]);

                if (newConfigKeys.some(key => !defaultKeys.includes(key))) {
                  alert("You cannot change the key names. Only edit the values after the equals sign.");
                  setLLMConfig(DEFAULT_LLM_CONFIGS[selectedLLMType]);
                  return;
                }

                if (!validateLLMConfig(llmConfig)) {
                  alert("The LLM Configuration string format is incorrect");
                  setLLMConfig(DEFAULT_LLM_CONFIGS[selectedLLMType]);
                }
              }
              }}
              rows={6}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="agent-name">
              Local Agent Name
            </label>
            <input
              id="agent-name"
              className={styles.input}
              type="text"
              placeholder="e.g. My Local Agent"
              value={name}
              onChange={(e) => {
                const newName = e.target.value;
                const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>/?]+/;
                if (specialCharRegex.test(newName)) {
                  window.alert("Local agent name cannot have special characters in name");
                } else {
                  setName(newName);
                }
              }}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="agent-instructions">
              System Instructions
            </label>
            <textarea
              id="agent-instructions"
              className={styles.textarea}
              placeholder="Agent instruction to perform tasks."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className={styles.inputContainer}>
            <label className={styles.label} htmlFor="agent-description">
              Agent Description
            </label>
            <textarea
              id="agent-description"
              className={styles.textarea}
              placeholder="Agent description."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>
          <div className={styles.inputContainer}>
            <label className={styles.label}>Select MCPs</label>
            <div className={styles.tableContainer}>
              <AgGridTable
                agents={agents.filter((a) => a.type === "mcp")}
                selected={selected}
                setSelected={setSelected}
              />
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
