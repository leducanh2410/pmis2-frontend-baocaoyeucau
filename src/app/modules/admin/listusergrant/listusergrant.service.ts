import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ServiceService } from 'app/shared/service/service.service';
import ShortUniqueId from 'short-unique-id';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailService } from 'app/shared/commons/BaseDetail.service';
import { BaseService } from 'app/shared/commons/base.service';

@Injectable({
    providedIn: 'root'
})
export class ListUserGrantService extends BaseService implements BaseDetailService {
    selectedApiChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _objects: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any> = new BehaviorSubject(null);
    private _groups: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _group: BehaviorSubject<any> = new BehaviorSubject(null);
    private _objectGrant: BehaviorSubject<any[]> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(
        public _serviceService: ServiceService) {
        super(_serviceService);
    }

    _object: BehaviorSubject<any> = new BehaviorSubject(null);


    createObject(param: any): Observable<any> {
        return of(0);

    }
    editObjectToServer(param: any): Observable<any> {
        let USERID: string = param.USERID;
        let LSTR_VIEW: string[] = param.LSTR_VIEW;
        let LSTR_INSERT: string[] = param.LSTR_INSERT;
        let LSTR_EDIT: string[] = param.LSTR_EDIT;
        let LSTR_DELETE: string[] = param.LSTR_DELETE;
        let LST_ROLE: string[] = param.LST_ROLE;

        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstobjects = objects.filter(item => item.USERID_KEY == USERID);
                return lstobjects;
            }),
            switchMap((lstobjects: any) => {
                if (lstobjects.length > 0) {
                    let PRAM_LSTR_VIEW: any = "";
                    let PRAM_LSTR_INSERT: any = "";
                    let PRAM_LSTR_EDIT: any = "";
                    let PRAM_LSTR_DELETE: any = "";
                    let PRAM_LST_ROLE: any = "";
                    if (LSTR_VIEW && LSTR_VIEW.length > 0) {
                        LSTR_VIEW.forEach((obj) => {
                            PRAM_LSTR_VIEW = PRAM_LSTR_VIEW + obj + ",";
                        })
                        PRAM_LSTR_VIEW = PRAM_LSTR_VIEW.substring(0, PRAM_LSTR_VIEW.length - 1);
                    }
                    if (LSTR_INSERT && LSTR_INSERT.length > 0) {
                        LSTR_INSERT.forEach((obj) => {
                            PRAM_LSTR_INSERT = PRAM_LSTR_INSERT + obj + ",";
                        })
                        PRAM_LSTR_INSERT = PRAM_LSTR_INSERT.substring(0, PRAM_LSTR_INSERT.length - 1);
                    }
                    if (LSTR_EDIT && LSTR_EDIT.length > 0) {
                        LSTR_EDIT.forEach((obj) => {
                            PRAM_LSTR_EDIT = PRAM_LSTR_EDIT + obj + ",";
                        })
                        PRAM_LSTR_EDIT = PRAM_LSTR_EDIT.substring(0, PRAM_LSTR_EDIT.length - 1);
                    }
                    if (LSTR_DELETE && LSTR_DELETE.length > 0) {
                        LSTR_DELETE.forEach((obj) => {
                            PRAM_LSTR_DELETE = PRAM_LSTR_DELETE + obj + ",";
                        })
                        PRAM_LSTR_DELETE = PRAM_LSTR_DELETE.substring(0, PRAM_LSTR_DELETE.length - 1);
                    }
                    if (LST_ROLE && LST_ROLE.length > 0) {
                        LST_ROLE.forEach((obj) => {
                            PRAM_LST_ROLE = PRAM_LST_ROLE + obj + ",";
                        })
                        PRAM_LST_ROLE = PRAM_LST_ROLE.substring(0, PRAM_LST_ROLE.length - 1);
                    }

                    return this._serviceService.execServiceLogin("API-61", [
                        { "name": "xUSERID", "value": lstobjects[0].USERID },
                        { "name": "LSTR_VIEW", "value": PRAM_LSTR_VIEW },
                        { "name": "LSTR_INSERT", "value": PRAM_LSTR_INSERT },
                        { "name": "LSTR_EDIT", "value": PRAM_LSTR_EDIT },
                        { "name": "LSTR_DELETE", "value": PRAM_LSTR_DELETE },
                        { "name": "LST_ROLE", "value": PRAM_LST_ROLE },
                        { "name": "USER_MDF_ID", "value": USERID }
                    ]).pipe(map((response: any) => {
                        if (response.status == 1) {
                            return response.data;
                        } else {
                            return 0;
                        }
                    }));

                } else {
                    return of(0);
                }
            })
        );
    }
    createObjectToServer(param: any): Observable<any> {
        return of(0)

    }
    getObjectfromServer(param: any): Observable<any> {
        return this._serviceService.execServiceLogin("API-42", [{ "name": "xUSERID", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let userId: string = param;
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                let lstApi = Apis.filter(item => item.USERID_KEY == userId);
                return lstApi;
            }),
            switchMap((lstApi: any) => {
                if (lstApi.length > 0) {
                    return this._serviceService.execServiceLogin("API-62", [
                        { "name": "xUSERID", "value": lstApi[0].USERID_KEY },
                        { "name": "USER_MDF_ID", "value": lstApi[0].USER_MDF_ID }
                    ]).pipe(map((response: any) => {
                        if (response.status == 1) {
                            return response.data;
                        } else {
                            return 0;
                        }
                    }));
                } else {

                    return 0;
                }
            })
        );
    }
    deleteObject(param: any): Observable<any> {
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                let lstApiDel = Apis.filter(item => item.USERID_KEY == param);
                if (lstApiDel.length > 0) {
                    try {
                        Apis = Apis.filter(item => item.USERID_KEY != param);
                        this._objects.next(Apis);
                        this._object.next(null);
                        return 1;
                    } catch {
                        return -1;
                    }
                } else {
                    return 0;
                }
            }),
            switchMap((Apis) => {
                return of(Apis);
            })
        );

    }
    editObject(param: any): Observable<any> {
        let USERID: any = param.USERID;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                // Find the Api
                let itemIndex = Apis.findIndex(item => item.USERID_KEY === USERID);
                if (itemIndex >= 0) {
                    let data = Apis[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    Apis[itemIndex] = data;
                    // Update the Api
                    this._object.next(Apis[itemIndex]);
                    this._objects.next(Apis);
                    // Return the Api
                    return 1;
                } else {
                    return 0;
                }
            }),
            switchMap((Apis) => {
                return of(Apis);
            })
        );

    }
    viewObject(param: any): Observable<any> {
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                let itemIndex = Apis.findIndex(item => item.USERID_KEY === param);
                if (itemIndex >= 0) {
                    let data = Apis[itemIndex];
                    data.SYS_ACTION = null;
                    Apis[itemIndex] = data;
                    // Update the Api
                    this._object.next(Apis[itemIndex]);
                    this._objects.next(Apis);
                    return data;

                } else {
                    return null;
                }
            }),
            switchMap((obj) => {
                return of(obj);
            })
        );
    }
    cancelObject(param: any): Observable<any> {
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                let itemIndex = Apis.findIndex(item => item.USERID_KEY === param);
                if (itemIndex >= 0) {
                    let data = Apis[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        Apis = Apis.filter(item => item.USERID_KEY != param);
                        this._objects.next(Apis);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = Apis[itemIndex];
                        data.SYS_ACTION = null;
                        Apis[itemIndex] = data;
                        // Update the Api
                        this._object.next(Apis[itemIndex]);
                        this._objects.next(Apis);
                        return 1;
                    };

                } else {
                    return null;
                }
            }),
            switchMap((result) => {
                return of(result);
            })
        );
    }

    get groups$(): Observable<any[]> {
        return this._groups.asObservable();
    }

    get group$(): Observable<any> {
        return this._group.asObservable();
    }


    get objects$(): Observable<any[]> {
        return this._objects.asObservable();
    }


    get Object$(): Observable<any> {
        return this._object.asObservable();
    }




    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get folders
     */
    getGroups(): Observable<any> {
        return this._serviceService.execServiceLogin("API-40", [{ "name": "USERID", "value": null }]).pipe(
            tap((response: any) => {
                this._groups.next(response.data);
            })
        );
    }

    /**
     * Get Apis by filter
     */
    getApisByFilter(filter: string, page: string = '1'): Observable<any> {
        // Execute the Apis loading with true


        return of(false);
    }

    /**
     * Get Apis by folder
     */
    getObjectsByFolder(groupid: string, page: string = '1'): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-41", [{ "name": "ORGID", "value": groupid }]).pipe(
            tap((response: any) => {
                this._objects.next(response.data);
                //this._pagination.next(response.pagination);

            }),
            switchMap((response: any) => {

                if (!response.status) {
                    return throwError({
                        message: 'Requested page is not available!',
                        pagination: response.pagination
                    });
                }

                return of(response);
            })
        );
    }

    /**
     * Get Api by id
     */
    updateApiById(id: string, data: any): Observable<any> {
        return this._objects.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.USERID_KEY === id);
                objects[itemIndex] = data;
                // Update the Api
                this._object.next(objects[itemIndex]);
                this._objects.next(objects);
                // Return the Api
                return objects[itemIndex];
            }),
            switchMap((object) => {
                if (!object) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }

                return of(object);
            })
        );
    }
    getObjectById(id: string): Observable<any> {
        return this._objects.pipe(
            take(1),
            switchMap((objs: any) => {
                // Find the Api
                const obj = objs.find(item => item.USERID_KEY === id) || null;

                if (!obj) {
                    return throwError('Could not found with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (obj.SYS_ACTION != State.create && obj.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((objResult) => {

                        return objResult.data
                    }), switchMap((objResult) => {
                        return combineLatest([this.getObjectGrantFunctionById(id), this.getObjectGrantRoleById(id)]).pipe(
                            map(([lstFunction, lstRole]) => {
                                objResult.LST_GRANT_FUNCTION = lstFunction.data;
                                objResult.LST_GRANT_ROLE = lstRole.data;
                                //Cần cập nhật lại list
                                let itemIndex = objs.findIndex(item => item.USERID_KEY === id);
                                if (itemIndex >= 0) {
                                    objs[itemIndex] = objResult;
                                    this._object.next(objResult);
                                    this._objects.next(objs);
                                    return of(objResult);
                                } else {
                                    this._object.next(obj);
                                    return of(obj);
                                }
                            })
                        );
                    }));
                }
                this._object.next(obj);
                return of(obj);
            })
        );
    }
    getObjectGrantFunctionById(objectId: string): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-59", [{ "name": "xUSERID", "value": objectId }]).pipe(
            tap((response: any) => {
                this._objectGrant.next(response.data);

            })
        );
    }
    getObjectGrantRoleById(objectId: string): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-60", [{ "name": "xUSERID", "value": objectId }]).pipe(
            tap((response: any) => {
                this._objectGrant.next(response.data);

            })
        );
    }
    getGroupById(groupid: string): Observable<any> {
        return this._groups.pipe(
            take(1),
            map((groups) => {

                // Find the Group
                const group = groups.find(item => item.ORGID === groupid) || null;

                // Update the Group
                this._group.next(group);

                // Return the Group
                return group;
            }),
            switchMap((group) => {
                return of(group);
            })
        );
    }
    /**
     * Reset the current Api
     */
    resetObject(): Observable<boolean> {
        return of(true).pipe(
            take(1),
            tap(() => {
                this._object.next(null);
            })
        );
    }


}
