import { Domdom } from './domdom.ts';
import { GodMode } from './godmode.ts';
import { Data } from '../data/index.ts';

export * from './types.ts';
export const godMode = <T>(
  domdom: Domdom = new Domdom(new Data())
): GodMode<T> => new GodMode<T>(domdom);
export default (data: Data = new Data()): Domdom => new Domdom(data);
