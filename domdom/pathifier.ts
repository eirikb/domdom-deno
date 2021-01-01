import { Pathifier } from '../data/index.ts';
import { Domode, Mountable } from 'types.ts';

export class DomPathifier extends Pathifier implements Mountable {
  mountables: Mountable[] = [];

  mounted() {
    this.init();
    this.mountables.forEach(m => m.mounted());
  }

  unmounted() {
    this.off();
    this.mountables.forEach(m => m.unmounted());
  }

  attach(node: Domode) {
    node.mountables.push(this);
    this.init();
  }
}