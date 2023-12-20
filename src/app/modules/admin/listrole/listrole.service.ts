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
export class ListRoleService extends BaseService implements BaseDetailService {
    selectedObjectChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _lstListRole: BehaviorSubject<any[]> = new BehaviorSubject(null);
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
        let userId: string = param.userId;

        const uid = new ShortUniqueId();
        return this._lstListRole.pipe(
            take(1),
            switchMap((objects: any) => {
                return combineLatest([this.getObjectGrantFunctionById(null)]).pipe(
                    map(([lstFunction]) => {
                        let objectItem = {
                            "ENABLE": true,
                            "ROLEORD": 1,
                            "USER_CR_ID": userId,
                            "USER_CR_DTIME": null, "ROLEID": uid.stamp(10),
                            "SYS_ACTION": State.create,
                            "LST_GRANT_FUNCTION": []
                        };
                        objectItem.LST_GRANT_FUNCTION = lstFunction.data;
                        //Cần cập nhật lại list
                        objects.push(objectItem);
                        this._lstListRole.next(objects);
                        this._object.next(objectItem);
                        return objectItem.ROLEID;
                    })
                );
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let ROLEID: string = param.ROLEID;
        let LSTR_VIEW: string[] = param.LSTR_VIEW;
        let LSTR_INSERT: string[] = param.LSTR_INSERT;
        let LSTR_EDIT: string[] = param.LSTR_EDIT;
        let LSTR_DELETE: string[] = param.LSTR_DELETE;
        return this._lstListRole.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.ROLEID == ROLEID);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    let PRAM_LSTR_VIEW: any = "";
                    let PRAM_LSTR_INSERT: any = "";
                    let PRAM_LSTR_EDIT: any = "";
                    let PRAM_LSTR_DELETE: any = "";
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
                    return this._serviceService.execServiceLogin("API-66", [
                        { "name": "ROLEID", "value": lstObject[0].ROLEID },
                        { "name": "ROLECODE", "value": lstObject[0].ROLECODE },
                        { "name": "ROLEDESC", "value": lstObject[0].ROLEDESC },
                        { "name": "ENABLE", "value": lstObject[0].ENABLE },
                        { "name": "ROLEORD", "value": lstObject[0].ROLEORD },
                        { "name": "LSTR_VIEW", "value": PRAM_LSTR_VIEW },
                        { "name": "LSTR_INSERT", "value": PRAM_LSTR_INSERT },
                        { "name": "LSTR_EDIT", "value": PRAM_LSTR_EDIT },
                        { "name": "LSTR_DELETE", "value": PRAM_LSTR_DELETE },
                        { "name": "USER_MDF_ID", "value": lstObject[0].USER_MDF_ID }
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
    createObjectToServer(param: any): Observable<any> {
        let ROLEID: string = param.ROLEID;
        let LSTR_VIEW: string[] = param.LSTR_VIEW;
        let LSTR_INSERT: string[] = param.LSTR_INSERT;
        let LSTR_EDIT: string[] = param.LSTR_EDIT;
        let LSTR_DELETE: string[] = param.LSTR_DELETE;

        return this._lstListRole.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.ROLEID == ROLEID);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    let PRAM_LSTR_VIEW: any = "";
                    let PRAM_LSTR_INSERT: any = "";
                    let PRAM_LSTR_EDIT: any = "";
                    let PRAM_LSTR_DELETE: any = "";
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
                    return this._serviceService.execServiceLogin("API-65", [
                        { "name": "ROLECODE", "value": lstObjectAddNew[0].ROLECODE },
                        { "name": "ROLEDESC", "value": lstObjectAddNew[0].ROLEDESC },
                        { "name": "ENABLE", "value": lstObjectAddNew[0].ENABLE },
                        { "name": "ROLEORD", "value": lstObjectAddNew[0].ROLEORD },
                        { "name": "LSTR_VIEW", "value": PRAM_LSTR_VIEW },
                        { "name": "LSTR_INSERT", "value": PRAM_LSTR_INSERT },
                        { "name": "LSTR_EDIT", "value": PRAM_LSTR_EDIT },
                        { "name": "LSTR_DELETE", "value": PRAM_LSTR_DELETE },
                        { "name": "USER_CR_ID", "value": lstObjectAddNew[0].USER_CR_ID }
                    ]).pipe(map((response: any) => {

                        if (response.status == 1) {
                            return response.data;
                        } else {
                            return 0;
                        }
                    }));
                } else {
                    this._object.next(null);
                    return 0;
                }
            })
        );

    }
    getObjectfromServer(param: any): Observable<any> {
        return this._serviceService.execServiceLogin("API-64", [{ "name": "ROLEID", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._lstListRole.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.ROLEID == serviceId);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-67", [
                        { "name": "ROLEID", "value": lstObject[0].ROLEID },
                        { "name": "USER_MDF_ID", "value": lstObject[0].USER_MDF_ID }
                    ]).pipe(map((response: any) => {
                        if (response.status == 1) {
                            return response.data;
                        } else {
                            return 0;
                        }
                    }));
                } else {
                    this._object.next(null);
                    return 0;
                }
            })
        );
    }
    deleteObject(param: any): Observable<any> {
        return this._lstListRole.pipe(
            take(1),
            map((objects) => {
                let lstApiDel = objects.filter(item => item.ROLEID == param);
                if (lstApiDel.length > 0) {
                    try {
                        objects = objects.filter(item => item.ROLEID != param);
                        this._lstListRole.next(objects);
                        this._object.next(null);
                        return 1;
                    } catch {
                        return -1;
                    }
                } else {
                    this._object.next(null);
                    return 0;
                }
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    editObject(param: any): Observable<any> {
        let ROLEID: any = param.ROLEID;
        let USER_MDF_ID: any = param.USER_MDF_ID;

        return this._lstListRole.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects.findIndex(item => item.ROLEID === ROLEID);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstListRole.next(objects);
                    // Return the Api
                    return 1;
                } else {
                    this._object.next(null);
                    return 0;
                }
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    viewObject(param: any): Observable<any> {
        return this._lstListRole.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.ROLEID === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = null;
                    objects[itemIndex] = data;

                    this._object.next(objects[itemIndex]);
                    this._lstListRole.next(objects);
                    return data;

                } else {
                    this._object.next(null);
                    return null;
                }
            }),
            switchMap((obj) => {
                return of(obj);
            })
        );
    }
    cancelObject(param: any): Observable<any> {
        return this._lstListRole.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.ROLEID === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        objects = objects.filter(item => item.ROLEID != param);
                        this._lstListRole.next(objects);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = objects[itemIndex];
                        data.SYS_ACTION = null;
                        objects[itemIndex] = data;
                        // Update the Api
                        this._object.next(objects[itemIndex]);
                        this._lstListRole.next(objects);
                        return 1;
                    };

                } else {
                    this._object.next(null);
                    return 0;
                }
            }),
            switchMap((object) => {
                return of(object);
            })
        );
    }


    get lstListRole$(): Observable<any[]> {
        return this._lstListRole.asObservable();
    }


    get Object$(): Observable<any> {
        return this._object.asObservable();
    }



    getListRoleByAll(): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-63", null).pipe(
            tap((response: any) => {
                this._lstListRole.next(response.data);
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

    updateObjectById(id: string, data: any): Observable<any> {
        return this._lstListRole.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.ROLEID === id);
                if (itemIndex >= 0) {
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstListRole.next(objects);
                    // Return the Api
                    return objects[itemIndex];
                } else {
                    this._object.next(null);
                    return null;
                }
            }),
            switchMap((objects) => {
                if (!objects) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }

                return of(objects);
            })
        );
    }
    getObjectById(id: string): Observable<any> {
        return this._lstListRole.pipe(
            take(1),
            switchMap((objs: any) => {
                // Find the Api
                const obj = objs.find(item => item.ROLEID === id) || null;

                if (!obj) {
                    return throwError('Could not found with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (obj.SYS_ACTION != State.create && obj.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((objResult) => {

                        return objResult.data
                    }), switchMap((objResult) => {
                        return combineLatest([this.getObjectGrantFunctionById(id)]).pipe(
                            map(([lstFunction]) => {
                                objResult.LST_GRANT_FUNCTION = lstFunction.data;
                                //Cần cập nhật lại list
                                let itemIndex = objs.findIndex(item => item.ROLEID === id);
                                if (itemIndex >= 0) {
                                    objs[itemIndex] = objResult;
                                    this._object.next(objResult);
                                    this._lstListRole.next(objs);
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
        return this._serviceService.execServiceLogin("API-68", [{ "name": "ROLEID", "value": objectId }]).pipe(
            tap((response: any) => {
                this._objectGrant.next(response.data);

            })
        );
    }
    resetObject(): Observable<boolean> {
        return of(true).pipe(
            take(1),
            tap(() => {
                this._object.next(null);
            })
        );
    }


}
