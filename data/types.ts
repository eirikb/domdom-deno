import { Listeners } from './listeners.ts';

export interface LooseObject {
  [key: string]: any;
}

export interface ToCall {
  listeners: Listeners;
  path: string;
  value: any;
}

export type Sorter = (a: any, b: any, aPath: string, bPath: string) => number;

export type Filter = (value: any) => boolean;

export type SorterOn = (
  sortValue: any,
  a: any,
  b: any,
  aPath: string,
  bPath: string
) => number;
export type FilterOn = (filterValue: any, value: any) => boolean;

export interface Stower {
  add(value: any, index: number, subIndex?: number, path?: string): void;

  remove(value: any, index: number, subIndex?: number, path?: string): void;

  or(index: number, or: any): void;
}
