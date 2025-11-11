export const LLM_TYPES = [
  "Azure OpenAI",
  "OpenAI",
  "Gemini",
  "Anthropic"
] as const;

export type LLMType = typeof LLM_TYPES[number];

export const DEFAULT_LLM_CONFIGS: Record<LLMType, string> = {
  "Azure OpenAI": `API_KEY=<your_azure_openai_api_key>
MODEL_NAME=<model_name>
ENDPOINT=<your_azure_openai_endpoint>
API_VERSION=<api_version>
DEPLOYMENT_NAME=<deployment_name>`,
  
  "OpenAI": `API_KEY=<your-openai-api-key>
MODEL_NAME=<your-openai-model-name>`,
  
  "Gemini": `API_KEY=<your-google-api-key>
MODEL_NAME=<your-google-model-name>`,
  
  "Anthropic": `API_KEY=<your-anthropic-api-key>
MODEL_NAME=<your-anthropic-model-name>`
};