// Minimal ambient declarations to satisfy TypeScript until dependencies are installed
declare module 'cors' {
  import { RequestHandler } from 'express';
  const cors: (options?: any) => RequestHandler;
  export = cors;
}
