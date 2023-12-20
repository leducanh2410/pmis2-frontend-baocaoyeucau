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
export class ListFunctionService extends BaseService implements BaseDetailService {
    selectedObjectChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _lstListFunction: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _objectServices: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstService: BehaviorSubject<any[]> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(
        public _serviceService: ServiceService) {
        super(_serviceService);
    }

    _object: BehaviorSubject<any> = new BehaviorSubject(null);

    get LstService$(): Observable<any[]> {
        return this._lstService.asObservable();
    }
    getLstService(): Observable<any> {
        return this._serviceService.execServiceLogin("API-56", null).pipe(
            tap((response: any) => {
                this._lstService.next(response.data);
            })
        );
    }
    createObject(param: any): Observable<any> {
        let userId: string = param.userId;
        let maNhomCha: string = param.maNhomCha;
        const uid = new ShortUniqueId();
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let objectItem = {
                    "FUNCTIONID_KEY": uid.stamp(10),
                    "USER_CR_ID": userId,
                    "ICON": "heroicons_solid:cog",
                    "FUNCTION_EXTERNAL": false,
                    "FUNCTION_EXTERNAL_TARGET": '',
                    "LINK": '',
                    "FUNCTION_TYPE": 'basic',
                    "ENABLE": true,
                    "ISPUPLIC": false,
                    "FUNCTIONORD": 0,
                    "AUTH_LOCAL": true,
                    "AUTH_INTERNET": true,
                    "APPID": "WEB",
                    "FUNCTION_PARENT_ID": maNhomCha,
                    "LST_SERVICE": [],
                    "SYS_ACTION": State.create
                };
                objects.push(objectItem);
                this._lstListFunction.next(objects);
                this._object.next(objectItem);
                return objectItem.FUNCTIONID_KEY;
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let id: string = param;
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.FUNCTIONID_KEY == id);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    const sources = [];
                    let LST_SERVICE: any = "";
                    if (lstObject[0].LST_SERVICE && lstObject[0].LST_SERVICE.length > 0) {
                        lstObject[0].LST_SERVICE.forEach((obj) => {
                            LST_SERVICE = LST_SERVICE + obj.API_SERVICEID + ",";
                        })
                        LST_SERVICE = LST_SERVICE.substring(0, LST_SERVICE.length - 1);
                    }
                    sources.push(this._serviceService.execServiceLogin("API-53", [
                        { "name": "FUNCTIONID", "value": lstObject[0].FUNCTIONID },
                        { "name": "FUNCTIONNAME", "value": lstObject[0].FUNCTIONNAME },
                        { "name": "FUNCTIONNAME_SUB", "value": lstObject[0].FUNCTIONNAME_SUB },
                        { "name": "FUNCTION_TYPE", "value": lstObject[0].FUNCTION_TYPE },
                        { "name": "LINK", "value": lstObject[0].LINK },
                        { "name": "ICON", "value": lstObject[0].ICON },
                        { "name": "FUNCTION_EXTERNAL", "value": lstObject[0].FUNCTION_EXTERNAL },
                        { "name": "FUNCTION_EXTERNAL_TARGET", "value": lstObject[0].FUNCTION_EXTERNAL_TARGET },
                        { "name": "FUNCTION_PARENT_ID", "value": lstObject[0].FUNCTION_PARENT_ID },
                        { "name": "ENABLE", "value": lstObject[0].ENABLE },
                        { "name": "ISPUPLIC", "value": lstObject[0].ISPUPLIC },
                        { "name": "FUNCTIONORD", "value": lstObject[0].FUNCTIONORD },
                        { "name": "AUTH_LOCAL", "value": lstObject[0].AUTH_LOCAL },
                        { "name": "AUTH_INTERNET", "value": lstObject[0].AUTH_INTERNET },
                        { "name": "APPID", "value": lstObject[0].APPID },
                        { "name": "LST_SERVICEID", "value": LST_SERVICE },
                        { "name": "USER_MDF_ID", "value": lstObject[0].USER_MDF_ID }
                    ]));
                    if (lstObject[0].LST_SERVICE && lstObject[0].LST_SERVICE.length > 0) {
                        lstObject[0].LST_SERVICE.forEach((objService: any) => {
                            if (objService?.SYS_ACTION == State.edit) {
                                sources.push(this._serviceService.execServiceLogin('API-58', [
                                    { "name": "FUNCTIONID", "value": lstObject[0].FUNCTIONID },
                                    { "name": "API_SERVICEID", "value": objService.API_SERVICEID },
                                    { "name": "R_INSERT", "value": objService.R_INSERT },
                                    { "name": "R_EDIT", "value": objService.R_EDIT },
                                    { "name": "R_DELETE", "value": objService.R_DELETE },
                                    { "name": "USER_MDF_ID", "value": lstObject[0].USER_MDF_ID }
                                ]))
                            };
                            if (objService?.SYS_ACTION == State.create) {
                                sources.push(this._serviceService.execServiceLogin('API-57', [
                                    { "name": "FUNCTIONID", "value": lstObject[0].FUNCTIONID },
                                    { "name": "API_SERVICEID", "value": objService.API_SERVICEID },
                                    { "name": "R_INSERT", "value": objService.R_INSERT },
                                    { "name": "R_EDIT", "value": objService.R_EDIT },
                                    { "name": "R_DELETE", "value": objService.R_DELETE },
                                    { "name": "USER_CR_ID", "value": lstObject[0].USER_MDF_ID }
                                ]))
                            };
                        })
                    }
                    return forkJoin(sources)
                        .pipe(map((result: any) => {
                            let check = true;
                            let errorCode = 1;
                            result.forEach((obj: any) => {
                                if (obj.status != 1 || obj.data != 1) {
                                    check = false;
                                    errorCode = obj.data;
                                }
                            })
                            if (check) {
                                return 1;
                            } else {
                                return errorCode;
                            }
                        }))

                } else {
                    return of(0);
                }
            })
        );
    }
    createObjectToServer(param: any): Observable<any> {
        let id: string = param;

        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.FUNCTIONID_KEY == id);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    return this._serviceService.execServiceLogin("API-52", [
                        { "name": "FUNCTIONID", "value": lstObjectAddNew[0].FUNCTIONID },
                        { "name": "FUNCTIONNAME", "value": lstObjectAddNew[0].FUNCTIONNAME },
                        { "name": "FUNCTIONNAME_SUB", "value": lstObjectAddNew[0].FUNCTIONNAME_SUB },
                        { "name": "FUNCTION_TYPE", "value": lstObjectAddNew[0].FUNCTION_TYPE },
                        { "name": "LINK", "value": lstObjectAddNew[0].LINK },
                        { "name": "ICON", "value": lstObjectAddNew[0].ICON },
                        { "name": "FUNCTION_EXTERNAL", "value": lstObjectAddNew[0].FUNCTION_EXTERNAL },
                        { "name": "FUNCTION_EXTERNAL_TARGET", "value": lstObjectAddNew[0].FUNCTION_EXTERNAL_TARGET },
                        { "name": "FUNCTION_PARENT_ID", "value": lstObjectAddNew[0].FUNCTION_PARENT_ID },
                        { "name": "ENABLE", "value": lstObjectAddNew[0].ENABLE },
                        { "name": "ISPUPLIC", "value": lstObjectAddNew[0].ISPUPLIC },
                        { "name": "FUNCTIONORD", "value": lstObjectAddNew[0].FUNCTIONORD },
                        { "name": "AUTH_LOCAL", "value": lstObjectAddNew[0].AUTH_LOCAL },
                        { "name": "AUTH_INTERNET", "value": lstObjectAddNew[0].AUTH_INTERNET },
                        { "name": "APPID", "value": lstObjectAddNew[0].APPID },
                        { "name": "USER_CR_ID", "value": lstObjectAddNew[0].USER_CR_ID }
                    ]).pipe(map((response: any) => {
                        if (response.status == 1) {
                            return response.data;
                        } else {
                            return 0;
                        }
                    }), switchMap((apiInsertResult: any) => {
                        //Thêm mới tham số đầu vào CSDL
                        if (apiInsertResult != 0 || apiInsertResult != -1 || apiInsertResult != -2 || apiInsertResult != -3 || apiInsertResult != -4) {
                            if (lstObjectAddNew[0].LST_SERVICE && lstObjectAddNew[0].LST_SERVICE.length > 0) {
                                const sources = [];
                                lstObjectAddNew[0].LST_SERVICE.forEach((objService: any) => {
                                    sources.push(this._serviceService.execServiceLogin('API-57', [
                                        { "name": "API_SERVICEID", "value": objService.API_SERVICEID },
                                        { "name": "R_INSERT", "value": objService.R_INSERT },
                                        { "name": "R_EDIT", "value": objService.R_EDIT },
                                        { "name": "R_DELETE", "value": objService.R_DELETE },
                                        { "name": "FUNCTIONID", "value": apiInsertResult },
                                        { "name": "USER_CR_ID", "value": lstObjectAddNew[0].USER_CR_ID }
                                    ]));
                                })
                                return forkJoin(sources)
                                    .pipe(map((inputResult: any) => {
                                        let check = true;
                                        inputResult.forEach((objInputResult: any) => {
                                            if (objInputResult.status != 1 || objInputResult.data != 1) {
                                                check = false;
                                                //Trường hợp này chưa có cảnh báo
                                            }
                                        })
                                        return apiInsertResult;
                                    }))

                            }
                        }
                        return of(apiInsertResult);
                    }));
                } else {
                    this._object.next(null);
                    return 0;
                }
            })
        );

    }
    getObjectfromServer(param: any): Observable<any> {
        return this._serviceService.execServiceLogin("API-51", [{ "name": "FUNCTIONID", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let objId: string = param;
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.FUNCTIONID_KEY == objId);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-54", [
                        { "name": "FUNCTIONID", "value": lstObject[0].FUNCTIONID_KEY },
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
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                let lstApiDel = objects.filter(item => item.FUNCTIONID_KEY == param);
                if (lstApiDel.length > 0) {
                    try {
                        objects = objects.filter(item => item.FUNCTIONID_KEY != param);
                        this._lstListFunction.next(objects);
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
        let FUNCTIONID_KEY: any = param.FUNCTIONID_KEY;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects.findIndex(item => item.FUNCTIONID_KEY === FUNCTIONID_KEY);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstListFunction.next(objects);
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
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.FUNCTIONID_KEY === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = null;
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstListFunction.next(objects);
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
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.FUNCTIONID_KEY === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        objects = objects.filter(item => item.FUNCTIONID_KEY != param);
                        this._lstListFunction.next(objects);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = objects[itemIndex];
                        data.SYS_ACTION = null;
                        objects[itemIndex] = data;
                        // Update the Api
                        this._object.next(objects[itemIndex]);
                        this._lstListFunction.next(objects);
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




    get lstListFunction$(): Observable<any[]> {
        return this._lstListFunction.asObservable();
    }


    get Object$(): Observable<any> {
        return this._object.asObservable();
    }



    getListFunctionByAll(): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-50", null).pipe(
            tap((response: any) => {
                this._lstListFunction.next(response.data);
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
        return this._lstListFunction.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.FUNCTIONID_KEY === id);
                if (itemIndex >= 0) {
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstListFunction.next(objects);
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
    getObjectDetailById(objectId: string): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-55", [{ "name": "FUNCTIONID", "value": objectId }]).pipe(
            tap((response: any) => {
                this._objectServices.next(response.data);

            })
        );
    }
    getObjectById(id: string): Observable<any> {
        return this._lstListFunction.pipe(
            take(1),
            switchMap((objects: any) => {
                // Find the Api
                const object = objects.find(item => item.FUNCTIONID_KEY === id) || null;

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
                            let itemIndex = objects.findIndex(item => item.FUNCTIONID_KEY === id);
                            if (itemIndex >= 0) {
                                objects[itemIndex] = apiResult;
                                this._object.next(apiResult);
                                this._lstListFunction.next(objects);
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

    resetObject(): Observable<boolean> {
        return of(true).pipe(
            take(1),
            tap(() => {
                this._object.next(null);
            })
        );
    }


}
