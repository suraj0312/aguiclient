import React, { useState } from "react";
import styles from "./AddMcp.module.css";
import { useCopilotContext } from "@copilotkit/react-core";
import { Agent } from "./MainLayout";


interface AddAgentModalProps {
    onAdd: (agent: {
        name: string;
        url: string;
        subAgents: Agent[];
        instructions: string;
        framework: string;
        description: string;
        type: string;
        session_id: string;
        usage: number;
    }) => void;
    onCancel: () => void;
}

export default function AddAgentModal({ onAdd, onCancel }: AddAgentModalProps) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const threadId = useCopilotContext().threadId;

    const isFormValid = url.trim() !== "";

    const [headers, setHeaders] = useState([{ key: "", value: "" }]);


    const handleHeaderChange = (index: number, field: "key" | "value", value: string) => {
        const updatedHeaders = [...headers];
        updatedHeaders[index][field] = value;
        setHeaders(updatedHeaders);
    };

    const addHeaderRow = () => {
        setHeaders([...headers, { key: "", value: "" }]);
    };

    const removeHeaderRow = (index: number) => {
        const updatedHeaders = headers.filter((_, i) => i !== index);
        setHeaders(updatedHeaders);
    };

    const convertHeadersToJsonString = () => {
        const json: Record<string, string> = {};
        headers.forEach(({ key, value }) => {
            if (key.trim()) {
                json[key.trim()] = value.trim();
            }
        });
        return JSON.stringify(json); // Pretty JSON string
    };

    return (
        <div className={styles.Window}>
            <div className={styles.headerContainer}>
                <div className={styles.headerContent}>
                    <h2 className={styles.title}>Add MCP</h2>
                </div>
                <div className={styles.actions}>
                    <button
                        disabled={!isFormValid}
                        onClick={() => {
                            onAdd({
                                name,
                                url,
                                subAgents: [],
                                instructions: convertHeadersToJsonString(),
                                framework: "mcp",
                                description: "",
                                type: "mcp",
                                session_id: threadId,
                                usage: 0,
                            });
                            setName("");
                            setUrl("");
                            setHeaders([{ key: "", value: "" }]);
                        }}
                    >
                        Add
                    </button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            </div>
            <div className={styles.separator}></div>
            <div className={`${styles.inputSection} ${styles.customScrollbar}`}>
                <div className={styles.inputs}>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>MCP Name</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. My MCP"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputContainer}>
                        <label className={styles.label}>MCP URL</label>
                        <input
                            className={styles.input}
                            type="text"
                            placeholder="e.g. http://localhost:1234"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    <div className={styles.inputContainer}>
                        <label className={styles.label}>MCP Headers</label>
                        {headers.map((header, index) => (
                            <div key={index} className={styles.headerRow}>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Header Key"
                                    value={header.key}
                                    onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
                                />
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="Header Value"
                                    value={header.value}
                                    onChange={(e) => handleHeaderChange(index, "value", e.target.value)}
                                />
                                <button onClick={() => removeHeaderRow(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="#5f5f5f" width="24px" height="24px" viewBox="0 0 24.00 24.00" stroke="#5f5f5f">
                                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                        <g id="SVGRepo_iconCarrier">
                                            <path d="M19 13H5v-2h14v2z"></path>
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <div className={styles.addHeaderButtonContainer}>
                            <button onClick={addHeaderRow}>
                                <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" strokeWidth="0.336">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            fillRule="evenodd" clipRule="evenodd" d="M11.25 12.75V18H12.75V12.75H18V11.25H12.75V6H11.25V11.25H6V12.75H11.25Z" fill="#5f5f5f">
                                        </path>
                                    </g>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
