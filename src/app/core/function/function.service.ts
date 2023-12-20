import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, ReplaySubject, switchMap, take, throwError } from 'rxjs';
import { ServiceService } from 'app/shared/service/service.service';

@Injectable({
    providedIn: 'root'
})
export class FunctionService {
    private _function: any = {};
    private _isView: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    private _isInsert: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    private _isEdit: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    private _isDelete: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
    /**
     * Constructor
     */
    constructor(
        private _serviceService: ServiceService
    ) {
    }
    get isView$(): Observable<any> {
        return this._isView.asObservable();
    }
    get isInsert$(): Observable<any> {
        return this._isInsert.asObservable();
    }
    get isEdit$(): Observable<any> {
        return this._isEdit.asObservable();
    }
    get isDelete$(): Observable<any> {
        return this._isDelete.asObservable();
    }
    get(url: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-17", [{ "name": "URL_FUNCTION", "value": url }])
            .pipe(take(1),
                map((response: any) => {
                    if (response.status == 1) {
                        this._function = (response.data);
                        return response.data;
                    } else {
                        this._function = {};
                        return null;
                    }
                }), switchMap((_function: any) => {
                    if (_function && _function?.FUNCTIONID) {
                        return this._serviceService.execServiceLogin("API-18", [{ "name": "FUNCTIONID", "value": _function.FUNCTIONID }])
                            .pipe(take(1),
                                map((response: any) => {
                                    if (response.status == 1) {
                                        this._isView.next(true);
                                        this._isInsert.next(response.data.R_INSERT);
                                        this._isEdit.next(response.data.R_EDIT);
                                        this._isDelete.next(response.data.R_DELETE);
                                        return _function;
                                    } else {
                                        this._isView.next(false);
                                        this._isInsert.next(false);
                                        this._isEdit.next(false);
                                        this._isDelete.next(false);
                                        return _function;
                                    }
                                }));
                    } else {
                        this._function = {};
                        this._isView.next(false);
                        this._isInsert.next(false);
                        this._isEdit.next(false);
                        this._isDelete.next(false);
                    }
                }));
    }
    isView(): Observable<boolean> {
        if (this._function) {
            return this._serviceService.execServiceLogin("API-18", [{ "name": "FUNCTIONID", "value": this._function.FUNCTIONID }])
                .pipe(take(1),
                    map((response: any) => {
                        if (response.status == 1) {
                            this._isView.next(true);
                            return true;
                        } else {
                            return false;
                        }
                    }));
        } else {
            return of(false)
        }
    }
    isEdit(): Observable<boolean> {
        if (this._function) {
            return this._serviceService.execServiceLogin("API-18", [{ "name": "FUNCTIONID", "value": this._function.FUNCTIONID }])
                .pipe(take(1),
                    map((response: any) => {
                        if (response.status == 1) {
                            this._isEdit.next(response.data.R_EDIT);
                            return response.data.R_EDIT;
                        } else {
                            return false;
                        }
                    }));
        } else {
            return of(false)
        }
    }
    isInsert(): Observable<boolean> {
        if (this._function) {
            return this._serviceService.execServiceLogin("API-18", [{ "name": "FUNCTIONID", "value": this._function.FUNCTIONID }])
                .pipe(take(1),
                    map((response: any) => {
                        if (response.status == 1) {
                            this._isInsert.next(response.data.R_INSERT);
                            return response.data.R_INSERT;
                        } else {
                            return false;
                        }
                    }));
        } else {
            return of(false)
        }
    }
    isDelete(): Observable<boolean> {
        if (this._function) {
            return this._serviceService.execServiceLogin("API-18", [{ "name": "FUNCTIONID", "value": this._function.FUNCTIONID }])
                .pipe(take(1),
                    map((response: any) => {
                        if (response.status == 1) {
                            this._isDelete.next(response.data.R_DELETE);
                            return response.data.R_DELETE;
                        } else {
                            return false;
                        }
                    }));
        } else {
            return of(false)
        }
    }
}
