import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getRatings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createRating: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rating.controller.d.ts.map