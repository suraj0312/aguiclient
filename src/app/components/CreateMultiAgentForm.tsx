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
  const threadId = useCopilotContext().threadId;

  // const isFormValid = name.trim() !== "" && instructions.trim() !== "" && selected.length > 0;

  // const selectedAgents = agents.filter((a) => selected.includes(a.name + a.url));

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
  const isFormValid = name.trim() && instructions.trim() && llmConfig.trim();

  return (
    <div className={styles.Window}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Create Orchestrator</h2>
        </div>
        <div className={styles.actions}>
          <button
            disabled={!isFormValid}
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
                  url: "http://localhost:8083",
                  subAgents: selectedAgents,
                  instructions,
                  framework: "",
                  description : "",
                  type: "orchestrator",
                  session_id: threadId,
                  usage: 0,
                  llmData: {
                    llmType: selectedLLMType,
                    llmConfig: configObj
                  }
                });
              }
            }}
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