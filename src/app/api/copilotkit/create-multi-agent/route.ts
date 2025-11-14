import { NextRequest, NextResponse } from "next/server";

const data = await req.json();
console.log("Received multi-agent creation:", data);

// Check for unique orchestrator name
const response = await fetch("http://localhost:8000/check-orchestrator-name", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: data.orchestratorName }),
});
const responseJson = await response.json();

if (!responseJson.isUnique) {
  return NextResponse.json({
    success: false,
    error: "Orchestrator with the given name already exists. Please use a different name.",
  });
}

// Proceed with multi-agent creation if name is unique
const res = await fetch("http://localhost:8000/create-multi-agent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});

const res_data = await res.json();
return NextResponse.json({ success: true, received: res_data.agentUrls });