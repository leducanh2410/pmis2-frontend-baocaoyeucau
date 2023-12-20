import { ActivatedRouteSnapshot, Route, UrlMatchResult, UrlSegment } from '@angular/router';
import { isEqual } from 'lodash';
import { ApiGroupDetailsComponent } from './detail/details.component';
import { ApiGroupEmptyDetailsComponent } from './empty-details/empty-details.component';
import { ApiGroupListComponent } from './list/list.component';
import { ApiGroupComponent } from './listapigroup.component';
import { ApiGroupDetailResolver, ApiGroupListResolver } from './listapigroup.resolvers';


export const ApiGroupRunGuardsAndResolvers: (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean = (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => {

  // If we are navigating from mail to mails, meaning there is an id in
  // from's deepest first child and there isn't one in the to's, we will
  // trigger the resolver

  // Get the current activated route of the 'from'
  let fromCurrentRoute = from;
  while (fromCurrentRoute.firstChild) {
    fromCurrentRoute = fromCurrentRoute.firstChild;
  }

  // Get the current activated route of the 'to'
  let toCurrentRoute = to;
  while (toCurrentRoute.firstChild) {
    toCurrentRoute = toCurrentRoute.firstChild;
  }

  // Trigger the resolver if the condition met
  if (fromCurrentRoute.paramMap.get('id') && !toCurrentRoute.paramMap.get('id')) {
    return true;
  }

  // If the from and to params are equal, don't trigger the resolver
  const fromParams = {};
  const toParams = {};

  from.paramMap.keys.forEach((key) => {
    fromParams[key] = from.paramMap.get(key);
  });

  to.paramMap.keys.forEach((key) => {
    toParams[key] = to.paramMap.get(key);
  });

  if (isEqual(fromParams, toParams)) {
    return false;
  }

  // Trigger the resolver on other cases
  return true;
};
export const ApiGroupRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {

  // Prepare consumed url and positional parameters
  let consumed = url;
  const posParams = {};
  if (url[0]) {
    consumed = url.slice(0, -1);
  }
  return {
    consumed,
    posParams
  };
};
export const ApiGroupRoutes: Route[] = [
  {
    path: '',
    component: ApiGroupComponent,
    children: [
      {
        component: ApiGroupListComponent,
        matcher: ApiGroupRouteMatcher,
        runGuardsAndResolvers: ApiGroupRunGuardsAndResolvers,
        resolve: {
          apis: ApiGroupListResolver
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: ApiGroupEmptyDetailsComponent
          },
          {
            path: ':id',
            runGuardsAndResolvers: 'always',
            component: ApiGroupDetailsComponent,
            resolve: {
              apiDetail: ApiGroupDetailResolver
            }
          }
        ]
      }
    ]
  }
];
