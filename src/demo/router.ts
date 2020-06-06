import { URLObserver } from '../url-observer.js';

export const router = new URLObserver();
// export const router = new URLObserver((list, obs) => {
//   console.log('observing...', obs, list.getEntries().map(n => n.toJSON()));
// });

window.router = router;
