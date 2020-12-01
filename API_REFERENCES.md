# URLObserver

An URLObserver watches all history updates in a browser whenever:

* a link being click (by intercepting all clickable links in a page)
* a `popstate` event being fired
* a `hashchange` event being fired (_Note that a `hashchange` event also fires a `popstate` event before firing itself._)

> ❗️ LIMITATION: There can only be one URLObserver running in a  web application. Having multiple observers will run only the first one and it might produce the outcome you might expect.

## Concepts

### Scoped link

Scoped link is introduced to allow multiple before route handlers to be registered to a single route. With different `scope` value, the corresponding route handler will be triggered when a new URL is ready to navigated. The route handler needs to return `true` to navigate to new URL.

```html
<!-- Scoped link with scope=123 -->
<a href="/test/123" scope="123">/test/123</a>

<!-- Scoped link with scope=:default -->
<a href="/test/456" scope>/test/456</a>

<!-- Normal link -->
<a href="/test/789">/test/789</a>
```

```ts
const routes = {
  test: /^\/test\/(?<test>[^\/]+)$/i,
};

/** This will get triggered only when clicking a[scope="123"] */
observer.add({
  handleEvent() {
    return true;
  },
  pathRegExp: routes.test,
  scope: '123',
});

/** This will get triggered only when clicking a[scope=""] */
observer.add({
  handleEvent() {
    return true;
  },
  pathRegExp: routes.test,
  /** `scope` defaults to ':default' when it is not defined or is an empty string */
});
```

## Events

### :popState

Custom event being fired whenever the URLObserver receives a `popstate` event when a page loads.

* `detail` <[RouteEvent&lt;T&gt;]> Custom data passed from the observer.
  * `scope` <[string]> Scope value.
  * `status` <[URLChangedStatus]> Status code indicates what triggers the history update.
  * `url` <[string]> Absolute URL that triggers the event.
  * `found` <[boolean]> If true, the URL is a matched route.
  * `params` <T> URL matches.

```ts
window.addEventListener(':popState', ({ detail }) => {
  console.log('data', {
    found: detail.found,
    params: detail.params,
    scope: detail.scope,
    status: detail.status,
    url: detail.url,
  });
});
```

### :pushState

Custom event being fired whenever the URLObserver pushes a history entry. Refer to [:popState] for the custom data passed from the observer.

## Interfaces

### MatchedRoute&lt;T&gt;

```ts
interface MatchedRoute<T extends Records<string, any>> {
  found: boolean;
  params: T;
}
```

### RouteEvent&lt;T&gt;

```ts
interface RouteEvent<T extends Record<string, any> = Record<string, any>> {
  found: boolean;
  params: T;
  scope: string;
  status: URLChangedStatus;
  url: string;
}
```

### RouteOption&lt;T&gt;

```ts
interface RouteOption<T extends Record<string, any>> {
  handleEvent?(params: T, status: URLChangedStatus): Promise<boolean>;
  pathRegExp: RegExp;
  scope?: string;
}
```

### URLChangedStatus

```ts
type URLChangedStatus =
  | 'click'
  | 'hashchange'
  | 'init'
  | 'manual'
  | 'popstate';
```

### URLObserverEntry

```ts
interface URLObserverEntry {
  public readonly entryType: URLChangedStatus;
  public readonly scope: string;
  public readonly startTime: number;
  public readonly url: string;
  public toJSON(): URLObserverEntryProperties;
}
```

### URLObserverEntryProperties

```ts
interface URLObserverEntryProperties {
  public entryType: URLChangedStatus;
  public scope: string;
  public startTime: number;
  public url: string;
}
```

### URLObserverOption 

```ts
interface URLObserverOption {
  debug?:boolean;
  dwellTime?: number;
  matcherCallback<T>(pathname: string, pathRegExp: RegExp): T;
}
```

## Methods

### add&lt;T&gt;(option: RouteOption&lt;T&gt;): void

Dynamically add new route or a before route handler to an registered route.

* `option` <[RouteOption&lt;T&gt;]> Route option.
  * `handleEvent` <?[Function]> Optional before route handler that executes before navigating to a new URL.
    * `params` <`T`> URL matches.
    * `status` <[URLChangedStatus]> Status code indicates what triggers the history update.
    * returns: <[Promise]&lt;[boolean]&gt;> If true, navigates to new URL.
  * `pathRegExp` <[RegExp]> URL matching RegExp.
  * `scope` <?[string]> Optional scope. Defaults to `:default` when it is not set or set to an empty string. _See [Scoped link] to understand more in depth._

* Example:

  ```ts
  /** To dynamically add new route */
  observer.add({ pathRegExp: /^\/test2$/i });

  /** To dynamically add new before route handler to existing route */
  observer.add({
    handleEvent: () => true,
    pathRegExp: /^\/test$\//i,
  });

  /**
   * To dynamically add new scoped before route handler to existing route.
   * Note that scope needs to be set in the anchor tag that needs to trigger the route handler, e.g.
   * 
   * <a href="/test" scope=":test">/test</a>
   */
  observer.add({
    handleEvent: () => true,
    pathRegExp: /^\/test$\//i,
    scoped: ':test',
  });
  ```

### disconnect(): void

When called, the observer instance stops listening for URL changes and clear all tracking records.

```ts
observer.disconnect();

console.assert(observer.takeRecords().length === 0);
```

### match&lt;T&gt;(): MatchedRoute&lt;T&gt;

Run to determine if current URL is a matching route that is being observed by the observer. It also returns matching URL parameters if there is any.
* returns: [MatchedRoute&lt;T&gt;] An object contains `found` and `params`. `found` is set to true for a matched route while `params` contains all the URL matches.

