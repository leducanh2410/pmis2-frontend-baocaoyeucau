import { ActivatedRouteSnapshot, Route, UrlMatchResult, UrlSegment } from '@angular/router';
import { isEqual } from 'lodash';
import { NguonDuLieuDetailsComponent } from './detail/details.component';
import { NguonDuLieuEmptyDetailsComponent } from './empty-details/empty-details.component';
import { NguonDuLieuListComponent } from './list/list.component';
import { NguonDuLieuComponent } from './nguondulieu.component';
import { NguonDuLieuDetailResolver, NguonDuLieuListResolver } from './nguondulieu.resolvers';


export const NguonDuLieuRunGuardsAndResolvers: (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean = (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => {

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
export const NguonDuLieuRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {

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
export const NguonDuLieuRoutes: Route[] = [
  {
    path: '',
    component: NguonDuLieuComponent,
    children: [
      {
        component: NguonDuLieuListComponent,
        matcher: NguonDuLieuRouteMatcher,
        runGuardsAndResolvers: NguonDuLieuRunGuardsAndResolvers,
        resolve: {
          apis: NguonDuLieuListResolver
        },
        children: [
          {
            path: '',
            pathMatch: 'full',
            component: NguonDuLieuEmptyDetailsComponent
          },
          {
            path: ':id',
            runGuardsAndResolvers: 'always',
            component: NguonDuLieuDetailsComponent,
            resolve: {
              apiDetail: NguonDuLieuDetailResolver
            }
          }
        ]
      }
    ]
  }
];
