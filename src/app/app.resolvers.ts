import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { combineLatest, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/core/user/user.service';
import { FunctionService } from './core/function/function.service';
import { AuthService } from './core/auth/auth.service';


@Injectable({
    providedIn: 'root'
})

export class InitialDataResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _navigationService: NavigationService,
        private _userService: UserService,

        private _functionService: FunctionService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Use this resolver to resolve initial mock-api for the application
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        //console.log(state.url);
        // Fork join multiple API endpoint calls to wait all of them to finish
        return combineLatest({
            navigation: this._navigationService.get(),
            user: this._userService.get(),

            function: this._functionService.get(state.url)
        }).pipe(map(response => {
            if (!response.user) {
                this._router.navigate(['sign-in']);
                return false;
            }
            this._functionService.isView$.subscribe((obj) => {
                if (!obj) {
                    this._router.navigate(['404-not-found']);
                    return false;
                }
            })
            return true;
        },
            // how to handle error for fn1, fn2, fn3 separately
            (error) => {
                this._router.navigate(['404-not-found']);
                return false;
            }));
    }
}

@Injectable({
    providedIn: 'root'
})
export class SignInAutoResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _authService: AuthService

    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        if (route.paramMap.get('token')) {
            return this._authService.signInUsingToken().pipe(switchMap((response: any) => {
                if (response) {
                    this._router.navigate(['signed-in-redirect']);
                    return of(true);
                } else {
                    this._router.navigate(['sign-in']);
                    return of(true);
                }

            }));
        } else {
            this._router.navigate(['sign-in']);
        }
    }
}
