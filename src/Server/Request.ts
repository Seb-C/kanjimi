import { Request as OriginalRequest } from 'express';

export interface Request extends OriginalRequest {
	query: any;
}
