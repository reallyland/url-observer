// export const HOST = 'http://localhost:4000/test.html';

export const routes: Record<'section' | 'test', RegExp> = {
  section: /^\/test\/(?<test>[^\/]+)$/i,
  test: /^\/test$/i,
};
