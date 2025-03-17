import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertDocumentSchema, insertMessageSchema } from "@shared/schema";
import WebSocket from "ws";

interface WSClient extends WebSocket {
  userId?: number;
  documentId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const user = await storage.createUser(data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Document routes
  app.post("/api/documents", async (req, res) => {
    try {
      const data = insertDocumentSchema.parse(req.body);
      const doc = await storage.createDocument(data);
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

  // Message routes
  app.get("/api/documents/:id/messages", async (req, res) => {
    const messages = await storage.getMessages(parseInt(req.params.id));
    res.json(messages);
  });

  // WebSocket handling
  wss.on("connection", (ws: WSClient) => {
    console.log('New WebSocket connection established');

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received WebSocket message:', message);

        switch (message.type) {
          case "join":
            ws.userId = message.userId;
            ws.documentId = message.documentId;
            console.log(`User ${message.userId} joined document ${message.documentId}`);
            break;

          case "code":
            await storage.updateDocument(message.documentId, message.content);
            console.log(`Document ${message.documentId} updated by user ${ws.userId}`);
            break;

          case "chat":
          case "drawing":
            const msg = await storage.createMessage({
              documentId: ws.documentId!,
              userId: ws.userId!,
              content: message.content,
              type: message.type,
              data: message.data
            });
            console.log(`New ${message.type} message from user ${ws.userId} in document ${ws.documentId}`);
            break;
        }

        // Broadcast to all clients in same document
        wss.clients.forEach((client: WSClient) => {
          if (client.documentId === ws.documentId && 
              client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: "error", error: "Invalid message" }));
      }
    });

    ws.on("close", () => {
      console.log(`WebSocket connection closed for user ${ws.userId}`);
    });

    ws.on("error", (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}