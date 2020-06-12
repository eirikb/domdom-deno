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

<p align="center">

![out4](https://user-images.githubusercontent.com/241706/83919341-b0a9fb00-a77a-11ea-9965-beea17502fdd.gif)

<h1 align="center">Domdom</h1>
<p align="center">The proactive web framework for the unprofessional</p>
<p align="center">

[![npm](https://img.shields.io/npm/v/@eirikb/domdom.svg)](https://npmjs.org/package/@eirikb/domdom)
[![Build](https://github.com/eirikb/domdom/workflows/Build/badge.svg)](https://github.com/eirikb/domdom/actions?query=workflow%3ABuild)
[![bundlephobia](https://badgen.net/bundlephobia/minzip/@eirikb/domdom)](https://bundlephobia.com/result?p=@eirikb/domdom)

</p>

<p align="center">

**Facts** - not highlights, just facts:

- Alternative to React + Redux or Vue + Vuex, with support for routing
- No virtual dom
- Support for Deno (without jspm or pika)
- Support for TypeScript
- Nothing reactive - totally unreactive - fundamentally different from React
- One global observable state
  - Support for re-usable components (with partition of global state)
  - No local state
- JSX return pure elements
- Doesn't support arrays

  - It's not as bad as you might think - Not great, not terrible

</p>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Deno](#deno)
- [Getting started](#getting-started)
- [APIsh](#apish)
  - [Initialize domdom](#initialize-domdom)
  - [Elements](#elements)
  - ["Components"](#components)
    - [Children / Composition](#children--composition)
  - [Events](#events)
  - [on(path, callback)](#onpath-callback)
    - [Sub-paths](#sub-paths)
  - [when(path, oddEvenArrayOfCheckAndResult)](#whenpath-oddevenarrayofcheckandresult)
  - [or](#or)
  - [dd-model](#dd-model)
  - [Attributes](#attributes)
  - [Arrays / lists](#arrays--lists)
    - [Arrays in JSX](#arrays-in-jsx)
    - [Pathifier](#pathifier)
- [Recipes](#recipes)
  - [Routing](#routing)
  - [Login form](#login-form)
  - [Split view and data](#split-view-and-data)
  - [Animation (garbage collection)](#animation-garbage-collection)
- [TypeScript](#typescript)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Deno

Domdom has full support for Deno!  
See https://github.com/eirikb/domdom-deno and https://deno.land/x/domdom .

## Getting started

```bash
npm i @eirikb/domdom
```

index.html:

```html
<body>
  <script src="app.jsx"></script>
</body>
```

app.jsx:

```jsx
import domdom from '@eirikb/domdom';

const view = ({ on }) => <div>Hello, {on('name')}</div>;

const dd = domdom(document.body, view);

dd.set('name', 'world!');
```

Run:

```bash
npx parcel index.html
```

## APIsh

### Initialize domdom

```jsx
import domdom from '@eirikb/domdom';
const dd = domdom(parentElement, view);
```

This will put `React` (required for JSX, not my naming) on `global`/`window`.  
If you're not a madlad you can alternatively create a local `React`:

```jsx
import domdom from '@eirikb/domdom';
const { React, data, append } = domdom();
append(document.body, view);
```

Note, here `React` isn't global and must be defined before each JSX.  
It must be passed from where it's created, or `exported`.
Each `React` returned from `domdom` is unique, which is why it's returned from `domdom()`.

### Elements

All elements created with jsx, in the context of domdom, are elements which can be instantly referenced.

```jsx
const element = <div>Behold!</div>;
element.style.color = 'red';
```

### "Components"

By creating a function you create a component.

```jsx
function MyComponent({ on }) {
  return (
    <ul>
      {on('players.$id.name', name => (
        <li>Player {name}</li>
      ))}
    </ul>
  );
}
```

#### Children / Composition

Content of a component will be passed as `children`.

```jsx
function Button({ children }) {
  return <button>{children}</button>;
}

const view = () => (
  <div>
    <Button>
      <b>Hello</b>
    </Button>
  </div>
);
```

### Events

All attributes starting with 'on' are added to `addEventListener` on the element.

```jsx
function MyButton({ trigger }) {
  return <button onClick={() => trigger('Clicked!')}>Click me!</button>;
}
```

### on(path, callback)

`callback` is optional, if omitted the result will be returned as-is,  
either as string or JSON of object.

```jsx
const view = ({ on }) => (
  <ul>
    {on('players.$id.name', name => (
      <li>Player {name}</li>
    ))}
    {on('info')}
  </ul>
);
```

This will match on `players.1.name` and `players.2.name` etc.

`path` can contain wildcards, either names with `$` or any with `*`.
Named wildcards can be resolved in the callback:

```jsx
on('players.$id', (player, { $id }) => console.log(`Id is ${$id}`));
```

You can have multiple wildcards: `players.$id.items.$itemId.size`.

#### Sub-paths

By using `>.` it's possible to listen to relative paths "from parent".  
This is how it's possible to make re-usable "detached" components.  
They have data in global state, but don't rely on the parent path.

```jsx
const view = ({ on }) => (
  <div>
    {on('players.$id', player => (
      <div>
        Player name: (won't update on change): {player.name} <br />
        {on('>.name', name => (
          <span>Player name: {name}</span>
        ))}
      </div>
    ))}
  </div>
);
```

### when(path, oddEvenArrayOfCheckAndResult)

Heard of pattern matching? This isn't it.  
Odd/Even of conditional and view. View must be a function.

```jsx
const view = ({ when }) => (
  <div>
    {when('route', [
      'home',
      () => <div>Home!</div>,
      'away',
      () => <div>Away!</div>,
      route => (route || '').startsWith('eh'),
      () => <div>Eh?</div>,
      false,
      () => <div>Route is literally boolean false</div>,
    ])}
  </div>
);
```

### or

Neither `on` or `when` will trigger unless there is a value on the path, in order to show something at all
until some value is set `or` must be used.

```jsx
const view = ({ when }) => (
  <div>
    {when('routing', ['home', () => <div>Home!</div>]).or(
      <div>Loading app in the fastest possible way...</div>
    )}
  </div>
);
```

### dd-model

This is a convenience hack for putting data into and out of a data path from an input.  
Similar to v-model and ng-model.  
Suggest not using this if possible, using forms directly like in recipes is much better.

```jsx
dd.on('= search', event => {
  event.preventDefault();
  dd.set('result', `Data for ${dd.get('text')} here...`);
});

const view = ({ when, on, trigger }) => (
  <form onSubmit={e => trigger('search', e)}>
    <input type="search" dd-model="text" />
    <input type="checkbox" dd-model="more" />
    {when('more', [true, () => 'This is more'])}
    Current text: {on('text')}
    <button type="submit">Search</button>
    {on('result', _ => _)}
  </form>
);
```

### Attributes

It's possible to use `on` directly on attributes.  
It might feel and look a bit quirky, but there it is.

```jsx
const view = ({ on, set, get }) => (
  <div>
    <button onClick={() => set('toggle', !get('toggle'))}>Toggle</button>
    <button disabled={on('toggle').or(true)}>A</button>
    <button disabled={on('toggle', res => !res)}>B</button>
  </div>
);
```

### Arrays / lists

domdom doesn't support arrays.  
Meaning it's not possible to put arrays into state, if you try they will be converted into properties based on index.  
E.g.,

```js
dd.set('users', ['Mr. A', 'Mr. B']);

// Becomes
const result = {
  users: {
    0: 'Mr. A',
    1: 'Mr. B',
  },
};
```

You can provide a key as third argument to `set` in order to use a property as key instead of index.
E.g.,

```js
dd.set(
  'users',
  [
    { id: 'a', name: 'Mr. A' },
    { id: 'b', name: 'Mr. B' },
  ],
  'id'
);

// Becomes
const result = {
  users: {
    a: { id: 'a', name: 'Mr. A' },
    b: { id: 'b', name: 'Mr. B' },
  },
};
```

#### Arrays in JSX

If you provide a path with a wildcard such as `$id` to `on` elements will render as a list/array,
but you can't control things like order. It's just a way to get "data out there".

E.g.,

```jsx
const view = ({ on }) => (
  <ul>
    {on('users.$id', user => (
      <li>{user.name}</li>
    ))}
  </ul>
);

const dd = domdom(document.body, view);

dd.set(
  'users',
  [
    { id: 'a', name: 'Mr. A' },
    { id: 'b', name: 'Mr. B' },
    { id: 'b', name: 'Mr. C' },
  ],
  'id'
);
```

Will render as:

```html
<ul>
  <li>Mr. A</li>
  <li>Mr. B</li>
  <li>Mr. C</li>
</ul>
```

#### Pathifier

If you want custom sorting and/or filtering you can use a **Pathifier**.  
Creating one is a bit quirky, you call `on` without a listener, and then chain with `map`. Weird.

E.g.,

```jsx
const view = ({ on }) => (
  <ul>
    {on('users')
      .map(user => <li>{user.name}</li>)
      .filter(user => user.name !== 'Mr. B')
      .sort((a, b) => b.id.localeCompare(a.id))}
  </ul>
);
```

Will render as:

```html
<ul>
  <li>Mr. C</li>
  <li>Mr. A</li>
</ul>
```

There's also a `filterOn` and `sortOn`.
Use these if you want to listen for another path for changes, and then filter/sort when these changes.  
This will listen both for changes on the given path, and the path provided to the method.

E.g.,

```jsx
const view = ({ on }) => (
  <ul>
    {on('users')
      .map(user => <li>{user.name}</li>)
      .filterOn('test', (filter, user) => user.name !== filter)}
  </ul>
);
const dd = domdom(document.body, view);
dd.set('test', 'Mr. C');
// Add users as above
```

Will render as:

```html
<ul>
  <li>Mr. A</li>
  <li>Mr. B</li>
</ul>
```

## Recipes

How to handle common tasks with domdom

### Routing

```jsx
const view = ({ when }) => (
  <div>
    {when('route', ['login', () => <Login />, 'welcome', () => <Welcome />]).or(
      'Loading app...'
    )}
  </div>
);

function gotoRoute(route) {
  window.location.hash = route;
}

window.addEventListener('hashchange', () =>
  dd.set('route', window.location.hash.slice(1))
);
```

### Login form

```jsx
function login(event) {
  event.preventDefault();
  fetch('/login', {
    method: 'post',
    body: new URLSearchParams(new FormData(event.target)),
  });
}

const view = () => (
  <form onSubmit={login}>
    <input name="username" />
    <input name="password" type="password" />
    <button type="submit">Login</button>
  </form>
);
```

### Split view and data

_data.js_

```js
export default ({ on, set }) => {
  on('= search', event => {
    event.preventDefault();
    const searchText = event.target.search.value;
    set('result', `Data for ${searchText} here...`);
  });
};
```

_index.jsx_

```jsx
import data from './data';
import domdom from '@eirikb/domdom';

const dd = domdom();

data(dd);

const view = ({ on, trigger }) => (
  <form onSubmit={e => trigger('search', e)}>
    <input type="search" name="search" />
    <button type="submit">Search</button>
    {on('result', _ => _)}
  </form>
);

dd.append(document.body, view);
```

### Animation (garbage collection)

At writing moment domdom doesn't have any unmount callback.  
I'm not a big fan of destructors, unmounted, dispose or similar.  
This might seem silly, and it might not be obvious how to use say `setInterval`,
without this preventing the element from ever being cleaned up by garbage collector.  
The idea is to use `dd` for such things, as these listeners are automatically cleaned up.

```jsx
const view = ({ on, get, set }) => {
  const img = <img src="https://i.imgur.com/rsD0RUq.jpg" />;

  on('tick', time => (img.style.transform = `rotate(${time % 180}deg)`));

  return (
    <div>
      <button onClick={() => set('run', !get('run'))}>Start/Stop</button>
      {img}
    </div>
  );
};

(function loop(time) {
  if (dd.get('run')) {
    dd.set('tick', time);
  }
  requestAnimationFrame(loop);
})(0);
```

## TypeScript

Domdom has full TypeScript support, it's written in TypeScript after all.

Work with `Domponent` like this:

```tsx
import { Domponent } from '@eirikb/domdom';
const app: Domponent = ({ on }) => <div>{on('hello.world')}</div>;
export default app;
```

Your magnificent developer tooling should help you with the rest.
