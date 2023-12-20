import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, finalize, forkJoin, Observable, throwError } from 'rxjs';
import { VeBieuDoService } from './vebieudo.service';

@Injectable({
    providedIn: 'root'
})
export class VeBieuDoGroupsResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(private _vebieudoService: VeBieuDoService) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
        return this._vebieudoService.getGroups();
    }
}

@Injectable({
    providedIn: 'root'
})
export class VeBieuDoListResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _vebieudoService: VeBieuDoService,
        private _router: Router
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> | any {
        // Create and build the sources array
        const sources = [];

        // If folder is set on the parameters...
        if (route.paramMap.get('group')) {
            sources.push(this._vebieudoService.getObjectsByFolder(route.paramMap.get('group'), route.paramMap.get('page')));
            sources.push(this._vebieudoService.getGroupById(route.paramMap.get('group')));
            sources.push(this._vebieudoService.getLstObjectType());
        }

        //sources.push(this._vebieudoService.getNhomDuLieuByAll());

        // Fork join all the sources
        return forkJoin(sources)
            .pipe(
                finalize(() => {

                    // If there is no selected Api, reset the Api every
                    // time Api list changes. This will ensure that the
                    // Api will be reset while navigating between the
                    // folders/filters/labels but it won't reset on page
                    // reload if we are reading a Api.

                    // Try to get the current activated route
                    let currentRoute = route;
                    while (currentRoute.firstChild) {
                        currentRoute = currentRoute.firstChild;
                    }

                    // Make sure there is no 'id' parameter on the current route
                    if (!currentRoute.paramMap.get('id')) {
                        // Reset the Api
                        this._vebieudoService.resetObject().subscribe();
                    }
                }),

                // Error here means the requested page is not available
                catchError((error) => {

                    // Log the error
                    console.error(error.message);

                    // Get the parent url and append the last possible page number to the parent url
                    const url = state.url.split('/').slice(0, -1).join('/') + '/';

                    // Navigate to there
                    this._router.navigateByUrl(url);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}

@Injectable({
    providedIn: 'root'
})
export class VeBieuDoDetailResolver implements Resolve<any>
{
    /**
     * Constructor
     */
    constructor(
        private _vebieudoService: VeBieuDoService,
        private _router: Router
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

        const sources = [];

        // If folder is set on the parameters...
        if (route.paramMap.get('id')) {
            sources.push(this._vebieudoService.getObjectById(route.paramMap.get('id')));
        }

        return forkJoin(sources)
            .pipe(
                // Error here means the requested Api is either
                // not available on the requested page or not
                // available at all
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}
