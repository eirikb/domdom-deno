# ! Attention: This whole repo is automatically generated !

Building, linting and unit tests can be found in original repo:  
https://github.com/eirikb/domdom

This repo exists only for pure [**Deno**](https://deno.land) support.  
It makes domdom available _without_ use of pika.dev or jspm!

![image](https://user-images.githubusercontent.com/241706/83797582-2f336980-a6a3-11ea-9233-85468c33aac3.png)


## Usage with Deno

**index.tsx**

```tsx
import domdom from 'https://deno.land/x/domdom';

const { React, data, append } = domdom();

append(document.body, ({ on }) => <div>Hello {on('test')}</div>);

data.set('test', 'World!');
```

**tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "esnext"],
    "noImplicitAny": false
  }
}
```

Original readme below here
---

