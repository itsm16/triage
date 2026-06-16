import { GoogleGenAI } from "@google/genai";
import { AnthropicProvider } from "@corsair-dev/mcp";
import { corsair } from "~/server/corsair";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const provider = new AnthropicProvider();
// console.log()
// console.log("corsair", corsair)
const corsairTools = provider.build({ corsair });
const tools = [
  {
    functionDeclarations: corsairTools.map((tool) => ({
      name: tool.name,
      description: tool.description ?? "",
      parameters: {
        type: "OBJECT",
        properties: tool.input_schema.properties ?? {},
        required: tool.input_schema.required ?? [],
      } as any,
    })),
  },
] as any;

tools[0].functionDeclarations?.map((ele: any) => console.log(ele))

// async function main() {
//   const userPrompt = "Use Corsair to star the repo draw-app";

//   let conversation = `
// You have access to Corsair.

// Use tools when needed.
// Continue using tools until the task is complete.

// User:
// ${userPrompt}
// `;

//   for (let step = 0; step < 20; step++) {
//     const response = await ai.models.generateContent({
//       model: "gemini-3.5-flash",
//       contents: conversation,
//       config: {
//         tools,
//       },
//     });

//     const functionCall =
//       response.candidates?.[0]?.content?.parts?.find(
//         (p: any) => p.functionCall
//       )?.functionCall;

//     if (!functionCall) {
//       console.log("\nFinal answer:\n");
//       console.log(response.text);
//       return;
//     }

//     console.log(
//       `\nRunning tool: ${functionCall.name}`
//     );

//     const tool = corsairTools.find(
//       (t) => t.name === functionCall.name
//     );

//     if (!tool) {
//       throw new Error(
//         `Tool not found: ${functionCall.name}`
//       );
//     }

//     const result = await tool.run(
//       functionCall.args ?? {}
//     );

//     console.log("\nTool result:\n");
//     console.dir(result, { depth: null });

//     conversation += `

// Assistant decided to call tool:

// ${JSON.stringify(functionCall, null, 2)}

// Tool result:

// ${JSON.stringify(result, null, 2)}

// Continue solving the user's request.
// `;
//   }

//   throw new Error(
//     "Exceeded maximum tool iterations."
//   );
// }

// main().catch(console.error);