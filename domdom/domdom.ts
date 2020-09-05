import { Data } from '../data/index.ts';
import { DomStower } from './dom-stower.ts';
import { DomSquint } from './dom-squint.ts';
import ddProps from './dd-props.ts';
import { Hodor } from './hodor.ts';
import { Domode, HodorCallback, Opts } from './types.ts';

export type DomdomListenerCallback<T> = (
  value: T,
  props: {
    subPath: string;
    fullPath: string;
    path: string;
    p: (path: string) => string;
    [key: string]: any;
  }
) => any;

export class React {
  private data: Data;

  constructor(data: Data) {
    this.data = data;
  }

  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode {
    children = [].concat(...children);

    if (typeof input === 'function') {
      const cbs: (() => void)[] = [];
      const options: Opts = {
        children,
        mounted(cb) {
          cbs.push(cb);
        },
      };
      const res = input({ ...props }, options) as Domode;
      res.mountables.push({
        mounted() {
          for (const cb of cbs) {
            cb();
          }
        },
        unmounted() {},
      });
      return res;
    }

    const el = document.createElement(input) as Domode;
    el.mountables = [];

    el.mounted = () => {
      for (const mountable of el.mountables) {
        if (mountable instanceof Hodor && !mountable.element) {
          mountable.element = el;
        }
        mountable.mounted();
      }
    };
    el.unmounted = () => {
      for (let mountable of el.mountables) {
        mountable.unmounted();
      }
    };

    const stower = new DomStower(el);

    for (let index = 0; index < children.length; index++) {
      const child = children[index];
      if (child instanceof Hodor) {
        const hodor = child as Hodor;
        el.mountables.push(hodor);
        hodor.stower(index, stower);
        hodor.element = el;
      } else {
        stower.add(child, index);
      }
    }

    ddProps(this.data, el.mountables, el, props);

    return el;
  }
}

export class Domdom {
  private data: Data;
  React: React;

  constructor(data: Data) {
    this.data = data;
    this.React = new React(this.data);
  }

  on = <T = any>(path: string, cb?: HodorCallback<T>) => {
    if (path.startsWith('>')) {
      throw new Error('Sub path selector no longer supported');
    }
    return new Hodor<T>(this.data, path, cb);
  };

  set = (path: string, value: any, byKey?: string) => {
    this.data.set(path, value, byKey);
  };

  unset = (path: string) => {
    this.data.unset(path);
  };

  get = <T = any>(path?: string): T => {
    if (!path) return this.data.get();
    return this.data.get(path);
  };

  trigger = (path: string, value?: any) => {
    return this.data.trigger(path, value);
  };

  init = (parent: HTMLElement, child?: HTMLElement) => {
    const domSquint = new DomSquint(parent);
    domSquint.init();
    if (child) {
      parent.appendChild(child);
    }
  };
}
