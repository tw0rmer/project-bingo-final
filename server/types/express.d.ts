// Type declarations for Express.js extensions
declare namespace Express {
  interface Request {
    user?: {
      id: number;
      email: string;
      balance?: number;
      isAdmin?: boolean;
    };
  }
}