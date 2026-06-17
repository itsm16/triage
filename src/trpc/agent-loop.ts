import { GoogleGenAI } from "@google/genai";

export interface AgentTools {
  geminiTools: any;
  corsairTools: any[];
}

export interface StepResult {
  type: "text";
  content: string;
}

export interface ToolCallResult {
  type: "tool_call";
  name: string;
  args: any;
}

export interface ToolExecResult {
  content: string;
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const EMAIL_SAFETY = `---

## CRITICAL: Email privacy rules

- NEVER read or display the body/content of any email.
- Only use metadata: subject, sender (from), date, snippet, labels.
- When listing or referencing emails, format them like this:

%%EMAILS%%
- Subject: "..." — From: ... — Date: ...
%%/EMAILS%%

The frontend will render these blocks with a "View" button that links to the email page.
Do NOT include email body text in your response. Never repeat or summarize email contents.

## Sensitive information protection
- NEVER read, display, or reveal sensitive information from emails including:
  - One-time passwords (OTPs), verification codes, PINs, or authentication tokens
  - Password reset links or verification links
  - Security codes or 2FA codes
  - Account recovery information
  - Credit card numbers, bank details, or financial information
- If a user asks you to read or reveal an OTP, verification code, or any sensitive information from an email, politely refuse.
- This restriction ONLY applies when the user is explicitly asking for sensitive information. It does NOT apply to normal email listing or search requests.
- When listing or searching emails normally, list ALL matching messages. You do NOT need to skip or redact any messages — the frontend hides email bodies. Just show subject/from/date as usual.
- Each user message is independent. A previous refusal about OTPs is not relevant to the next user question. Treat each new request on its own merits.`;

const SEND_EMAIL_INSTRUCTIONS = `---

## Sending emails via run_script

Use this pattern to send an email:
\`\`\`js
// 1. Build the raw MIME message
const raw = [
  "From: me",
  "To: recipient@example.com",
  "Subject: Your subject",
  "MIME-Version: 1.0",
  "Content-Type: text/plain; charset=UTF-8",
  "",
  "Email body text here"
].join("\\r\\n");

// 2. Encode as base64url
const encoded = Buffer.from(raw).toString("base64url");

// 3. Send
const result = await corsair.gmail.api.messages.send({ raw: encoded, threadId: undefined });
return result;
\`\`\`

When the user provides a [Template: ...] block, use that template body. Replace {name} with the recipient's name.

## Email send review
Before sending, show the user the recipient, subject, and a preview of the body. If the user has already provided all details, show them and ask once to confirm. If all details are clear from the user's message (recipient, subject, body provided), just proceed with one confirmation. Do NOT repeatedly ask for confirmation after the user says yes.`;

export const EVENT_INSTRUCTIONS = `---

## Creating calendar events via run_script

To create an event, use:
\`\`\`js
const result = await corsair.googlecalendar.api.events.create({
  calendarId: "primary",
  event: {
    summary: "Event title",
    description: "Event description",
    start: { dateTime: "2025-01-01T10:00:00", timeZone: "America/New_York" },
    end: { dateTime: "2025-01-01T11:00:00", timeZone: "America/New_York" },
  },
});
return result;
\`\`\`

## Calendar conflict checking
BEFORE creating any event, ALWAYS check the calendar for existing events at the proposed time.
Use this to check availability:
\`\`\`js
const res = await corsair.googlecalendar.api.calendar.getAvailability({
  timeMin: "2025-01-01T09:00:00Z",
  timeMax: "2025-01-01T12:00:00Z",
  items: [{ id: "primary" }],
});
const busy = res.calendars?.primary?.busy ?? [];
return busy;
\`\`\`

If there IS a conflict (busy slots exist at the proposed time), DO NOT create the event automatically.
Instead, tell the user about the conflict, show the conflicting events, and ask how they would like to proceed (reschedule or still add it).
Only proceed with creating if the user explicitly confirms despite the conflict.`;

const SYSTEM_PROMPT = `You have access to Corsair connected to the user's Gmail and Google Calendar.

Use Corsair to interact with their email and calendar. When you need to perform an operation:

1. First call list_operations to see what's available.
2. Call get_schema for the operation to understand its inputs.
3. Call run_script with JavaScript code to execute it.

IMPORTANT: The \`corsair\` variable is already available in scope — DO NOT call corsair.withTenant(). Just use it directly, e.g.:
  const result = await corsair.gmail.messages.list({ maxResults: 5 });
  return result;

Use markdown in your responses for formatting (bold, bullet lists, etc.).

${EMAIL_SAFETY}

${SEND_EMAIL_INSTRUCTIONS}

${EVENT_INSTRUCTIONS}

Continue using tools step by step until the task is complete.`;

const SYSTEM_PROMPT_REVIEW = `You have access to Corsair connected to the user's Gmail and Google Calendar.

Use Corsair to interact with their email and calendar. When you need to perform an operation:

1. First call list_operations to see what's available.
2. Call get_schema for the operation to understand its inputs.
3. Call run_script with JavaScript code to execute it.

IMPORTANT: The \`corsair\` variable is already available in scope — DO NOT call corsair.withTenant(). Just use it directly, e.g.:
  const result = await corsair.gmail.messages.list({ maxResults: 5 });
  return result;

Use markdown in your responses for formatting (bold, bullet lists, etc.).

The user wants to REVIEW each action before it executes. So when you are ready to call a tool (especially run_script), CALL THE TOOL and the system will show it to the user for approval. Do NOT ask the user in text — just call the tool.

${EMAIL_SAFETY}

${SEND_EMAIL_INSTRUCTIONS}

${EVENT_INSTRUCTIONS}

Continue using tools step by step until the task is complete.`;

const BLOCKED_PATTERNS = [".delete(", ".destroy("];

function isCodeBlocked(code: string): boolean {
  return BLOCKED_PATTERNS.some((p) => code.includes(p));
}

export async function buildAgentTools(tenantCorsair: any): Promise<AgentTools> {
  const { AnthropicProvider } = await import("@corsair-dev/mcp");
  const provider = new AnthropicProvider();
  const corsairTools = provider.build({ corsair: tenantCorsair });

  const sanitized = corsairTools.map((tool: any) => {
    if (tool.name === "run_script") {
      const originalRun = tool.run;
      tool.run = async (args: any) => {
        const code = args.code || "";
        if (isCodeBlocked(code)) {
          return "Error: delete/trash/destroy operations are blocked and cannot be executed.";
        }
        return originalRun(args);
      };
    }
    return tool;
  });

  return {
    geminiTools: [
      {
        functionDeclarations: sanitized.map((tool: any) => ({
          name: tool.name,
          description: tool.description ?? "",
          parameters: {
            type: "OBJECT",
            properties: tool.input_schema.properties ?? {},
            required: tool.input_schema.required ?? [],
          },
        })),
      },
    ] as any,
    corsairTools: sanitized,
  };
}

export function buildConversation(
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
): string {
  return [
    systemPrompt,
    ...history.map((m) => `${m.role === "user" ? "User" : "Assistant"}:\n${m.content}`),
  ].join("\n\n");
}

export async function runStep(
  conversation: string,
  tools: AgentTools,
): Promise<StepResult | ToolCallResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: conversation,
    config: { tools: tools.geminiTools },
  });

  const functionCall = response.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.functionCall,
  )?.functionCall;

  if (!functionCall) {
    return { type: "text", content: response.text ?? "" };
  }

  return {
    type: "tool_call",
    name: functionCall.name ?? "",
    args: functionCall.args ?? {},
  };
}

