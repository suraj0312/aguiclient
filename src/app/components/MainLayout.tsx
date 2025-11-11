"use client";
import React, { useState, useEffect, useCallback } from "react";
import AgentRibbon from "./AgentRibbon";
import Sidebar from "./Sidebar";
import AddAgentModal from "./AddAgentModal";
import CreateMultiAgentForm from "./CreateMultiAgentForm";
import ChatWindow from "./ChatWindow";
import styles from "./MainLayout.module.css";
import ListA2AAgents from "./ListA2AAgents";
import ListOrchestrators from "./ListOrchestrators";
import EditOrchestratorForm from "./EditOrchestratorForm";
import CreateLocalAgentForm from "./CreateLocalAgentForm";
import ListLocalAgents from "./ListLocalAgent";
import EditLocalAgentForm from "./EditLocalAgentForm";
import AddMcp from "./AddMcp";
import { useCopilotContext } from "@copilotkit/react-core";
import DefaultWindow from "./DefaultWindow";
import ListMCP from "./ListMCP";
import ShowAgentCard from "./ShowAgentCard";

export interface Agent {
  name: string;
  url: string;
  type: string;
  description?: string;
  instructions?: string;
  framework?: string;
  session_id?: string;
  subAgents?: Agent[];
  usage?: number;
  llmData?: Record<string, any>;
}

