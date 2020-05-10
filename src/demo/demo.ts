import { router } from './router.js';

const $w = window;
export const routes = {
  pages: /^\/(?<page>(about|home|result)?)$/i,
  result: /^\/(?<page>result)\/(?<result>[^\/]*)$/i,
};

$w.addEventListener('load', () => {
  router.observe(Object.values(routes));

  console.info('URLObserver is running...');

  ($w as any).router = router;
});
