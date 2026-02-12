import { z } from 'zod';

export enum ReviewType {
  MANAGER = 'MANAGER',
  PEER = 'PEER',
  SELF = 'SELF',
}

export const reviewTypeSchema = z.enum(['MANAGER', 'PEER', 'SELF']);
