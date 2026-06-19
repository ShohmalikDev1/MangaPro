import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getBookmarks: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBookmark: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getReadHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getNotifications: (req: AuthRequest, res: Response) => Promise<void>;
export declare const markNotificationsRead: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getTopReaders: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map