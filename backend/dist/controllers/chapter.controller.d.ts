import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getChapters: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getChapter: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const buyChapter: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=chapter.controller.d.ts.map