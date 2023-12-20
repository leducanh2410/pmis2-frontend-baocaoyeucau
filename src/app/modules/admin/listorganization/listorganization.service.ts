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
export class OrganizationService extends BaseService implements BaseDetailService {
    selectedObjectChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _lstOrganization: BehaviorSubject<any[]> = new BehaviorSubject(null);
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
        let maNhomCha: string = param.maNhomCha;
        const uid = new ShortUniqueId();
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let objectItem = {
                    "USER_CR_ID": userId,
                    "ENABLE": true,
                    "ORGID_PARENT": maNhomCha,
                    "USER_CR_DTIME": null, "ORGID": uid.stamp(10),
                    "SYS_ACTION": State.create
                };
                objects.push(objectItem);
                this._lstOrganization.next(objects);
                this._object.next(objectItem);
                return objectItem.ORGID;
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let maKetNoi: string = param;
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.ORGID == maKetNoi);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-73", [
                        { "name": "xORGID", "value": lstObject[0].ORGID },
                        { "name": "ORGCODE", "value": lstObject[0].ORGCODE },
                        { "name": "ORGDESC", "value": lstObject[0].ORGDESC },
                        { "name": "ENABLE", "value": lstObject[0].ENABLE },
                        { "name": "ORGORD", "value": lstObject[0].ORGORD },
                        { "name": "ORGID_PARENT", "value": lstObject[0].ORGID_PARENT },
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
        let serviceId: string = param;

        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.ORGID == serviceId);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    return this._serviceService.execServiceLogin("API-71", [
                        { "name": "ORGCODE", "value": lstObjectAddNew[0].ORGCODE },
                        { "name": "ORGDESC", "value": lstObjectAddNew[0].ORGDESC },
                        { "name": "ENABLE", "value": lstObjectAddNew[0].ENABLE },
                        { "name": "ORGORD", "value": lstObjectAddNew[0].ORGORD },
                        { "name": "ORGID_PARENT", "value": lstObjectAddNew[0].ORGID_PARENT },
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
        return this._serviceService.execServiceLogin("API-70", [{ "name": "xORGID", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let objId: string = param;
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.ORGID == objId);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-72", [
                        { "name": "xORGID", "value": lstObject[0].ORGID },
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
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                let lstApiDel = objects.filter(item => item.ORGID == param);
                if (lstApiDel.length > 0) {
                    try {
                        objects = objects.filter(item => item.ORGID != param);
                        this._lstOrganization.next(objects);
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
        let ORGID: any = param.ORGID;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects.findIndex(item => item.ORGID === ORGID);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstOrganization.next(objects);
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
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.ORGID === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = null;
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstOrganization.next(objects);
                    return data;

                } else {
                    this._object.next(null);
                    return null;
                }
            }),
            switchMap((Api) => {
                return of(Api);
            })
        );
    }
    cancelObject(param: any): Observable<any> {
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.ORGID === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        objects = objects.filter(item => item.ORGID != param);
                        this._lstOrganization.next(objects);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = objects[itemIndex];
                        data.SYS_ACTION = null;
                        objects[itemIndex] = data;
                        // Update the Api
                        this._object.next(objects[itemIndex]);
                        this._lstOrganization.next(objects);
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




    get lstOrganization$(): Observable<any[]> {
        return this._lstOrganization.asObservable();
    }


    get Object$(): Observable<any> {
        return this._object.asObservable();
    }



    getOrganizationByAll(): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-40", [{ "name": "USERID", "value": null }]).pipe(
            tap((response: any) => {
                this._lstOrganization.next(response.data);
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
        return this._lstOrganization.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.ORGID === id);
                if (itemIndex >= 0) {
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstOrganization.next(objects);
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
        return this._lstOrganization.pipe(
            take(1),
            switchMap((objects: any) => {
                // Find the Api
                const object = objects.find(item => item.ORGID === id) || null;

                if (!object) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (object.SYS_ACTION != State.create && object.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((objectResult) => {
                        let itemIndex = objects.findIndex(item => item.ORGID === id);
                        if (itemIndex >= 0) {
                            objects[itemIndex] = objectResult.data;
                            this._object.next(objectResult.data);
                            this._lstOrganization.next(objects);
                            return objectResult;
                        }
                        return objectResult.data
                    }));
                }
                this._object.next(object);
                return of(object);
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
