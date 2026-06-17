import { AnthropicProvider } from "@corsair-dev/mcp";
import { corsair } from "~/server/corsair";

const provider = new AnthropicProvider();
const corsairTools = provider.build({ corsair });
const tools = [
  {
    functionDeclarations: (corsairTools as { name: string; description?: string; input_schema: { properties?: Record<string, unknown>; required?: string[] } }[]).map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      parameters: {
        type: "OBJECT",
        properties: tool.input_schema.properties ?? {},
        required: tool.input_schema.required ?? [],
      },
    })),
  },
];

tools[0]?.functionDeclarations?.map((ele) => console.log(ele))
