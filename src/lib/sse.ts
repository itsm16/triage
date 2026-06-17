type SSEController = {
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
};

const clients = new Map<string, Set<SSEController>>();

export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  clients.get(userId)!.add({ controller, encoder: new TextEncoder() });
}

export function removeClient(userId: string, controller: ReadableStreamDefaultController) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  for (const c of userClients) {
    if (c.controller === controller) {
      userClients.delete(c);
      break;
    }
  }
  if (userClients.size === 0) clients.delete(userId);
}

export function pushEvent(userId: string, event: string, data: unknown) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of userClients) {
    try {
      client.controller.enqueue(client.encoder.encode(message));
    } catch {
      userClients.delete(client);
    }
  }
}
