"use client";
import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { myTheme } from "./AgGridTheme";
import styles from "./AgGridTable.module.css";
import { ColDef } from "ag-grid-community";
import { Agent } from "./MainLayout";
import { DescriptionCellRenderer } from "./DescriptionCellRenderer";

interface AgGridTableProps {
  agents: Agent[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AgGridTable({
  agents,
  selected,
  setSelected,
}: AgGridTableProps) {

  let columns: ColDef<Agent>[] = [];

  if (agents.length > 0 && agents[0].type === "a2a_agent") {
    columns = useMemo(
      () => [
        {
          headerName: "",
          // field: "checkbox",
          width: 50,
          cellRenderer: (params: any) => {
            const key = params.data.name + params.data.url;
            return (
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={() => {
                  setSelected((prev) =>
                    prev.includes(key)
                      ? prev.filter((k) => k !== key)
                      : [...prev, key]
                  );
                }}
                aria-label={`Select agent ${params.data.name}`}
              />
            );
          },
          pinned: "left",
          cellStyle: { display: "flex", justifyContent: "center" },
        },
        {
          headerName: "Agent Name",
          field: "name",
          flex: 0.3,
          wrapText: true,
          autoHeight: true,
          resizable: true,
        },
        {
          headerName: "Description",
          field: "description",
          flex: 1,
          // wrapText: true,
          autoHeight: true,
          resizable: true,
          cellRenderer: DescriptionCellRenderer,
        },
        {
          headerName: "Agent Framework",
          field: "framework",
          flex: 0.5,
          pinned: "right",
        },
      ],
      [selected, setSelected]
    );
  } else if (agents.length > 0 && agents[0].type === "mcp") {
    columns = useMemo(
      () => [
        {
          headerName: "",
          // field: "checkbox",
          width: 50,
          cellRenderer: (params: any) => {
            const key = params.data.name + params.data.url;
            return (
              <input
                type="checkbox"
                checked={selected.includes(key)}
                onChange={() => {
                  setSelected((prev) =>
                    prev.includes(key)
                      ? prev.filter((k) => k !== key)
                      : [...prev, key]
                  );
                }}
                aria-label={`Select agent ${params.data.name}`}
              />
            );
          },
          pinned: "left",
          cellStyle: { display: "flex", justifyContent: "center" },
        },
        {
          headerName: "MCP Name",
          field: "name",
          flex: 0.3,
          wrapText: true,
          autoHeight: true,
          resizable: true,
        },
        {
          headerName: "MCP URL",
          field: "url",
          flex: 1,
          // wrapText: true,
          autoHeight: true,
          resizable: true,
        },
        // {
        //   headerName: "MCP Framework",
        //   field: "framework",
        //   flex: 0.5,
        //   pinned: "right",
        // },
      ],
      [selected, setSelected]
    );
  }
  return (
    <div className={styles.tableDiv}>
      <AgGridReact
        theme={myTheme}
        rowData={agents}
        columnDefs={columns}
        domLayout="autoHeight"
        suppressMovableColumns={true}
      />
    </div>
  );
}