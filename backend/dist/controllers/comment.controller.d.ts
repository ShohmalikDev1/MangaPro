import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getComments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const likeComment: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=comment.controller.d.ts.map