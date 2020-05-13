// import { pathToRegexp } from 'path-to-regexp';

import { router } from './router.js';

const $w = window;
export const routes = {
  pages: /^\/(?<page>(about|home|result)?)$/i,
  result: /^\/(?<page>result)\/(?<result>[^\/]*)$/i,
};
// const routes2 = {
//   pages: pathToRegexp('/(about|home|result)'),
//   result: pathToRegexp('/result/:result'),
// };

// function customMatcher<T>(pathname: string, pathRegExp: RegExp): T {
//   const [, ...matches] = pathname.match(pathRegExp) ?? [];

//   switch (pathRegExp) {
//     case routes2.result: {
//       return { result: matches[0] } as unknown as T;
//     }
//     case routes2.pages:
//     default: {
//       return { page: matches[0] } as unknown as T;
//     }
//   }
// }

$w.addEventListener('load', () => {
  // router.observe([routes.pages], { matcherCallback: customMatcher });
  router.observe([routes.pages]);

  console.info('URLObserver is running...');

  ($w as any).router = router;
});
