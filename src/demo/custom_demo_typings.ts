export interface DialogClosedEvent {
  action: 'confirm' | 'dismiss';
}

export interface RouteMatch {
  page: Page;
}

export type Page = Pages[number];

export type Pages = ['about', 'home', 'not-found', 'result'];
