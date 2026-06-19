import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getMangas: (req: Request, res: Response) => Promise<void>;
export declare const getFeatured: (req: Request, res: Response) => Promise<void>;
export declare const getTrending: (req: Request, res: Response) => Promise<void>;
export declare const getManga: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createManga: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSimilar: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const toggleLike: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTopTranslators: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=manga.controller.d.ts.map