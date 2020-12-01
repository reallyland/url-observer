// import { pathToRegexp } from 'path-to-regexp';

import { router } from './router.js';

type Route = 'pages' | 'result';

const $w = window;
export const routes: Record<Route, RegExp> = {
  pages: /^\/(?<page>(about|home|result)?)$/i,
  result: /^\/(?<page>result)\/?(?<result>[^\/]*)$/i,
};
// export const routes = {
//   pages: pathToRegexp('/(about|home|result)'),
//   result: pathToRegexp('/result/:result'),
// };

// function customMatcher<T>(pathname: string, pathRegExp: RegExp): T {
//   const [, ...params] = pathname.match(pathRegExp) ?? [];

//   switch (pathRegExp) {
//     case routes.result: {
//       return { result: decodeURIComponent(params[0]) } as unknown as T;
//     }
//     case routes.pages:
//     default: {
//       return { page: decodeURIComponent(params[0]) } as unknown as T;
//     }
//   }
// }

$w.addEventListener('load', () => {
  // router.observe([routes.pages], { matcherCallback: customMatcher });
  // router.observe(Object.values(routes), { dwellTime: -1 });
  router.observe(Object.values(routes), { debug: true, dwellTime: -1 });

  console.info('URLObserver is running...', router.takeRecords());

  $w.router = router;
});
