import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ServiceService } from 'app/shared/service/service.service';
import ShortUniqueId from 'short-unique-id';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailService } from 'app/shared/commons/BaseDetail.service';
import { BaseService } from 'app/shared/commons/base.service';

@Injectable({
    providedIn: 'root'
})
export class ListUserService extends BaseService implements BaseDetailService {
    selectedApiChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _objects: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _objectColumns: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any> = new BehaviorSubject(null);
    private _lstObjectTITLE: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstObjectOffice: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstObjectlistDomain: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _groups: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _group: BehaviorSubject<any> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(
        public _serviceService: ServiceService) {
        super(_serviceService);
    }

    _object: BehaviorSubject<any> = new BehaviorSubject(null);


    createObject(param: any): Observable<any> {
        let groupid: string = param.groupid;
        let userId: string = param.userId;

        const uid = new ShortUniqueId();
        return this._objects.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let objItem = {
                    "USER_CR_ID": userId, "USERNAME": "", "DESCRIPT": "", "ORGID": groupid, "ENABLE": true,
                    "USER_CR_DTIME": null, "USERID_KEY": uid.stamp(10),
                    "SYS_ACTION": State.create
                };
                objects.push(objItem);
                this._objects.next(objects);
                this._object.next(objItem);
                return objItem.USERID_KEY;
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let userId: string = param;
        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstobjects = objects.filter(item => item.USERID_KEY == userId);
                return lstobjects;
            }),
            switchMap((lstobjects: any) => {
                if (lstobjects.length > 0) {
                    let LST_TITLEID: any = "";
                    if (lstobjects[0].LST_TITLE && lstobjects[0].LST_TITLE.length > 0) {
                        lstobjects[0].LST_TITLE.forEach((obj) => {
                            LST_TITLEID = LST_TITLEID + obj + ",";
                        })
                        LST_TITLEID = LST_TITLEID.substring(0, LST_TITLEID.length - 1);
                    }
                    return this._serviceService.execServiceLogin("API-48", [
                        { "name": "xUSERID", "value": lstobjects[0].USERID },
                        { "name": "ORGID", "value": lstobjects[0].ORGID },
                        { "name": "USERNAME", "value": lstobjects[0].USERNAME },
                        { "name": "PASSWORD", "value": lstobjects[0].PASSWORD },
                        { "name": "DESCRIPT", "value": lstobjects[0].DESCRIPT },
                        { "name": "MOBILE", "value": lstobjects[0].MOBILE },
                        { "name": "EMAIL", "value": lstobjects[0].EMAIL },
                        { "name": "OFFICEID", "value": lstobjects[0].OFFICEID },
                        { "name": "USERID_DOMAIN", "value": lstobjects[0].USERID_DOMAIN },
                        { "name": "DOMAINID", "value": lstobjects[0].DOMAINID },
                        { "name": "ENABLE", "value": lstobjects[0].ENABLE },
                        { "name": "LST_TITLE", "value": LST_TITLEID },
                        { "name": "USER_MDF_ID", "value": lstobjects[0].USER_MDF_ID }
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
        let objectId: string = param;

        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.USERID_KEY == objectId);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    let LST_TITLEID: any = "";
                    if (lstObjectAddNew[0].LST_TITLE && lstObjectAddNew[0].LST_TITLE.length > 0) {
                        lstObjectAddNew[0].LST_TITLE.forEach((obj) => {
                            LST_TITLEID = LST_TITLEID + obj + ",";
                        })
                        LST_TITLEID = LST_TITLEID.substring(0, LST_TITLEID.length - 1);
                    }
                    return this._serviceService.execServiceLogin("API-47", [
                        { "name": "xUSERID", "value": lstObjectAddNew[0].USERID },
                        { "name": "ORGID", "value": lstObjectAddNew[0].ORGID },
                        { "name": "USERNAME", "value": lstObjectAddNew[0].USERNAME },
                        { "name": "PASSWORD", "value": lstObjectAddNew[0].PASSWORD },
                        { "name": "DESCRIPT", "value": lstObjectAddNew[0].DESCRIPT },
                        { "name": "MOBILE", "value": lstObjectAddNew[0].MOBILE },
                        { "name": "EMAIL", "value": lstObjectAddNew[0].EMAIL },
                        { "name": "OFFICEID", "value": lstObjectAddNew[0].OFFICEID },
                        { "name": "USERID_DOMAIN", "value": lstObjectAddNew[0].USERID_DOMAIN },
                        { "name": "DOMAINID", "value": lstObjectAddNew[0].DOMAINID },
                        { "name": "ENABLE", "value": lstObjectAddNew[0].ENABLE },
                        { "name": "LST_TITLE", "value": LST_TITLEID },
                        { "name": "USER_CR_ID", "value": lstObjectAddNew[0].USER_CR_ID }
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
                    return this._serviceService.execServiceLogin("API-49", [
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


    get ObjectListTITLE$(): Observable<any[]> {
        return this._lstObjectTITLE.asObservable();
    }

    get ObjectListOffice$(): Observable<any[]> {
        return this._lstObjectOffice.asObservable();
    }

    get ObjectListDomain$(): Observable<any[]> {
        return this._lstObjectlistDomain.asObservable();
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


    getLstTITLE(): Observable<any> {
        return this._serviceService.execServiceLogin("API-44", null).pipe(
            tap((response: any) => {
                this._lstObjectTITLE.next(response.data);
            })
        );
    }

    getLstOffice(): Observable<any> {
        return this._serviceService.execServiceLogin("API-45", null).pipe(
            tap((response: any) => {
                this._lstObjectOffice.next(response.data);
            })
        );
    }

    getLstDomain(): Observable<any> {
        return this._serviceService.execServiceLogin("API-46", null).pipe(
            tap((response: any) => {
                this._lstObjectlistDomain.next(response.data);
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
                        return this.getObjectTitleById(id).pipe(map((lstTitle) => {
                            let objTitle: any[] = [];
                            let objTitleDesc: any[] = [];
                            if (lstTitle && lstTitle.status == 1 && lstTitle.data.length > 0) {
                                lstTitle.data.forEach((obj: any) => {
                                    objTitle.push(obj.TITLEID);
                                    objTitleDesc.push(obj);
                                })
                            }

                            objResult.LST_TITLE = objTitle;
                            objResult.LST_TITLE_DESC = objTitleDesc;
                            //Cần cập nhật lại list
                            // Update the Api
                            let itemIndex = objs.findIndex(item => item.USERID_KEY === id);
                            if (itemIndex >= 0) {
                                objs[itemIndex] = objResult;
                                this._object.next(objResult);
                                this._objects.next(objs);
                                return objResult;
                            }

                        }))
                    }));
                }
                this._object.next(obj);
                return of(obj);
            })
        );
    }
    getObjectTitleById(objectId: string): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-43", [{ "name": "xUSERID", "value": objectId }]).pipe(
            tap((response: any) => {
                this._objectColumns.next(response.data);

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
