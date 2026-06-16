import { type NextRequest } from "next/server";
import { auth } from "~/server/better-auth";
import { corsair } from "~/server/corsair";
import {
  buildAgentTools,
  buildConversation,
  streamStep,
  executeToolCall,
  appendToolResult,
  SYSTEM_PROMPT,
  SYSTEM_PROMPT_REVIEW,
} from "~/server/agent-loop";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const {
    message,
    conversation: existingConversation,
    reviewMode = false,
    approvedTool,
  } = body;

  const tenantCorsair = corsair.withTenant(session.user.id);
  const tools = await buildAgentTools(tenantCorsair);

  let conversation: string;
  if (approvedTool) {
    const result = await executeToolCall(tools, approvedTool.name, approvedTool.args);
    conversation = appendToolResult(
      existingConversation,
      approvedTool.name,
      approvedTool.args,
      result,
    );
  } else if (existingConversation) {
    conversation = existingConversation;
  } else {
    conversation = buildConversation(
      reviewMode ? SYSTEM_PROMPT_REVIEW : SYSTEM_PROMPT,
      [{ role: "user", content: message }],
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        for (let step = 0; step < 15; step++) {
          let fullText = "";
          let toolCall: { name: string; args: any } | null = null;

          for await (const event of streamStep(conversation, tools)) {
            if (event.type === "token") {
              fullText += event.content;
              send({ type: "token", content: event.content });
            } else if (event.type === "tool_call") {
              toolCall = { name: event.name, args: event.args };
            }
          }

          if (!toolCall) {
            send({ type: "done", content: fullText, conversation });
            controller.close();
            return;
          }

          send({
            type: "tool_call",
            name: toolCall.name,
            args: toolCall.args,
            conversation,
          });

          if (reviewMode) {
            controller.close();
            return;
          }

          const result = await executeToolCall(tools, toolCall.name, toolCall.args);
          send({ type: "tool_result", name: toolCall.name, result });

          conversation = appendToolResult(
            conversation,
            toolCall.name,
            toolCall.args,
            result,
          );
        }

        send({ type: "done", content: "Reached maximum iterations.", conversation });
        controller.close();
      } catch (err) {
        send({ type: "error", message: err instanceof Error ? err.message : "Unknown error" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
