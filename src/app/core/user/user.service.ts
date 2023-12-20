import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { combineLatest, forkJoin, map, mergeMap, Observable, ReplaySubject, tap } from 'rxjs';
import { User, UserFunctionGrant } from 'app/core/user/user.types';
import { environment } from 'environments/environment';
import { ServiceService } from 'app/shared/service/service.service';
import { ServiceDataResult } from 'app/shared/service/service.types';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _serviceService: ServiceService) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    get(): Observable<User> {
        return combineLatest({
            user: this._serviceService.execServiceLogin("API-1", null),
            grant: this._serviceService.execServiceLogin("API-5", null),
        })
            .pipe(
                map(response => {
                    const user = <ServiceDataResult>response.user;
                    const grant = <ServiceDataResult>response.grant;
                    let userResult: User;
                    let lstGrant: UserFunctionGrant[] = [];
                    if (user.status == 1) {
                        if (grant.status == 1) {
                            grant.data.forEach((obj: any) => {
                                if (obj.FUNCTION_PARENT_ID == null) {
                                    lstGrant.push({
                                        functionId: obj.FUNCTIONID,
                                        functionName: obj.FUNCTIONNAME,
                                        grantDel: obj.R_DELETE,
                                        grantInsert: obj.R_INSERT,
                                        grantUpdate: obj.R_EDIT,
                                        grantExt: null
                                    });

                                }
                            });
                        }
                        userResult = {
                            userId: user.data.USERID, userName: user.data.USERNAME,
                            descript: user.data.DESCRIPT, ORGID: user.data.ORGID, ORGDESC: user.data.ORGDESC, fgrant: lstGrant, roles: null
                        };
                    }

                    this._user.next(userResult);
                    return userResult;
                }));
    }

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
