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
export class ApiInputService extends BaseService implements BaseDetailService {
    selectedObjectChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _lstApiInput: BehaviorSubject<any[]> = new BehaviorSubject(null);
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
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let objectItem = {
                    "USER_CR_ID": userId,
                    "API_SERVICE_INPUT_TYPEID": "STR",
                    "DEFAULT_VALUE_SYSTEM": false,
                    "USER_CR_DTIME": null, "API_SERVICE_INPUTID": uid.stamp(10),
                    "SYS_ACTION": State.create
                };
                objects.push(objectItem);
                this._lstApiInput.next(objects);
                this._object.next(objectItem);
                return objectItem.API_SERVICE_INPUTID;
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let maKetNoi: string = param;
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.API_SERVICE_INPUTID == maKetNoi);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    let API_SERVICE_LST_INPUTID: any = "";
                    if (lstObject[0].API_SERVICE_LST_INPUTID && lstObject[0].API_SERVICE_LST_INPUTID.length > 0) {
                        lstObject[0].API_SERVICE_LST_INPUTID.forEach((obj) => {
                            API_SERVICE_LST_INPUTID = API_SERVICE_LST_INPUTID + obj + ",";
                        })
                        API_SERVICE_LST_INPUTID = API_SERVICE_LST_INPUTID.substring(0, API_SERVICE_LST_INPUTID.length - 1);
                    }
                    return this._serviceService.execServiceLogin("API-84", [
                        { "name": "API_SERVICE_INPUTID", "value": lstObject[0].API_SERVICE_INPUTID },
                        { "name": "API_SERVICE_INPUTNAME", "value": lstObject[0].API_SERVICE_INPUTNAME },
                        { "name": "API_SERVICE_INPUTDESC", "value": lstObject[0].API_SERVICE_INPUTDESC },
                        { "name": "API_SERVICE_INPUT_TYPEID", "value": lstObject[0].API_SERVICE_INPUT_TYPEID },
                        { "name": "DEFAULT_VALUE_SYSTEM", "value": lstObject[0].DEFAULT_VALUE_SYSTEM },
                        { "name": "DEFAULT_VALUE_NAME", "value": lstObject[0].DEFAULT_VALUE_NAME },                        
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

        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.API_SERVICE_INPUTID == serviceId);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    return this._serviceService.execServiceLogin("API-83", [
                        { "name": "API_SERVICE_INPUTNAME", "value": lstObjectAddNew[0].API_SERVICE_INPUTNAME },
                        { "name": "API_SERVICE_INPUTDESC", "value": lstObjectAddNew[0].API_SERVICE_INPUTDESC },
                        { "name": "API_SERVICE_INPUT_TYPEID", "value": lstObjectAddNew[0].API_SERVICE_INPUT_TYPEID },
                        { "name": "DEFAULT_VALUE_SYSTEM", "value": lstObjectAddNew[0].DEFAULT_VALUE_SYSTEM },
                        { "name": "DEFAULT_VALUE_NAME", "value": lstObjectAddNew[0].DEFAULT_VALUE_NAME },                        
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
                    return of(0);
                }
            })
        );

    }
    getObjectfromServer(param: any): Observable<any> {
        return this._serviceService.execServiceLogin("API-81", [{ "name": "API_SERVICE_INPUTID", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.API_SERVICE_INPUTID == serviceId);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-85", [
                        { "name": "API_SERVICE_INPUTID", "value": lstObject[0].API_SERVICE_INPUTID },
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
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                let lstApiDel = objects.filter(item => item.API_SERVICE_INPUTID == param);
                if (lstApiDel.length > 0) {
                    try {
                        objects = objects.filter(item => item.API_SERVICE_INPUTID != param);
                        this._lstApiInput.next(objects);
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
        let API_SERVICE_INPUTID: any = param.API_SERVICE_INPUTID;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects.findIndex(item => item.API_SERVICE_INPUTID === API_SERVICE_INPUTID);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstApiInput.next(objects);
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
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.API_SERVICE_INPUTID === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = null;
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstApiInput.next(objects);
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
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.API_SERVICE_INPUTID === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        objects = objects.filter(item => item.API_SERVICE_INPUTID != param);
                        this._lstApiInput.next(objects);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = objects[itemIndex];
                        data.SYS_ACTION = null;
                        objects[itemIndex] = data;
                        // Update the Api
                        this._object.next(objects[itemIndex]);
                        this._lstApiInput.next(objects);
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
    

    get lstApiInput$(): Observable<any[]> {
        return this._lstApiInput.asObservable();
    }


    get Object$(): Observable<any> {
        return this._object.asObservable();
    }



    getApiInputByAll(): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-79", null).pipe(
            tap((response: any) => {
                this._lstApiInput.next(response.data);
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
    getApiInputBySearch(txtSearch): Observable<any> {

        return this._serviceService.execServiceLogin("API-80", [{ "name": "TEXT_SEARCH", "value": txtSearch }]).pipe(
            tap((response: any) => {
                this._lstApiInput.next(response.data);
                this._object.next(null);
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
        return this._lstApiInput.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.API_SERVICE_INPUTID === id);
                if (itemIndex >= 0) {
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstApiInput.next(objects);
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
        return this._lstApiInput.pipe(
            take(1),
            switchMap((objects: any) => {
                // Find the Api
                const object = objects.find(item => item.API_SERVICE_INPUTID === id) || null;

                if (!object) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (object.SYS_ACTION != State.create && object.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((objectResult) => {
                        return objectResult.data
                    }), switchMap((apiResult) => {
                        return this.getObjectDetailById(id).pipe(map((lstServices) => {
                            let objServices: any[] = [];
                            if (lstServices && lstServices.status == 1 && lstServices.data.length > 0) {
                                lstServices.data.forEach((itemInput: any) => {
                                    objServices.push(itemInput);
                                })
                            }
                            apiResult.LST_SERVICE = objServices;
                            //Cần cập nhật lại list
                            // Update the Api
                            let itemIndex = objects.findIndex(item => item.API_SERVICE_INPUTID === id);
                            if (itemIndex >= 0) {
                                objects[itemIndex] = apiResult;
                                this._object.next(apiResult);
                                this._lstApiInput.next(objects);
                                return apiResult;
                            }

                        }))
                    }));
                }
                this._object.next(object);
                return of(object);
            })
        );
    }
    getObjectDetailById(objectId: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-82", [{ "name": "API_SERVICE_INPUTID", "value": objectId }]);
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
