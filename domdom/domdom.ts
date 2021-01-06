import { Data, ListenerCallbackWithType, Pathifier } from '../data/index.ts';
import { DomStower, StowerTransformer } from './dom-stower.ts';
import { DomSquint } from './dom-squint.ts';
import ddProps from './dd-props.ts';
import { Domode, Opts, React } from './types.ts';
import { DomPathifier } from './pathifier.ts';

export class ReactImpl implements React {
  private readonly data: Data;

  constructor(data: Data) {
    this.data = data;
  }

  createElement(
    input: string | Function,
    props?: { [key: string]: any },
    ...children: any[]
  ): Domode | Pathifier {
    children = [].concat(...children);

    if (typeof input === 'function') {
      const cbs: (() => void)[] = [];
      const options: Opts = {
        children,
        mounted(cb) {
          cbs.push(cb);
        },
      };
      const res = input({ ...props }, options) as Domode | DomPathifier;
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
      if (child instanceof DomPathifier) {
        el.mountables.push(child);
        child.transformer = new StowerTransformer(stower, index);
      } else {
        stower.add(child, index);
      }
    }

    ddProps(this.data, el.mountables, el, props);

    el.attach = (pathifier: DomPathifier) => {
      el.mountables.push(pathifier);
      pathifier.init();
    };

    return el;
  }
}

export class Domdom {
  private readonly _data: Data;
  React: React;

  constructor(data: Data) {
    this._data = data;
    this.React = new ReactImpl(this._data);
  }

  on = (path: string): Pathifier => {
    return new DomPathifier(this._data, path);
  };

  set = (path: string, value: any, byKey?: string) => {
    this._data.set(path, value, byKey);
  };

  unset = (path: string) => {
    this._data.unset(path);
  };

  off = (refs: string) => this._data.off(refs);

  get = <T = any>(path?: string): T | undefined => {
    if (!path) return this._data.get();
    return this._data.get(path);
  };

  trigger = (path: string, value?: any) => {
    return this._data.trigger(path, value);
  };

  windowOn = <T = any>(
    flagsAndPath: string,
    listener: ListenerCallbackWithType<T>
  ): string => this._data.on(flagsAndPath, listener);

  init = (parent: HTMLElement, child?: HTMLElement) => {
    const domSquint = new DomSquint(parent);
    domSquint.init();
    if (child) {
      parent.appendChild(child);
    }
  };
}
