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
export class CauTrucDuLieuService extends BaseService implements BaseDetailService {
    selectedApiChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _objects: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _objectColumns: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<any> = new BehaviorSubject(null);
    private _lstObjectNguonDuLieu: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstObjectKieuDuLieu: BehaviorSubject<any[]> = new BehaviorSubject(null);
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
            map((Apis) => {
                // Find the Api
                let ApiItem = {
                    "USER_CR_ID": userId, "TEN_BANG": "", "MO_TA": "", "MA_NHOM": groupid, "MA_KETNOI": null,
                    "LST_COT": [{ "STT": 1, "MA_COT": uid.stamp(10), "TEN_COT": "", "MO_TA": "", "KIEU_DLIEU": "", "USER_CR_ID": userId, "SYS_ACTION": State.create }],
                    "USER_CR_DTIME": null, "API_SERVICE_DESC": "Nhập tên dịch vụ", "MA_BANG": uid.stamp(10),
                    "SYS_ACTION": State.create
                };
                Apis.push(ApiItem);
                this._objects.next(Apis);
                this._object.next(ApiItem);
                return ApiItem.MA_BANG;
            }),
            switchMap((Apis) => {
                return of(Apis);
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let maBang: string = param;
        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstobjects = objects.filter(item => item.MA_BANG == maBang);
                return lstobjects;
            }),
            switchMap((lstobjects: any) => {
                if (lstobjects.length > 0) {
                    const sources = [];
                    // let LST_MA_COT: any = "";
                    // if (lstobjects[0].LST_COT && lstobjects[0].LST_COT.length > 0) {
                    //     lstobjects[0].LST_COT.forEach((obj) => {
                    //         if (obj?.SYS_ACTION != State.create) {
                    //             LST_MA_COT = LST_MA_COT + obj.MA_COT + ",";
                    //         }
                    //     })
                    //     LST_MA_COT = LST_MA_COT.substring(0, LST_MA_COT.length - 1);
                    // }
                    sources.push(this._serviceService.execServiceLogin("API-37", [
                        { "name": "MA_BANG", "value": lstobjects[0].MA_BANG },
                        { "name": "TEN_BANG", "value": lstobjects[0].TEN_BANG },
                        { "name": "MO_TA", "value": lstobjects[0].MO_TA },
                        { "name": "MA_NHOM", "value": lstobjects[0].MA_NHOM },
                        { "name": "MA_KETNOI", "value": lstobjects[0].MA_KETNOI },
                        { "name": "LST_MA_COT", "value": lstobjects[0].LST_COT_REMAIN.join(",") },
                        { "name": "USER_MDF_ID", "value": lstobjects[0].USER_MDF_ID }
                    ]));
                    // if (lstobjects[0].LST_COT && lstobjects[0].LST_COT.length > 0) {
                    //     lstobjects[0].LST_COT.forEach((objCot: any) => {
                    //         if (objCot?.SYS_ACTION == State.edit) {
                    //             sources.push(this._serviceService.execServiceLogin('API-38', [
                    //                 { "name": "STT", "value": objCot.STT },
                    //                 { "name": "MA_COT", "value": objCot.MA_COT },
                    //                 { "name": "TEN_COT", "value": objCot.TEN_COT },
                    //                 { "name": "MO_TA", "value": objCot.MO_TA },
                    //                 { "name": "MA_KIEU_DLIEU", "value": objCot.MA_KIEU_DLIEU },
                    //                 { "name": "MA_BANG", "value": lstobjects[0].MA_BANG },
                    //                 { "name": "USER_MDF_ID", "value": lstobjects[0].USER_MDF_ID }
                    //             ]))
                    //         };
                    //         if (objCot?.SYS_ACTION == State.create) {
                    //             sources.push(this._serviceService.execServiceLogin('API-36', [
                    //                 { "name": "STT", "value": objCot.STT },
                    //                 { "name": "MA_BANG", "value": lstobjects[0].MA_BANG },
                    //                 { "name": "TEN_COT", "value": objCot.TEN_COT },
                    //                 { "name": "MO_TA", "value": objCot.MO_TA },
                    //                 { "name": "MA_KIEU_DLIEU", "value": objCot.MA_KIEU_DLIEU },
                    //                 { "name": "USER_CR_ID", "value": lstobjects[0].USER_CR_ID }
                    //             ]))
                    //         };
                    //     })
                    // }
                    if (lstobjects[0].LST_COT_NEW && lstobjects[0].LST_COT_NEW.length > 0) {
                        lstobjects[0].LST_COT_NEW.forEach((objCot: any) => {
                            sources.push(this._serviceService.execServiceLogin('API-36', [
                                { "name": "STT", "value": objCot.STT },
                                { "name": "MA_BANG", "value": lstobjects[0].MA_BANG },
                                { "name": "TEN_COT", "value": objCot.TEN_COT },
                                { "name": "MO_TA", "value": objCot.MO_TA },
                                { "name": "MA_KIEU_DLIEU", "value": objCot.MA_KIEU_DLIEU },
                                { "name": "USER_CR_ID", "value": lstobjects[0].USER_CR_ID }
                            ]))
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
        let objectId: string = param;

        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.MA_BANG == objectId);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    return this._serviceService.execServiceLogin("API-35", [
                        { "name": "TEN_BANG", "value": lstObjectAddNew[0].TEN_BANG },
                        { "name": "MO_TA", "value": lstObjectAddNew[0].MO_TA },
                        { "name": "MA_NHOM", "value": lstObjectAddNew[0].MA_NHOM },
                        { "name": "MA_KETNOI", "value": lstObjectAddNew[0].MA_KETNOI },
                        { "name": "USER_CR_ID", "value": lstObjectAddNew[0].USER_CR_ID }
                    ]).pipe(map((response: any) => {

                        if (response.status == 1) {
                            return response.data;
                        } else {
                            return 0;
                        }
                    }), switchMap((apiInsertResult: any) => {
                        //Thêm mới tham số đầu vào CSDL
                        if (apiInsertResult != 0 || apiInsertResult != -1 || apiInsertResult != -2) {
                            if (lstObjectAddNew[0].LST_COT && lstObjectAddNew[0].LST_COT.length > 0) {
                                const sources = [];
                                lstObjectAddNew[0].LST_COT.forEach((objCot: any) => {
                                    sources.push(this._serviceService.execServiceLogin('API-36', [
                                        { "name": "STT", "value": objCot.STT },
                                        { "name": "MA_BANG", "value": apiInsertResult },
                                        { "name": "TEN_COT", "value": objCot.TEN_COT },
                                        { "name": "MO_TA", "value": objCot.MO_TA },
                                        { "name": "MA_KIEU_DLIEU", "value": objCot.MA_KIEU_DLIEU },
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

                    return 0;
                }
            })
        );

    }
    getObjectfromServer(param: any): Observable<any> {
        return this._serviceService.execServiceLogin("API-31", [{ "name": "MA_BANG", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                let lstApi = Apis.filter(item => item.MA_BANG == serviceId);
                return lstApi;
            }),
            switchMap((lstApi: any) => {
                if (lstApi.length > 0) {
                    return this._serviceService.execServiceLogin("API-39", [
                        { "name": "MA_BANG", "value": lstApi[0].MA_BANG },
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
                let lstApiDel = Apis.filter(item => item.MA_BANG == param);
                if (lstApiDel.length > 0) {
                    try {
                        Apis = Apis.filter(item => item.MA_BANG != param);
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
        let MA_BANG: any = param.MA_BANG;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                // Find the Api
                let itemIndex = Apis.findIndex(item => item.MA_BANG === MA_BANG);
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
                let itemIndex = Apis.findIndex(item => item.MA_BANG === param);
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
            switchMap((Api) => {
                return of(Api);
            })
        );
    }
    cancelObject(param: any): Observable<any> {
        return this._objects.pipe(
            take(1),
            map((Apis) => {
                let itemIndex = Apis.findIndex(item => item.MA_BANG === param);
                if (itemIndex >= 0) {
                    let data = Apis[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        Apis = Apis.filter(item => item.MA_BANG != param);
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


    get ObjectNguonDuLieu$(): Observable<any[]> {
        return this._lstObjectNguonDuLieu.asObservable();
    }
    get ObjectKieuDuLieu$(): Observable<any[]> {
        return this._lstObjectKieuDuLieu.asObservable();
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
    getGroups(orgid: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-25", [
            {
                name: "ORGID", value: orgid
            }
        ]).pipe(
            tap((response: any) => {
                this._groups.next(response.data);
            })
        );
    }


    getLstNguonDuLieu(orgid: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-33", [
            {
                name: "ORGID", value: orgid
            }
        ]).pipe(
            tap((response: any) => {
                this._lstObjectNguonDuLieu.next(response.data);
            })
        );
    }

    getLstKieuDuLieu(): Observable<any> {
        return this._serviceService.execServiceLogin("API-34", null).pipe(
            tap((response: any) => {
                this._lstObjectKieuDuLieu.next(response.data);
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


        return this._serviceService.execServiceLogin("API-30", [{ "name": "MA_NHOM", "value": groupid }]).pipe(
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
            map((Apis) => {

                // Find the Api
                let itemIndex = Apis.findIndex(item => item.MA_BANG === id);
                Apis[itemIndex] = data;
                // Update the Api
                this._object.next(Apis[itemIndex]);
                this._objects.next(Apis);
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
    getObjectById(id: string): Observable<any> {
        return this._objects.pipe(
            take(1),
            switchMap((objs: any) => {
                // Find the Api
                const obj = objs.find(item => item.MA_BANG === id) || null;

                if (!obj) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (obj.SYS_ACTION != State.create && obj.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((apiResult) => {

                        return apiResult.data
                    }), switchMap((apiResult) => {
                        return this.getObjectDetailById(id).pipe(map((lstInputs) => {
                            let apiInputs: any[] = [];
                            if (lstInputs && lstInputs.status == 1 && lstInputs.data.length > 0) {
                                lstInputs.data.forEach((itemInput: any) => {
                                    apiInputs.push(itemInput);
                                })
                            }
                            apiResult.LST_COT = apiInputs;
                            //Cần cập nhật lại list
                            // Update the Api
                            let itemIndex = objs.findIndex(item => item.MA_BANG === id);
                            if (itemIndex >= 0) {
                                objs[itemIndex] = apiResult;
                                this._object.next(apiResult);
                                this._objects.next(objs);
                                return apiResult;
                            }

                        }))
                    }));
                }
                this._object.next(obj);
                return of(obj);
            })
        );
    }
    getObjectDetailById(objectId: string): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-32", [{ "name": "MA_BANG", "value": objectId }]).pipe(
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
                const group = groups.find(item => item.MA_NHOM === groupid) || null;

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

    getLstBang(maKetNoi: string): Observable<any> {
        return this._serviceService.execServiceLogin(
            "CD9D9814-611D-4A84-9DD0-F13931042411",
            [
                {
                    "name": "MA_KETNOI",
                    "value": maKetNoi
                }
            ]
        );
    }

    getLstCot(maBang: number): Observable<any> {
        return this._serviceService.execServiceLogin(
            "94EAED76-A686-4D0D-BD65-0D434C02AD6F",
            [
                {
                    name: "TABLE_ID",
                    value: maBang
                }
            ]
        );
    }
}
