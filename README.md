# redux-router-cofx

```js
import { createStore, applyMiddleware, compose } from 'redux';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware, push } from 'connected-react-router';
import { createMiddleware, put } from 'redux-cofx';
import cofxMiddlewareCreator from 'redux-router-cofx';

// some side-effect
function* onSomeRoute(location: any) {
  const id = location.params.id;
  yield put({ type: 'fetch-something', payload: id });
}
function* onRootRoute(location: any) {
  yield put({ type: 'fetch-dashboard' });
}

// cofx router that maps routes to effects
const cofxRouterMiddleware = cofxMiddlewareCreator({
  '/': onRootRoute,
  '/something/:id': onSomeRoute,
});
// cofx middleware object
const cofxMiddleware = createMiddleware();

const history = createBrowserHistory();
const reducer = (state: any) => state;
const rootReducer = connectRouter(history)(reducer);
const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      cofxMiddleware,
      cofxRouterMiddleware.middleware,
      routerMiddleware(history),
    ),
  ),
);
const location = store.getState().router.location;
// do this when first booting up the app so you can receive an event immediately
store.dispatch(cofxRouterMiddleware.locationChange(location));
// push some location change
store.dispatch(push('/something/123'));
```
