import { Lookup, LooseObject, Paths } from './types.ts';

export default () => {
  const self = {} as Paths;
  const map: LooseObject = {};
  const refs: LooseObject = {};

  self.add = (path, ref, input) => {
    refs[ref] = path;
    const parts = path.split('.');
    let parent = map;
    for (let part of parts) {
      if (part === '*' || part.startsWith('$')) {
        parent = parent['$'] = parent['$'] || {};
      } else if (part === '**') {
        parent = parent['$$'] = parent['$$'] || {};
        break;
      } else {
        parent = parent['_'] = parent['_'] || {};
      }
      parent = parent[part] = parent[part] || {};
    }
    parent['h'] = parent['h'] || {};
    parent['h'][ref] = input;
  };

  function lookup(
    result: Lookup[],
    parent: LooseObject,
    parts: string[],
    index = 0,
    keys: string[] = [],
    until = -1
  ) {
    for (; index < parts.length; index++) {
      if (!parent) {
        return;
      }
      const part = parts[index];
      if (parent.$) {
        for (let key of Object.keys(parent.$)) {
          const newKeys: string[] = keys.slice();
          let newUntil = until;
          if (key !== '*' && key !== '**') {
            newUntil = index;
            newKeys[index] = key;
          }
          lookup(result, parent.$[key], parts, index + 1, newKeys, newUntil);
        }
      }
      if (parent.$$) {
        if (parent.$$.h) {
          break;
        }
      }
      if (parent._) {
        until = index;
        parent = parent._[part];
      } else {
        return;
      }
    }

    if (parent && !parent.h && parent.$$) {
      parent = parent.$$;
    }

    if (parent && parent.h) {
      const keysMap = keys.reduce((res, val, index) => {
        if (val) res[val] = parts[index];
        return res;
      }, {} as LooseObject);

      const res = {
        keys: keysMap,
        _: parent.h,
        path: (until >= 0 ? parts.slice(0, until + 1) : parts).join('.'),
        ...(until >= 0 ? { fullPath: parts.join('.') } : {}),
      };
      result.push(res);
    }
  }

  self.lookup = path => {
    const parts = path.split('.');
    const result: Lookup[] = [];
    lookup(result, map, parts);
    return result;
  };

  self.remove = ref => {
    const path = refs[ref];
    if (!path) return;

    const parts = path.split('.');
    let parent = map;
    for (let part of parts) {
      if (part.startsWith('$') || part === '*') {
        parent = parent['$'][part];
      } else if (part === '**') {
        parent = parent['$$'];
        break;
      } else {
        parent = parent['_'][part];
      }
    }
    if (parent && parent['h']) {
      delete parent['h'][ref];
      if (Object.keys(parent['h']).length === 0) {
        delete parent['h'];
      }
    }
  };

  return self;
};

export const clean = (path: string) => {
  const res: string[] = [];
  path.split('.').every(part => {
    const check = part !== '*' && part !== '**' && !part.startsWith('$');
    if (check) res.push(part);
    return check;
  });
  return res.join('.');
};