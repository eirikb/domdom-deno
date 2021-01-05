import { Domdom } from './domdom.ts';
import { GodMode } from './godmode.ts';
import { Data } from '../data/index.ts';

export * from './types.ts';
export const godMode = <T>(data: Data = new Data()): GodMode<T> =>
  new GodMode<T>(data);
export default (data: Data = new Data()): Domdom => new Domdom(data);
