import { ActivatedRouteSnapshot, Route, UrlMatchResult, UrlSegment } from '@angular/router';
import { isEqual } from 'lodash';
import { ListUserComponent } from './listuser.component';
import { ListUserDetailResolver, ListUserGroupsResolver, ListUserResolver } from './listuser.resolvers';
import { ListUserDetailsComponent } from './detail/details.component';
import { ListUserEmptyDetailsComponent } from './empty-details/empty-details.component';
import { ListUserListComponent } from './list/list.component';

export const ListUserRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {

  // Prepare consumed url and positional parameters
  let consumed = url;
  const posParams = {};


  posParams[url[0].path] = url[1];
  posParams['page'] = url[2];

  // Remove the id if exists
  if (url[3]) {
    consumed = url.slice(0, -1);
  }


  return {
    consumed,
    posParams
  };
};

export const ListUserRunGuardsAndResolvers: (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean = (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => {

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

export const ListUserRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'group/all/1',
    pathMatch: 'full'
  },
  {
    path: 'group/:group',
    redirectTo: 'group/:group/1',
    pathMatch: 'full'
  },
  {
    path: '',
    component: ListUserComponent,
    resolve: {
      group: ListUserGroupsResolver,
    },
    children: [
      {
        component: ListUserListComponent,
        matcher: ListUserRouteMatcher,
        runGuardsAndResolvers: ListUserRunGuardsAndResolvers,
        resolve: {
          apis: ListUserResolver
        },
        children: [
          {
            path: '',
            pathMatch: 'full', 
            component: ListUserEmptyDetailsComponent
          },
          {
            path: ':id',
            component: ListUserDetailsComponent,
            runGuardsAndResolvers: 'always',
            resolve: {
              apiDetail: ListUserDetailResolver
            }
          }
        ]
      }
    ]
  }
];
