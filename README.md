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
[![npm](https://img.shields.io/npm/v/@eirikb/domdom.svg)](https://npmjs.org/package/@eirikb/domdom)
[![Build](https://github.com/eirikb/domdom/workflows/Build/badge.svg)](https://github.com/eirikb/domdom/actions?query=workflow%3ABuild)
[![bundlephobia](https://badgen.net/bundlephobia/minzip/@eirikb/domdom)](https://bundlephobia.com/result?p=@eirikb/domdom)

The proactive web framework for the unprofessional

domdom is an alternative to React + Redux or Vue + Vuex, with support for routing.  
There's no virtual dom.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Install](#install)
- [Getting started](#getting-started)
- [Recipes](#recipes)
  - [Routing](#routing)
  - [Login form](#login-form)
  - [Split view and data](#split-view-and-data)
  - [Animation (garbage collection)](#animation-garbage-collection)
- [API](#api)
  - [Elements](#elements)
  - ["Components"](#components)
    - [Children / Composition](#children--composition)
  - [Events](#events)
  - [on(path, callback)](#onpath-callback)
  - [when(path, oddEvenArrayOfCheckAndResult)](#whenpath-oddevenarrayofcheckandresult)
  - [or](#or)
  - [dd-model](#dd-model)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm i @eirikb/domdom
```

## Getting started

index.html
```html
<body><script src="app.jsx"></script></body>
```

app.jsx
```jsx harmony
import domdom from '@eirikb/domdom'

const dd = domdom()

const view = ({ on }) => <div>Hello, {on('name')}</div>

dd.append(document.body, view)

dd.set('name', 'world!')
```

Run
```bash
npx parcel index.html
```

## Recipes

How to handle common tasks with domdom

### Routing

```jsx harmony
const view = ({ when }) => <div>
  {when('route', [
    'login', () => <Login/>,
    'welcome', () => <Welcome/>,
  ]).or('Loading app...')}
</div>

function gotoRoute(route) {
  window.location.hash = route
}

window.addEventListener('hashchange', () =>
  dd.set('route', window.location.hash.slice(1))
)
```

### Login form

```jsx harmony
function login(event) {
  event.preventDefault()
  fetch('/login', {
    method: 'post',
    body: new URLSearchParams(new FormData(event.target))
  })
}

const view = () => <form onSubmit={login}>
  <input name="username"/>
  <input name="password" type="password"/>
  <button type="submit">Login</button>
</form>
```

### Split view and data

*data.js*
```js
export default ({ on, set }) => {
    on('= search', event => {
      event.preventDefault()
      const searchText = event.target.search.value
      set('result', `Data for ${searchText} here...`)
    })
}
```

*index.jsx*
```jsx harmony
import data from './data'
import domdom from '@eirikb/domdom'

const dd = domdom()

data(dd)

const view = ({ on, trigger }) => <form onSubmit={e => trigger('search', e)}>
  <input type="search" name="search"/>
  <button type="submit">Search</button>
  {on('result', _ => _)}
</form>

dd.append(document.body, view)
```

### Animation (garbage collection)

At writing moment domdom doesn't have any unmount callback.  
I'm not a big fan of destructors, unmounted, dispose or similar.  
This might seem silly, and it might not be obvious how to use say `setInterval`, 
without this preventing the element from ever being cleaned up by garbage collector.  
The idea is to use `dd` for such things, as these listeners are automatically cleaned up.

```jsx harmony
const view = ({ on, get, set }) => {
  const img = <img src="https://i.imgur.com/rsD0RUq.jpg"/>

  on('tick', time => img.style.transform = `rotate(${time % 180}deg)`)

  return <div>
    <button onClick={() => set('run', !get('run'))}>Start/Stop</button>
    {img}
  </div>
}

(function loop(time) {
  if (dd.get('run')) {
    dd.set('tick', time)
  }
  requestAnimationFrame(loop)
})(0)

```

## API

The domdom object (from `domdom()`, called `dd` above) extends from [@eirikb/data](https://www.npmjs.com/package/@eirikb/data).  
All data functions are available, 
`on` `off` `get` `set` `unset` `trigger`, so it's possible to do things like:
```javascript
dd.on('!+* a', a => console.log(a))
dd.set('a', 'yes')
```

The only function in addition is `append`, which is for appending a view to a parent element.

```jsx harmony
const viewFunction = () => <div></div>
const parentElement = document.querySelector('#app')
dd.append(parentElement, viewFunction)
```

### Elements 

All elements created with jsx, in the context of domdom, are elements which can be instantly referenced.
```jsx harmony
const element = <div>Behold!</div>
element.style.color = 'red'
```

### "Components"

By creating a function you create a component.  

```jsx harmony
function MyComponent({ on }) {
  return <ul>
    {on('players.$id.name', name => <li>Player {name}</li>)}
  </ul>
}
```


#### Children / Composition

Content of a component will be passed as `children`.

```jsx harmony
function Button({ children }) {
  return <button>{children}</button>
}

const view = () => <div>
  <Button>
    <b>Hello</b>
  </Button>
</div>
```

### Events

All attributes starting with 'on' are added to `addEventListener` on the element.

```jsx harmony
function MyButton({trigger}) {
  return <button onClick={() => trigger('Clicked!')}>Click me!</button>
}
```

### on(path, callback)

Similar to `data.on`, except without flags.

Note that `on` triggers on change in accordance with `data.on`, and it's not "truey"/"falsey", in order
for elements to be removed one must use `dd.unset`.

`callback` is optional, if omitted the result will be returned as-is,  
either as string or JSON of object.

```jsx harmony
const view = ({ on }) => <ul>
  {on('players.$id.name', name => <li>Player {name}</li>)}
  {on('info')}
</ul>
```

### when(path, oddEvenArrayOfCheckAndResult)

Heard of pattern matching? This isn't it

```jsx harmony
const view = ({ when }) => <div>
  {when('route', [
    'home', () => <div>Home!</div>,
    'away', () => <div>Away!</div>,
     route => (route || '').startsWith('eh'), () => <div>Eh?</div>,
     false, () => <div>Route is literally boolean false</div>
  ])}
</div>
```

### or

Neither `on` or `when` will trigger unless there is a value on the path, in order to show something at all
until some value is set `or` must be used.

```jsx harmony
const view = ({ when }) => <div>
  {when('routing', [
    'home', () => <div>Home!</div>
  ]).or(<div>Loading app in the fastest possible way...</div>)}
</div>
```

### dd-model

This is a convenience hack for putting data into and out of a data path from an input.  
Similar to v-model and ng-model.  
Suggest not using this if possible, using forms directly like in recipes is much better.


```jsx harmony
dd.on('= search', event => {
  event.preventDefault()
  dd.set('result', `Data for ${dd.get('text')} here...`)
})

const view = ({ when, on, trigger }) => <form onSubmit={e => trigger('search', e)}>
  <input type="search" dd-model="text"/>
  <input type="checkbox" dd-model="more"/>
  {when('more', [
    true, () => 'This is more'
  ])}
  Current text: {on('text')}
  <button type="submit">Search</button>
  {on('result', _ => _)}
</form>
```

### Attributes

It's possible to use `on` directly on attributes.  
It might feel and look a bit quirky, but there it is.

```jsx harmony
  const view = ({ on, set, get }) => <div>
    <button onClick={() => set('toggle', !get('toggle'))}>Toggle</button>
    <button disabled={on('toggle').or(true)}>A</button>
    <button disabled={on('toggle', res => !res)}>B</button>
  </div>;
```