export default function MainLayout() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentType, setAgentType] = useState("a2a_agent");
  const [selectedAgentUrl, setSelectedAgentUrl] = useState("");
  const [selectedAgentName, setSelectedAgentName] = useState("");
  const [selectedAgentDescription, setSelectedAgentDescription] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("defaultWindow");
  const [activeSidebarButton, setActiveSidebarButton] = useState("chat");
  const [chatHistories, setChatHistories] = useState<Record<string, string[]>>({});
  const [currentChatAgentUrl, setCurrentChatAgentUrl] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAgentSelected,setIsAgentSelected] = useState(false)
  const threadId = useCopilotContext().threadId;


  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/get-agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data.length ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    }
  }, []);


  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);


  const handleSelectAgent = async (agent: Agent) => {
    agent.session_id = threadId;
    try {
      const res = await fetch("/api/copilotkit/set-agent-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
      });

      if (!res.ok) {
        throw new Error(`Failed to set agent URL. Status: ${res.status}`);
      }

      const responseData = await res.json();
      // if (responseData.message=="Agent already exists"){
        
      //   return null
      // }
      if (!responseData.agentData) {
        throw new Error("Invalid response: agentData missing");
      }

      const updatedAgent = responseData.agentData;

      if (agent.type === "a2a_agent" || agent.type === "local_agent" || agent.type === "orchestrator") {
        setIsAgentSelected(true)
        setSelectedAgentUrl(agent.url);
        setSelectedAgentName(agent.name);
        setCurrentChatAgentUrl(agent.url);
        setAgentType(agent.type);
        setActiveView("chat");
        setActiveSidebarButton("chat");

        setSelectedAgentDescription(
          updatedAgent.type === "orchestrator"
            ? updatedAgent.instructions ?? ""
            : updatedAgent.description ?? ""
        );

        return updatedAgent;
      } else if (agent.type === "mcp") {
        // Do not change agentType to "mcp"
        setActiveView("addMcp");
        alert("MCP added successfully!");
        return updatedAgent;
      } else {
        alert(`Unsupported agent type: ${agent.type}`);
      }
    } catch (error) {
      console.error("Error in handleSelectAgent:", error);
      alert("Failed to select agent");
      return null;
    }
  };

  const handleSidebarButtonClick = (view: string) => {
    setActiveView(view);
    setActiveSidebarButton(view);
    if (view === "listA2AAgents" || view === "listLocalAgents") {
      fetchAgents()
    }
  };

  const handleAddAgent = async (agent: Agent) => {
    const enrichedAgent = await handleSelectAgent(agent);
    if (enrichedAgent){
      
      setAgents((prev) => [enrichedAgent, ...prev]);
      
    }
    else{
      alert("Agent with given name and url already exist.")
    }
  };

  const handleDeleteAgent = async (agentToDelete: Agent) => {
    await fetch("/api/copilotkit/delete-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(agentToDelete),
    });

    setAgents((prev) =>
      prev.filter(
        (agent) => agent.name + agent.url !== agentToDelete.name + agentToDelete.url
      )
    );
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    if (agent.type === "orchestrator") {
      handleSidebarButtonClick("editOrchestratorForm");
    } else if (agent.type === "local_agent") {
      handleSidebarButtonClick("editLocalAgentForm");
    }
  };

  const handleOnBack = (targetSidebar: string) => {
    if (isAgentSelected){

      handleSidebarButtonClick(targetSidebar);
    }
    else{
      handleSidebarButtonClick("defaultWindow")
    }
  };

  const handleOnUpdate = async (updatedAgent: Agent) => {
    try {
      const response = await fetch("/api/copilotkit/update-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAgent),
      });

      const result = await response.json();
      if (result.success) {
        const updated = result.agentData;
        setAgents((prev) =>
          prev.map((agent) =>
            agent.name + agent.url === updated.name + updated.url ? updated : agent
          )
        );

        handleOnBack(
          updated.type === "orchestrator" ? "listOrchestrators" : "listLocalAgents"
        );
      } else {
        console.error("Update failed:", result.error);
      }
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  };

  const handleShowAgentCard = async (agent: Agent) => {
    setActiveView("showAgentCard")
    setSelectedAgent(agent)
  }
  
  return (
    <div className={styles.layout}>
      <AgentRibbon
        agents={agents}
        selectedAgentUrl={selectedAgentUrl}
        selectedAgentName={selectedAgentName}
        onSelectAgent={handleSelectAgent}
        agentType={agentType}
        setAgentType={setAgentType}
      />
      <div className={styles.body}>
        <Sidebar
          onChat={() => handleSidebarButtonClick("chat")}
          onAddAgent={() => handleSidebarButtonClick("addAgent")}
          onCreateMultiAgent={() => handleSidebarButtonClick("createMultiAgent")}
          onListA2AAgents={() => handleSidebarButtonClick("listA2AAgents")}
          onListOrchestrators={() => handleSidebarButtonClick("listOrchestrators")}
          onCreateLocalAgent={() => handleSidebarButtonClick("createLocalAgent")}
          onListLocalAgent={() => handleSidebarButtonClick("listLocalAgents")}
          onAddMcp={() => handleSidebarButtonClick("addMcp")}
          onListMCPs={() => handleSidebarButtonClick("listMCPs")}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          activeButton={activeSidebarButton}
        />
        <div className={sidebarCollapsed ? styles.contentFull : styles.content}>
          {activeView === "defaultWindow" ? (
            <DefaultWindow />
          ) : activeView === "addAgent" ? (
            <AddAgentModal
              onAdd={handleAddAgent}
              existingAgentNames={agents.map((agent) => agent.name)}
              // onCancel={() => handleSidebarButtonClick("chat")}
              onCancel={() => handleOnBack("chat")}
            />
          ) : activeView === "createMultiAgent" ? (
            <CreateMultiAgentForm
              agents={agents}
              onCreate={handleAddAgent}
              // onCancel={() => handleSidebarButtonClick("chat")}
              onCancel={() => handleOnBack("chat")}
            />
          ) : activeView === "listA2AAgents" ? (
            <ListA2AAgents
              agents={agents}
              onDeleteAgent={handleDeleteAgent}
              onViewCard={handleShowAgentCard} 
            />
          ) : activeView === "showAgentCard" ? (
            <ShowAgentCard 
              agent={selectedAgent} 
              onBack={() => handleSidebarButtonClick("listA2AAgents")}
            />
          ) : activeView === "listOrchestrators" ? (
            <ListOrchestrators
              agents={agents}
              onDeleteOrchestrator={handleDeleteAgent}
              onEditOrchestrator={handleEditAgent}
            />
          ) : activeView === "editOrchestratorForm" && selectedAgent ? (
            <EditOrchestratorForm
              orchestrator={selectedAgent}
              agents={agents}
              onUpdate={handleOnUpdate}
              onBack={() => handleOnBack("listOrchestrators")}
            />
          ) : activeView === "createLocalAgent" ? (
            <CreateLocalAgentForm
              agents={agents}
              onCreate={handleAddAgent}
              // onCancel={() => handleSidebarButtonClick("chat")}
              onCancel={() => handleOnBack("chat")}
            />
          ) : activeView === "listLocalAgents" ? (
            <ListLocalAgents
              agents={agents}
              onDeleteLocalAgent={handleDeleteAgent}
              onEditLocalAgent={handleEditAgent}
            />
          ) : activeView === "editLocalAgentForm" && selectedAgent ? (
            <EditLocalAgentForm
              orchestrator={selectedAgent}
              agents={agents}
              onUpdate={handleOnUpdate}
              onBack={() => handleOnBack("listLocalAgents")}
            />
          ) : activeView === "addMcp" ? (
            <AddMcp
              onAdd={handleAddAgent}
              // onCancel={() => handleSidebarButtonClick("chat")}
              onCancel={() => handleOnBack("chat")}
            />
          ) : activeView === "listMCPs" ? (
            <ListMCP agents={agents} onDeleteAgent={handleDeleteAgent} />
          ): (
            <ChatWindow
              selectedAgentName={selectedAgentName}
              selectedAgentDescription={selectedAgentDescription}
            />
          )}
        </div>
      </div>
    </div>
  );
}