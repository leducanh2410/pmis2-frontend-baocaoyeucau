import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Injectable({
  providedIn: 'root'
})
export class DashboardResolver implements Resolve<any> {
  private user: User;

  constructor(
    private _dashboardService: DashboardService,
    private _userService: UserService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    this._userService.user$
      .subscribe((response: User) => {
        this.user = response;
      });

    const sources = [];
  //  sources.push(this._dashboardService.getDashboardByUserId(this.user.userId));
      sources.push(this._dashboardService.getDashboardSharedAndCreatedEnableByUserId(this.user.userId));

    return forkJoin(sources)
            .pipe(
                // Error here means the requested Api is either
                // not available on the requested page or not
                // available at all
                catchError((error) => {
                    // Log the error
                    console.error(error);
                    return of(null);
                })
            );
  }
}