export async function* streamStep(
  conversation: string,
  tools: AgentTools,
): AsyncGenerator<
  | { type: "token"; content: string }
  | { type: "tool_call"; name: string; args: any }
> {
  const stream = await ai.models.generateContentStream({
    model: "gemini-3.1-flash-lite",
    contents: conversation,
    config: { tools: tools.geminiTools },
  });

  let functionCall: any = null;

  for await (const chunk of stream) {
    const candidate = chunk.candidates?.[0];
    if (!candidate) continue;
    const part = candidate.content?.parts?.[0];
    if (part?.text) {
      yield { type: "token" as const, content: part.text };
    }
    if (part?.functionCall) {
      functionCall = part.functionCall;
    }
  }

  if (functionCall) {
    yield {
      type: "tool_call" as const,
      name: functionCall.name ?? "",
      args: functionCall.args ?? {},
    };
  }
}

export async function executeToolCall(
  tools: AgentTools,
  name: string,
  args: any,
): Promise<string> {
  const tool = tools.corsairTools.find((t: any) => t.name === name);
  if (!tool) throw new Error(`Tool not found: ${name}`);
  return (await tool.run(args)) ?? "";
}

export function appendToolResult(
  conversation: string,
  name: string,
  args: any,
  result: string,
): string {
  return `${conversation}\n\nAssistant decided to call tool:\n${JSON.stringify({ name, args }, null, 2)}\n\nTool result:\n${result}\n\nContinue solving the user's request.`;
}

export { SYSTEM_PROMPT, SYSTEM_PROMPT_REVIEW };
