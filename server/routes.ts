import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertDocumentSchema, insertMessageSchema } from "@shared/schema";
import WebSocket from "ws";
import { log } from "./vite";

interface WSClient extends WebSocket {
  userId?: number;
  documentId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket server with path option
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    perMessageDeflate: false
  });

  log('WebSocket server initialized on path: /ws', 'websocket');

  // WebSocket connection handling
  wss.on("connection", (ws: WSClient) => {
    log('New WebSocket connection established', 'websocket');

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        log(`Received WebSocket message: ${JSON.stringify(message)}`, 'websocket');

        switch (message.type) {
          case "join":
            ws.userId = message.userId;
            ws.documentId = message.documentId;
            log(`User ${message.userId} joined document ${message.documentId}`, 'websocket');

            // Send confirmation back to client
            ws.send(JSON.stringify({
              type: "joined",
              userId: message.userId,
              documentId: message.documentId
            }));
            break;

          case "code":
            if (!ws.documentId || !ws.userId) {
              throw new Error("Client not properly initialized");
            }
            await storage.updateDocument(message.documentId, message.content);
            log(`Document ${message.documentId} updated by user ${ws.userId}`, 'websocket');

            // Broadcast code changes to all clients in the same document
            wss.clients.forEach((client: WSClient) => {
              if (client !== ws && 
                  client.documentId === message.documentId && 
                  client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: "code",
                  content: message.content
                }));
              }
            });
            break;

          case "chat":
          case "drawing":
            if (!ws.documentId || !ws.userId) {
              throw new Error("Client not properly initialized");
            }
            const msg = await storage.createMessage({
              documentId: message.documentId,
              userId: ws.userId,
              content: message.content || '',
              type: message.type,
              data: message.data
            });

            // Broadcast the stored message with its ID
            const broadcastMessage = {
              ...message,
              id: msg.id,
              userId: ws.userId
            };

            wss.clients.forEach((client: WSClient) => {
              if (client.documentId === message.documentId && 
                  client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(broadcastMessage));
              }
            });

            log(`New ${message.type} message from user ${ws.userId} in document ${message.documentId}`, 'websocket');
            break;

          default:
            log(`Unknown message type: ${message.type}`, 'websocket');
            throw new Error(`Unknown message type: ${message.type}`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log(`WebSocket message error: ${errorMessage}`, 'error');
        ws.send(JSON.stringify({ 
          type: "error", 
          error: errorMessage 
        }));
      }
    });

    ws.on("close", () => {
      log(`WebSocket connection closed for user ${ws.userId}`, 'websocket');
    });

    ws.on("error", (error) => {
      log(`WebSocket error: ${error.message}`, 'error');
    });
  });

  // Add other HTTP routes
  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const doc = await storage.createDocument({
        ...data,
        content: data.content || "// Start coding here"
      });
      res.json(doc);
    } catch (error) {
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    const doc = await storage.getDocument(parseInt(req.params.id));
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json(doc);
  });

  app.get("/api/documents/:id/messages", async (req, res) => {
    const messages = await storage.getMessages(parseInt(req.params.id));
    res.json(messages);
  });

  return httpServer;
}