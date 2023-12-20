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
export class ApiService extends BaseService implements BaseDetailService {
    selectedApiChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _apis: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _apiInput: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any> = new BehaviorSubject(null);
    private _lstApiTypes: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstApiOutputs: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstApiInputs: BehaviorSubject<any[]> = new BehaviorSubject(null);
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
        return this._apis.pipe(
            take(1),
            map((Apis) => {
                // Find the Api
                let ApiItem = {
                    "USER_CR_ID": userId, "API_SERVICE_TYPEID": "SQL", "IS_PUBLIC": false, "API_SERVICE_DATA": "", "IS_LOGIN": false,
                    "USER_CR_DTIME": null, "API_SERVICE_DESC": "Nhập tên dịch vụ", "API_SERVICEID": uid.stamp(10), "API_SERVICE_GROUPID": groupid,
                    "SYS_ACTION": State.create
                };
                Apis.push(ApiItem);
                this._apis.next(Apis);
                this._object.next(ApiItem);
                return ApiItem.API_SERVICEID;
            }),
            switchMap((Apis) => {
                return of(Apis);
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._apis.pipe(
            take(1),
            map((Apis) => {
                let lstApi = Apis.filter(item => item.API_SERVICEID == serviceId);
                return lstApi;
            }),
            switchMap((lstApi: any) => {
                if (lstApi.length > 0) {
                    let API_SERVICE_LST_INPUTID: any = "";
                    if (lstApi[0].API_SERVICE_LST_INPUTID && lstApi[0].API_SERVICE_LST_INPUTID.length > 0) {
                        lstApi[0].API_SERVICE_LST_INPUTID.forEach((obj) => {
                            API_SERVICE_LST_INPUTID = API_SERVICE_LST_INPUTID + obj + ",";
                        })
                        API_SERVICE_LST_INPUTID = API_SERVICE_LST_INPUTID.substring(0, API_SERVICE_LST_INPUTID.length - 1);
                    }
                    return this._serviceService.execServiceLogin("API-15", [
                        { "name": "API_SERVICEID", "value": lstApi[0].API_SERVICEID },
                        { "name": "API_SERVICE_DATA", "value": lstApi[0].API_SERVICE_DATA },
                        { "name": "API_SERVICE_DESC", "value": lstApi[0].API_SERVICE_DESC },
                        { "name": "API_SERVICE_GROUPID", "value": lstApi[0].API_SERVICE_GROUPID },
                        { "name": "API_SERVICE_OUTPUTID", "value": lstApi[0].API_SERVICE_OUTPUTID },
                        { "name": "API_SERVICE_TYPEID", "value": lstApi[0].API_SERVICE_TYPEID },
                        { "name": "IS_LOGIN", "value": lstApi[0].IS_LOGIN },
                        { "name": "IS_PUBLIC", "value": lstApi[0].IS_PUBLIC },
                        { "name": "ENABLE", "value": lstApi[0].ENABLE },
                        { "name": "API_SERVICE_LST_INPUTID", "value": API_SERVICE_LST_INPUTID },
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
    createObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;

        return this._apis.pipe(
            take(1),
            map((Apis) => {
                let lstApiAddNew = Apis.filter(item => item.API_SERVICEID == serviceId);
                return lstApiAddNew;
            }),
            switchMap((lstApiAddNew: any) => {
                if (lstApiAddNew.length > 0) {
                    return this._serviceService.execServiceLogin("API-12", [
                        { "name": "API_SERVICE_DATA", "value": lstApiAddNew[0].API_SERVICE_DATA },
                        { "name": "API_SERVICE_DESC", "value": lstApiAddNew[0].API_SERVICE_DESC },
                        { "name": "API_SERVICE_GROUPID", "value": lstApiAddNew[0].API_SERVICE_GROUPID },
                        { "name": "API_SERVICE_OUTPUTID", "value": lstApiAddNew[0].API_SERVICE_OUTPUTID },
                        { "name": "API_SERVICE_TYPEID", "value": lstApiAddNew[0].API_SERVICE_TYPEID },
                        { "name": "IS_LOGIN", "value": lstApiAddNew[0].IS_LOGIN },
                        { "name": "IS_PUBLIC", "value": lstApiAddNew[0].IS_PUBLIC },
                        { "name": "USER_CR_ID", "value": lstApiAddNew[0].USER_CR_ID }
                    ]).pipe(map((response: any) => {

                        if (response.status == 1) {
                            return response.data;
                        } else {
                            return 0;
                        }
                    }), switchMap((apiInsertResult: any) => {
                        //Thêm mới tham số đầu vào CSDL
                        if (apiInsertResult != 0 || apiInsertResult != -1 || apiInsertResult != -2) {
                            if (lstApiAddNew[0].API_SERVICE_LST_INPUTID && lstApiAddNew[0].API_SERVICE_LST_INPUTID.length > 0) {
                                const sources = [];
                                lstApiAddNew[0].API_SERVICE_LST_INPUTID.forEach((objInput: any) => {
                                    sources.push(this._serviceService.execServiceLogin('API-13', [
                                        { "name": "API_SERVICE_INPUTID", "value": objInput },
                                        { "name": "API_SERVICEID", "value": apiInsertResult },
                                        { "name": "USER_CR_ID", "value": lstApiAddNew[0].USER_CR_ID }
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

                    return 0;
                }
            })
        );

    }
    getObjectfromServer(param: any): Observable<any> {
        return this._serviceService.execServiceLogin("API-14", [{ "name": "API_SERVICEID", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._apis.pipe(
            take(1),
            map((Apis) => {
                let lstApi = Apis.filter(item => item.API_SERVICEID == serviceId);
                return lstApi;
            }),
            switchMap((lstApi: any) => {
                if (lstApi.length > 0) {
                    return this._serviceService.execServiceLogin("API-16", [
                        { "name": "API_SERVICEID", "value": lstApi[0].API_SERVICEID },
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
        return this._apis.pipe(
            take(1),
            map((Apis) => {
                let lstApiDel = Apis.filter(item => item.API_SERVICEID == param);
                if (lstApiDel.length > 0) {
                    try {
                        Apis = Apis.filter(item => item.API_SERVICEID != param);
                        this._apis.next(Apis);
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
        let API_SERVICEID: any = param.API_SERVICEID;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._apis.pipe(
            take(1),
            map((Apis) => {
                // Find the Api
                let itemIndex = Apis.findIndex(item => item.API_SERVICEID === API_SERVICEID);
                if (itemIndex >= 0) {
                    let data = Apis[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    Apis[itemIndex] = data;
                    // Update the Api
                    this._object.next(Apis[itemIndex]);
                    this._apis.next(Apis);
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
        return this._apis.pipe(
            take(1),
            map((Apis) => {
                let itemIndex = Apis.findIndex(item => item.API_SERVICEID === param);
                if (itemIndex >= 0) {
                    let data = Apis[itemIndex];
                    data.SYS_ACTION = null;
                    Apis[itemIndex] = data;
                    // Update the Api
                    this._object.next(Apis[itemIndex]);
                    this._apis.next(Apis);
                    return data;

                } else {
                    return null;
                }
            }),
            switchMap((Api) => {
                return of(Api);
            })
        );
    }
    cancelObject(param: any): Observable<any> {
        return this._apis.pipe(
            take(1),
            map((Apis) => {
                let itemIndex = Apis.findIndex(item => item.API_SERVICEID === param);
                if (itemIndex >= 0) {
                    let data = Apis[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        Apis = Apis.filter(item => item.API_SERVICEID != param);
                        this._apis.next(Apis);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = Apis[itemIndex];
                        data.SYS_ACTION = null;
                        Apis[itemIndex] = data;
                        // Update the Api
                        this._object.next(Apis[itemIndex]);
                        this._apis.next(Apis);
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


    get apis$(): Observable<any[]> {
        return this._apis.asObservable();
    }


    get Object$(): Observable<any> {
        return this._object.asObservable();
    }


    get ApiInput$(): Observable<any[]> {
        return this._apiInput.asObservable();
    }

    get LstApiOutputs$(): Observable<any[]> {
        return this._lstApiOutputs.asObservable();
    }

    get LstApiInputs$(): Observable<any[]> {
        return this._lstApiInputs.asObservable();
    }

    get LstApiTypes$(): Observable<any[]> {
        return this._lstApiTypes.asObservable();
    }

    /**
     * Getter for pagination
     */
    get pagination$(): Observable<any> {
        return this._pagination.asObservable();
    }

    getLstApiTypes(): Observable<any> {
        return this._serviceService.execServiceLogin("API-10", null).pipe(
            tap((response: any) => {
                this._lstApiTypes.next(response.data);
            })
        );
    }

    getLstApiOutput(): Observable<any> {
        return this._serviceService.execServiceLogin("API-9", null).pipe(
            tap((response: any) => {
                this._lstApiOutputs.next(response.data);
            })
        );
    }

    getLstApiInput(): Observable<any> {
        return this._serviceService.execServiceLogin("API-11", null).pipe(
            tap((response: any) => {
                this._lstApiInputs.next(response.data);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get folders
     */
    getGroups(): Observable<any> {
        return this._serviceService.execServiceLogin("API-6", null).pipe(
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
    getApisByFolder(groupid: string, page: string = '1'): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-7", [{ "name": "GROUPID", "value": groupid }]).pipe(
            tap((response: any) => {
                this._apis.next(response.data);
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
        return this._apis.pipe(
            take(1),
            map((Apis) => {

                // Find the Api
                let itemIndex = Apis.findIndex(item => item.API_SERVICEID === id);
                Apis[itemIndex] = data;
                // Update the Api
                this._object.next(Apis[itemIndex]);
                this._apis.next(Apis);
                // Return the Api
                return Apis[itemIndex];
            }),
            switchMap((Api) => {
                if (!Api) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }

                return of(Api);
            })
        );
    }
    getApiById(id: string): Observable<any> {
        return this._apis.pipe(
            take(1),
            switchMap((Apis: any) => {
                // Find the Api
                const Api = Apis.find(item => item.API_SERVICEID === id) || null;

                if (!Api) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (Api.SYS_ACTION != State.create && Api.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((apiResult) => {

                        return apiResult.data
                    }), switchMap((apiResult) => {
                        return combineLatest([this.getApiInputById(id), this.getApiFunctionById(id)]).pipe(
                            map(([lstInputs, listFunction]) => {
                                let apiInputs: any[] = [];
                                if (lstInputs && lstInputs.status == 1 && lstInputs.data.length > 0) {
                                    lstInputs.data.forEach((itemInput: any) => {
                                        apiInputs.push(itemInput.API_SERVICE_INPUTID);
                                    })
                                }
                                apiResult.API_SERVICE_LST_INPUTID = apiInputs;
                                apiResult.LST_FUNCTION = listFunction.data;
                                //Cần cập nhật lại list
                                // Update the Api
                                let itemIndex = Apis.findIndex(item => item.API_SERVICEID === id);
                                if (itemIndex >= 0) {
                                    Apis[itemIndex] = apiResult;
                                    this._object.next(apiResult);
                                    this._apis.next(Apis);
                                    return apiResult;
                                }
                            })
                        );
                    }));
                }
                this._object.next(Api);
                return of(Api);
            })
        );
    }
    getApiInputById(serviceId: string): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-8", [{ "name": "API_SERVICEID", "value": serviceId }]).pipe(
            tap((response: any) => {
                this._apiInput.next(response.data);

            })
        );
    }
    getApiFunctionById(serviceId: string): Observable<any> {        

        return this._serviceService.execServiceLogin("API-69", [{ "name": "API_SERVICEID", "value": serviceId }]);
    }
    getApiGroupById(groupid: string): Observable<any> {
        return this._groups.pipe(
            take(1),
            map((groups) => {

                // Find the Group
                const group = groups.find(item => item.API_SERVICE_GROUPID === groupid) || null;

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
