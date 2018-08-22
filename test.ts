import * as test from 'tape';
import { createStore, applyMiddleware } from 'redux';
import { createMiddleware } from 'redux-cofx';

import createRouterMiddleware from './index';
import { LOCATION_CHANGE } from 'connected-react-router';

test('middleware no params', (t: test.Test) => {
  t.plan(1);
  const location = { pathname: '/something' };
  function fn(loc: any) {
    t.deepEqual(loc, {
      path: '/something',
      url: '/something',
      isExact: true,
      params: {},
    });
  }
  const cofx = createMiddleware();
  const { middleware } = createRouterMiddleware({
    '/something': fn,
  });
  const store = createStore(
    (state: any) => state,
    applyMiddleware(cofx, middleware),
  );
  store.dispatch({ type: LOCATION_CHANGE, payload: { location } });
});

test('middleware with params', (t: test.Test) => {
  t.plan(1);
  const location = { pathname: '/something/123' };
  function fn(loc: any) {
    t.deepEqual(loc, {
      path: '/something/:id',
      url: '/something/123',
      isExact: true,
      params: { id: '123' },
    });
  }
  const cofx = createMiddleware();
  const { middleware } = createRouterMiddleware({
    '/something/:id': fn,
  });
  const store = createStore(
    (state: any) => state,
    applyMiddleware(cofx, middleware),
  );
  store.dispatch({ type: LOCATION_CHANGE, payload: { location } });
});
