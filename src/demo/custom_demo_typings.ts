export interface DialogClosedEvent {
  action: 'confirm' | 'dismiss';
}

export interface RouteMatch extends Record<string, unknown> {
  page: Page;
}

export type Page = Pages[number];

export type Pages = ['about', 'home', 'not-found', 'result'];
