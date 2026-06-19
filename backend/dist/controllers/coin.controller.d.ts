import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const requestPurchase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const approvePurchase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectPurchase: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getTransactions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPendingTransactions: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=coin.controller.d.ts.map