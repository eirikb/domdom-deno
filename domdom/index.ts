import { Domdom } from './domdom.ts';
import { Data } from '../data/index.ts';
export default (data: Data = new Data()): Domdom => new Domdom(data);
