import { LOCATION_CHANGE } from 'connected-react-router';
import { matchPath } from 'react-router';
import { Location } from 'history';

import { call, createEffect } from 'redux-cofx';

interface Action {
  type: string;
  [key: string]: any;
}
interface Dispatch {
  <T extends Action>(action: T): T;
}
interface State<S> {
  dispatch: Dispatch;
  getState: () => S;
}
type Fn = (...args: any[]) => any;
interface RouterMap {
  [key: string]: Fn;
}

export interface MatchLocation {
  path: string;
  url: string;
  isExact: boolean;
  params: { [key: string]: string };
}
interface LocationChange {
  routes: string[];
  router: (path: string) => Fn;
  location: Location;
}

function getRouteParams(pathname: string, matcher: string[]) {
  for (const path of matcher) {
    const match = matchPath(pathname, { path });

    if (!match) {
      continue;
    }

    if (match.isExact) {
      return match;
    }
  }

  return {
    path: '',
    url: '',
    isExact: false,
    params: {},
  };
}

const noop = () => {};
const createRouter = (map: RouterMap) => (path: string) => map[path] || noop;

function* onLocationChange({ routes, router, location }: LocationChange) {
  const pathname = location.pathname;
  const params = getRouteParams(pathname, routes);
  const path = params.path === '' ? pathname : params.path;
  const routeFn = router(path);
  yield call(routeFn, params);
}

export default <S>(routerMap: RouterMap) => {
  const routes = Object.keys(routerMap);
  const router = createRouter(routerMap);
  const locationChange = (location: Location) =>
    createEffect(onLocationChange, {
      routes,
      router,
      location,
    });

  const middleware = (store: State<S>) => (next: Dispatch) => (
    action: Action,
  ) => {
    if (action.type === LOCATION_CHANGE) {
      const location = action.payload.location;
      store.dispatch(locationChange(location));
    }

    next(action);
  };

  return {
    middleware,
    locationChange,
  };
};