```ts
interface A {
  test: string;
}

observer.observe([/^\/test\/(?<test>[^\/]+)$/i]);

/** Say, current URL is 'https://example.com/test/123', */
const {
  found,
  params,
} = observer.match<A>();

console.assert(found === true);
console.assert(params.test === '123');

/** Say, current URL is 'https://example.com/test2/123', */
const {
  found,
  params,
} = observer.match<A>();

console.assert(found === false);
console.assert(params.test === undefined);
```

### observe(routes: RegExp[][, option: URLObserverProperties]): void

Observe all history updates.

* `routes` <[Array]&lt;[RegExp]&gt;> An array of [RegExp] used to perform URL parameters matching against new URL. URLObserver observe all history updates and it will mark those being not observed as a not-found route so that user can handle not-found route in their web application.
* `option` <?[URLObserverOption]> Optional observer option.
  * `debug` <?[boolean]> Optional debug flag. Default to `false`. When it is set to `true`, the observer exposes a new `routes` property for debugging purpose which contains all routes being observed as well as all before route handlers attached  to an existing route.
  * `dwellTime` <?[number]> Optional dwell time in milliseconds. It is to protect against accidental history spamming by only adding the entries as new browser history (in other words, it replaces the current browser history) if the URL stays unchanged for the specified amount of time. Set to `-1` to disable such behavior to always add new URL entry.
  * `matcherCallback` <?[Function]> Optional function to override internal URL parameters matching. By default, it uses RegExp named capture groups introduced in ES2018 but not all browsers support that natively as of writing. This allows users to override or customize the internal callback without the need to polyfill the unsupported feature using third party library.
    * `pathname` <[string]> URL pathname.
    * `pathRegExp` <[RegExp]> URL RegExp.

```ts
/** Observing without initial routes */
observer.observe([]);

const routes: Record<string, RegExp> = {
  test: /^\/test$/i,
  section: /^\/test\/([^\/]+)$/i,
};

/** Observing with an initial route */
observer.observe([routes.test]);

/** Observing with an initial route and enable debugging mode */
observer.observe([routes.test], { debug: true });

/** With debugging mode, user will be able to see all the routes and attached before route handlers via `routes` */
console.log(observer.routes);

/** Observing with an initial route and custom dwellTime. */
observer.observe([routes.test], { dwellTime: -1 });

interface A {
  test: string;
}

/**
 * Override matcherCallback() with custom callback.
 * 
 * Notice `routes.section` does not contain any named capture groups,
 * the custom callback does all the tedious matching work.
 */
observer.observe([routes.test, routes.section], {
  matcherCallback<A>(pathname, pathRegExp): A {
    if (routes.section.test(pathname)) {
      return {
        test: routes.section.exec(pathname)[1],
      };
    }

    return {} as A;
  },
})
```

### remove(pathRegExp: RegExp[, scope: string | undefined]): boolean

Remove existing route or before route handler attached to a route by specifying the `scope` value. When `scope` is not specified or is an empty string, a route will be removed. To remove the default before route handler, you need to explicitly specify `:default`.

* `pathRegExp` <[RegExp]> Observing route.
* `scope` <?[string] | [undefined]> Optional scope value. This must be explicitly specified when removing a before route handler, even for a `:default` before route handler.
* returns: <[boolean]> Return `true` when a route or before route handler is removed successfully.

```ts
const routes: Record<string, RegExp> = {
  test: /^\/test$/i,
};

/** Remove route */
observer.remove(routes.test);

/** Remove default before route handler */
observer.remove(routes.test, ':default');

/** Remove scoped before route handler */
observer.remove(routes.test, ':test');
```

### takeRecords(): Array&lt;URLObserverEntry&gt;

Returns the current list of URLObserver entries.

* returns: [Array]&lt;[URLObserverEntry]&gt; A list of observer entries.

```ts
for (const n of observe.takeRecords()) {
  console.log('entry:', {
    entryType: n.entryType,
    scope: n.scope,
    startTime: n.startTime,
    url: n.url,
  });
}
```

### updateHistory(pathname: string[, scope?: string]): Promise<void>

This allows manual history update that is neither triggered by a link click or a popstate. 

* `pathname` <[string]> URL pathname. Either absolute or relative URL is acceptable.
* `scope` <?[string]> Optional scope value. Explicitly specify a `scope` value to trigger an attached before route handler, even for the `:default` before route handler.
* returns: <[Promise]<`void`>> A [Promise] that fulfills when the history update completes, after the [:pushState] event is fired.

```ts
/** Manually update to '/test/123' */
await observer.updateHistory('/test/123');

/** Manually update to '/test/123' and trigger the ':default' before route handler */
await observer.updateHistory('/test/123', ':default');

/** Manually update to '/test/123' and trigger the scoped before route handler */
await observer.updateHistory('/test/123', ':test');
```

## Properties

### routes

This is by default not exposed. Set `debug` to `true` to expose this property for debugging purpose only.

```ts
observer.observe([/^\/test$/i], { debug: true });

console.log(observer.routes);
```

<!-- References -->
[:popState]: #popstate
[:pushState]: #pushstate
[MatchedRoute&lt;T&gt;]: #matchedroutet
[RouteOption&lt;T&gt;]: #routeoptiont
[Scoped link]: #scoped-link
[URLChangedStatus]: #urlchangedstatus
[URLObserverEntry]: #urlobserverentry
[RouteEvent&lt;T&gt;]: #routeeventt

[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[Function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function
[Map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number
[Object]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[Regexp]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
[Set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
[undefined]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined
