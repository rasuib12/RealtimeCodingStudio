import { users, documents, messages, type User, type InsertUser, type Document, type Message } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: Omit<Document, "id">): Promise<Document>;
  updateDocument(id: number, content: string): Promise<Document>;
  
  // Message operations
  getMessages(documentId: number): Promise<Message[]>;
  createMessage(msg: Omit<Message, "id">): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private messages: Map<number, Message>;
  private currentIds: { user: number; doc: number; msg: number };

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.messages = new Map();
    this.currentIds = { user: 1, doc: 1, msg: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(doc: Omit<Document, "id">): Promise<Document> {
    const id = this.currentIds.doc++;
    const document: Document = { ...doc, id };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, content: string): Promise<Document> {
    const doc = await this.getDocument(id);
    if (!doc) throw new Error("Document not found");
    
    const updated = { ...doc, content };
    this.documents.set(id, updated);
    return updated;
  }

  async getMessages(documentId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (msg) => msg.documentId === documentId
    );
  }

  async createMessage(msg: Omit<Message, "id">): Promise<Message> {
    const id = this.currentIds.msg++;
    const message: Message = { ...msg, id };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
