import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ServiceService } from 'app/shared/service/service.service';
import ShortUniqueId from 'short-unique-id';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailService } from 'app/shared/commons/BaseDetail.service';
import { BaseService } from 'app/shared/commons/base.service';
import { MauDuLieuShare } from 'app/core/models/MauDuLieuShare';


@Injectable({
    providedIn: 'root'
})
export class KhaiThacDuLieuService extends BaseService implements BaseDetailService {
    selectedObjectChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _lstKhaiThacDuLieu: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstNhomDuLieu: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstBangDuLieu: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _lstKhaiThacDuLieuShared: BehaviorSubject<any[]> = new BehaviorSubject(null);

    _object: BehaviorSubject<any> = new BehaviorSubject(null);
    _objectColumn: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        public _serviceService: ServiceService) {
        super(_serviceService);
    }

    get lstKhaiThacDuLieu$(): Observable<any[]> {
        return this._lstKhaiThacDuLieu.asObservable();
    }

    get lstKhaiThacDuLieuShared$(): Observable<any> {
        return this._lstKhaiThacDuLieuShared.asObservable();
    }

    get Object$(): Observable<any> {
        return this._object.asObservable();
    }

    get ObjectColumn$(): Observable<any> {
        return this._objectColumn.asObservable();
    }

    get lstNhomDuLieu$(): Observable<any[]> {
        return this._lstNhomDuLieu.asObservable();
    }

    get lstBangDuLieu$(): Observable<any[]> {
        return this._lstBangDuLieu.asObservable();
    }

    getBangDuLieuByAll(maNhom: String): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-30", [{ "name": "MA_NHOM", "value": maNhom }]).pipe(
            tap((response: any) => {
                this._lstBangDuLieu.next(response.data);

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
    changeTableObject(param: any): Observable<any> {
        let P_MA_DULIEU: any = param.MA_DULIEU;
        let P_MA_BANG: any = param.MA_BANG;
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            switchMap((objects: any) => {
                // Find the Api
                const object = objects.find(item => item.MA_DULIEU === P_MA_DULIEU) || null;

                if (!object) {
                    //return throwError('Could not found Object with id of ' + id + '!');
                }
                return this._object.pipe(take(1), map((objectResult) => {
                    return objectResult;
                }), switchMap((apiResult) => {
                    return this.getCotDuLieuByAll(P_MA_DULIEU, P_MA_BANG).pipe(
                        map((lstCot) => {
                            let lstCots: any[] = [];
                            let STT = 0;
                            if (lstCot && lstCot.status == 1 && lstCot.data.length > 0) {
                                lstCot.data.forEach((itemInput: any) => {
                                    if (!itemInput.STT) {
                                        STT = STT + 1
                                        itemInput.STT = STT;
                                    } else {
                                        STT = itemInput.STT;
                                    }
                                    lstCots.push(itemInput);
                                })
                            }
                            apiResult.LST_COT = lstCots;
                            let itemIndex = objects.findIndex(item => item.MA_DULIEU === P_MA_DULIEU);
                            if (itemIndex >= 0) {
                                objects[itemIndex] = apiResult;
                                this._object.next(apiResult);
                                this._lstKhaiThacDuLieu.next(objects);
                                return apiResult;
                            }
                        })
                    );
                }));
            }));
    }
    updateCotDuLieuFilter(param: any, valueFilter: any): Observable<any> {
        let MA_COT: any = param.MA_COT;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._object.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects?.LST_COT.findIndex(item => item.MA_COT === MA_COT);
                if (itemIndex >= 0) {
                    let data = objects?.LST_COT[itemIndex];
                    data.LST_FILTER = valueFilter;
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects.LST_COT[itemIndex] = data;
                    //this._lstCotDuLieu.next(objects);

                    return objects.LST_COT;
                } else {
                    //this._lstCotDuLieu.next(null);
                    return null;
                }
            }),
            switchMap((lstCot) => {
                return this._object.pipe(
                    take(1),
                    map((object) => {
                        object.LST_COT = lstCot;
                        this._object.next(object);
                        return lstCot;
                    }))
            })
        );
    }
    getCotDuLieuByAll(id: String, tableId: String): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-91", [
            { "name": "MA_DULIEU", "value": id },
            { "name": "MA_BANG", "value": tableId }
            , { "name": "USERID", "value": null }]).pipe(
                map((response: any) => {
                    return response;

                }),
                switchMap((response: any) => {
                    let objectColumn = response?.data;
                    if (response.status == 1 && objectColumn && objectColumn.length > 0) {
                        return this._serviceService.execServiceLogin("API-92", [
                            { "name": "MA_DULIEU", "value": id }
                        ]).pipe(map((response: any) => {
                            if (response.status == 1) {
                                if (response.data && response.data.length > 0) {
                                    let dataColumnFilter = [];
                                    objectColumn.forEach((column) => {
                                        dataColumnFilter = response.data.filter(item => item.MA_COT == column.MA_COT)
                                        column.LST_FILTER = dataColumnFilter;
                                    })
                                }
                                //this._lstCotDuLieu.next(objectColumn);
                                response.data = objectColumn;
                                return response;
                            } else {
                                return [];
                            }
                        }));
                    } else {
                        return of([]);
                    }
                })
            );
    }
    getNhomDuLieuByAll(orgid: string): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-25", [
            {
                name: "ORGID", value: orgid
            }
        ]).pipe(
            tap((response: any) => {
                this._lstNhomDuLieu.next(response.data);

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
    createObject(param: any): Observable<any> {
        let userId: string = param.userId;

        const uid = new ShortUniqueId();
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let objectItem = {
                    "USER_CR_ID": userId,
                    "MA_NHOM": null,
                    "TEN_NHOM": null,
                    "MA_BANG": null,
                    "USER_CR_DTIME": null, "MA_DULIEU": uid.stamp(10),

                    "SYS_ACTION": State.create
                };
                objects.push(objectItem);
                this._lstKhaiThacDuLieu.next(objects);
                this._object.next(objectItem);
                return objectItem.MA_DULIEU;
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    editColumnFilter(param: any): Observable<any> {
        let maCot: string = param;
        return this._object.pipe(
            take(1),
            map((object) => {
                let lstObjectColumn = object?.LST_COT.filter(item => item.MA_COT == maCot);
                return lstObjectColumn;
            }),
            switchMap((lstObjectColumn: any) => {
                if (lstObjectColumn.length > 0) {
                    this._objectColumn.next(lstObjectColumn[0]);
                    return of(lstObjectColumn[0])
                } else {
                    return of(null);
                }
            })
        );
    }
    editObjectToServer(param: any): Observable<any> {
        let maKetNoi: string = param;
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.MA_DULIEU == maKetNoi);
                return lstObject;
            }),
            switchMap((lstObject: any) => {

                if (lstObject.length > 0) {
                    let lstCots: any[] = [];
                    let lstFilter: any[] = [];
                    if (lstObject[0].LST_COT && lstObject[0].LST_COT.length > 0) {
                        lstObject[0].LST_COT.forEach((itemInput: any) => {
                            if (itemInput.VIEW) {
                                lstCots.push({
                                    "MA_DULIEU_CTIET": itemInput.MA_DULIEU_CTIET,
                                    "MA_COT": itemInput.MA_COT,
                                    "STT": itemInput.STT,
                                    "SORT": itemInput.SORT,
                                });
                            }
                            if (itemInput.LST_FILTER && itemInput.LST_FILTER.length > 0) {
                                itemInput.LST_FILTER.forEach((itemFilter: any) => {
                                    lstFilter.push(
                                        {
                                            "MA_LOC": itemFilter.MA_LOC,
                                            "MA_COT": itemInput.MA_COT,
                                            "GIA_TRI_LOC": itemFilter.GIA_TRI_LOC,
                                            "STT": itemFilter.STT,
                                            "LOAI_DKIEN": itemFilter.LOAI_DKIEN,
                                            "NHOM_DKIEU": itemFilter.NHOM_DKIEU,
                                        }
                                    )
                                })

                            }
                        })
                    }
                    return this._serviceService.execServiceLogin("API-89", [
                        { "name": "MA_DULIEU", "value": lstObject[0].MA_DULIEU },
                        { "name": "MO_TA", "value": lstObject[0].MO_TA },
                        { "name": "MA_BANG", "value": lstObject[0].MA_BANG },
                        { "name": "LST_COT", "value": lstCots },
                        { "name": "LST_FILTER", "value": lstFilter },
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
    loadDataToServer(PAGE_NUM: any, PAGE_ROW_NUM: any) {
        return this._object.pipe(
            map((object) => {
                return object;
            }),
            switchMap((object: any) => {
                if (object) {
                    let lstCots: any[] = [];
                    let lstFilter: any[] = [];
                    if (object.LST_COT && object.LST_COT.length > 0) {
                        object.LST_COT.forEach((itemInput: any) => {
                            if (itemInput.VIEW) {
                                lstCots.push({
                                    "MA_DULIEU_CTIET": itemInput.MA_DULIEU_CTIET,
                                    "MA_COT": itemInput.MA_COT,
                                    "TEN_COT": itemInput.TEN_COT,
                                    "MA_KIEU_DLIEU": itemInput.MA_KIEU_DLIEU,
                                    "STT": itemInput.STT,
                                    "SORT": (itemInput.SORT != null ? ((itemInput.SORT == 1 || itemInput.SORT) ? 1 : 0) : null),
                                });
                            }
                            if (itemInput.LST_FILTER && itemInput.LST_FILTER.length > 0) {
                                itemInput.LST_FILTER.forEach((itemFilter: any) => {
                                    lstFilter.push(
                                        {
                                            "MA_LOC": itemFilter.MA_LOC,
                                            "MA_COT": itemInput.MA_COT,
                                            "TEN_COT": itemInput.TEN_COT,
                                            "MA_KIEU_DLIEU": itemInput.MA_KIEU_DLIEU,
                                            "GIA_TRI_LOC": itemFilter.GIA_TRI_LOC,
                                            "STT": itemFilter.STT,
                                            "LOAI_DKIEN": itemFilter.LOAI_DKIEN,
                                            "NHOM_DKIEU": itemFilter.NHOM_DKIEU,
                                        }
                                    )
                                })

                            }
                        })
                    }
                    return this._serviceService.execServiceLogin("APIC-L-1", [
                        { "name": "MA_BANG", "value": object.MA_BANG },
                        { "name": "TEN_BANG", "value": (object.TEN_BANG != undefined && object.TEN_BANG != null) ? object.TEN_BANG : this._lstBangDuLieu.getValue().filter(e => e.MA_BANG == object.MA_BANG)[0].TEN_BANG },
                        { "name": "LST_COT_JSON", "value": lstCots },
                        { "name": "LST_FILTER_JSON", "value": lstFilter },
                        { "name": "PAGE_NUM", "value": PAGE_NUM },
                        { "name": "PAGE_ROW_NUM", "value": PAGE_ROW_NUM },
                        { "name": "USERID", "value": null }
                    ]).pipe(map((response: any) => {

                        return response;
                    }));
                } else {
                    this._object.next(null);
                    return of(0);
                }
            })
        );
    }
    loadDataExcelToServer() {
        return this._object.pipe(
            map((object) => {
                return object;
            }),
            switchMap((object: any) => {
                if (object) {
                    let lstCots: any[] = [];
                    let lstFilter: any[] = [];
                    if (object.LST_COT && object.LST_COT.length > 0) {
                        object.LST_COT.forEach((itemInput: any) => {
                            if (itemInput.VIEW) {
                                lstCots.push({
                                    "MA_DULIEU_CTIET": itemInput.MA_DULIEU_CTIET,
                                    "MA_COT": itemInput.MA_COT,
                                    "TEN_COT": itemInput.TEN_COT,
                                    "MO_TA": itemInput.MO_TA,
                                    "MA_KIEU_DLIEU": itemInput.MA_KIEU_DLIEU,
                                    "STT": itemInput.STT,
                                    "SORT": (itemInput.SORT != null ? ((itemInput.SORT == 1 || itemInput.SORT) ? 1 : 0) : null),
                                });
                            }
                            if (itemInput.LST_FILTER && itemInput.LST_FILTER.length > 0) {
                                itemInput.LST_FILTER.forEach((itemFilter: any) => {
                                    lstFilter.push(
                                        {
                                            "MA_LOC": itemFilter.MA_LOC,
                                            "MA_COT": itemInput.MA_COT,
                                            "TEN_COT": itemInput.TEN_COT,
                                            "MA_KIEU_DLIEU": itemInput.MA_KIEU_DLIEU,
                                            "GIA_TRI_LOC": itemFilter.GIA_TRI_LOC,
                                            "STT": itemFilter.STT,
                                            "LOAI_DKIEN": itemFilter.LOAI_DKIEN,
                                            "NHOM_DKIEU": itemFilter.NHOM_DKIEU,
                                        }
                                    )
                                })

                            }
                        })
                    }
                    return this._serviceService.execServiceLogin("APIC-L-2", [
                        { "name": "MA_BANG", "value": object.MA_BANG },
                        { "name": "TEN_BANG", "value": object.TEN_BANG },
                        { "name": "LST_COT_JSON", "value": lstCots },
                        { "name": "LST_FILTER_JSON", "value": lstFilter },
                        { "name": "USERID", "value": null }
                    ]).pipe(map((response: any) => {

                        return response;
                    }));
                } else {
                    this._object.next(null);
                    return of(0);
                }
            })
        );
    }
    createObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;

        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.MA_DULIEU == serviceId);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    let lstCots: any[] = [];
                    let lstFilter: any[] = [];
                    if (lstObjectAddNew[0].LST_COT && lstObjectAddNew[0].LST_COT.length > 0) {
                        lstObjectAddNew[0].LST_COT.forEach((itemInput: any) => {
                            if (itemInput.VIEW) {
                                lstCots.push({
                                    "MA_DULIEU_CTIET": itemInput.MA_DULIEU_CTIET,
                                    "MA_COT": itemInput.MA_COT,
                                    "STT": itemInput.STT,
                                    "SORT": itemInput.SORT,
                                });
                            }
                            if (itemInput.LST_FILTER && itemInput.LST_FILTER.length > 0) {
                                itemInput.LST_FILTER.forEach((itemFilter: any) => {
                                    lstFilter.push(
                                        {
                                            "MA_LOC": itemFilter.MA_LOC,
                                            "MA_COT": itemInput.MA_COT,
                                            "GIA_TRI_LOC": itemFilter.GIA_TRI_LOC,
                                            "STT": itemFilter.STT,
                                            "LOAI_DKIEN": itemFilter.LOAI_DKIEN,
                                            "NHOM_DKIEU": itemFilter.NHOM_DKIEU,
                                        }
                                    )
                                })

                            }
                        })
                    }
                    return this._serviceService.execServiceLogin("API-88", [
                        { "name": "MO_TA", "value": lstObjectAddNew[0].MO_TA },
                        { "name": "MA_BANG", "value": lstObjectAddNew[0].MA_BANG },
                        { "name": "LST_COT", "value": lstCots },
                        { "name": "LST_FILTER", "value": lstFilter },
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
        return this._serviceService.execServiceLogin("API-87", [{ "name": "USERID", "value": null }, { "name": "MA_DULIEU", "value": param }]);
    }

    deleteObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.MA_DULIEU == serviceId);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-90", [
                        { "name": "MA_DULIEU", "value": lstObject[0].MA_DULIEU },
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
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstApiDel = objects.filter(item => item.MA_DULIEU == param);
                if (lstApiDel.length > 0) {
                    try {
                        objects = objects.filter(item => item.MA_DULIEU != param);
                        this._lstKhaiThacDuLieu.next(objects);
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
        let MA_DULIEU: any = param.MA_DULIEU;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects.findIndex(item => item.MA_DULIEU === MA_DULIEU);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstKhaiThacDuLieu.next(objects);
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
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.MA_DULIEU === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = null;
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstKhaiThacDuLieu.next(objects);
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
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.MA_DULIEU === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        objects = objects.filter(item => item.MA_DULIEU != param);
                        this._lstKhaiThacDuLieu.next(objects);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = objects[itemIndex];
                        data.SYS_ACTION = null;
                        objects[itemIndex] = data;
                        // Update the Api
                        this._object.next(objects[itemIndex]);
                        this._lstKhaiThacDuLieu.next(objects);
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

    getKhaiThacDuLieuByAll(): Observable<any> {
        // Execute the Apis loading with true
        return this._serviceService.execServiceLogin("API-86", [{ "name": "USERID", "value": null }]).pipe(
            tap((response: any) => {
                this._lstKhaiThacDuLieu.next(response.data);
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

    getAllKhaiThacDuLieuShared(userId: string): Observable<any> {
        // Execute the Apis loading with true
        return this._serviceService.execServiceLogin("API-KTDL-SHARED-GET", [{
            name: "USER_ID",
            value: userId
        }]).pipe(
            tap((response: any) => {
                this._lstKhaiThacDuLieuShared.next(response.data);
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

    getAllUserSameOrg(userId: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-KTDL-GET-ALL-USER-SAME-ORG", [
            {
                name: "USER_ID",
                value: userId
            }
        ]);
    }

    updateObjectById(id: string, data: any): Observable<any> {
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.MA_DULIEU === id);
                if (itemIndex >= 0) {
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstKhaiThacDuLieu.next(objects);
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
        return this._lstKhaiThacDuLieu.pipe(
            take(1),
            switchMap((objects: any) => {
                // Find the Api
                const object = objects.find(item => item.MA_DULIEU === id) || null;

                if (!object) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (object.SYS_ACTION != State.create && object.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((objectResult) => {
                        return objectResult.data
                    }), switchMap((apiResult) => {
                        return combineLatest([this.getBangDuLieuByAll(apiResult.MA_NHOM), this.getCotDuLieuByAll(apiResult.MA_DULIEU, apiResult.MA_BANG)]).pipe(
                            map(([lstMaNhom, lstCot]) => {
                                let lstCots: any[] = [];
                                let STT = 0;
                                if (lstCot && lstCot.status == 1 && lstCot.data.length > 0) {
                                    lstCot.data.forEach((itemInput: any) => {
                                        if (!itemInput.STT) {
                                            STT = STT + 1
                                            itemInput.STT = STT;
                                        } else {
                                            STT = itemInput.STT;
                                        }
                                        lstCots.push(itemInput);
                                    })
                                }
                                apiResult.LST_COT = lstCots;
                                let itemIndex = objects.findIndex(item => item.MA_DULIEU === id);
                                if (itemIndex >= 0) {
                                    objects[itemIndex] = apiResult;
                                    this._object.next(apiResult);
                                    this._lstKhaiThacDuLieu.next(objects);
                                    return apiResult;
                                }
                            })
                        );
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

    insertMauDuLieuShare(body: MauDuLieuShare): Observable<any> {
        return this._serviceService.execServiceLogin("API-KTDL-INSERT-SHARE",
            [
                {
                    name: "MA_DULIEU", value: body.MA_DULIEU
                }, {
                    name: "USER_ID", value: body.USERID
                }, {
                    name: "EDITABLE", value: body.EDITABLE == null ? 0 : (body.EDITABLE == 1 || body.EDITABLE ? 1 : 0)
                }, {
                    name: "SHAREABLE", value: body.SHAREABLE == null ? 0 : (body.SHAREABLE == 1 || body.SHAREABLE ? 1 : 0)
                }, {
                    name: "USER_CR_ID", value: body.USER_CR_ID
                }
            ]);
    }

    getAllSharedUsers(maDuLieu: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-KTDL-GET-SHARED-USERS",
            [
                {
                    name: "MA_DULIEU", value: maDuLieu
                }
            ]);
    }

    updateSharedRecord(body: MauDuLieuShare): Observable<any> {
        return this._serviceService.execServiceLogin("API-KTDL-UPDATE-SHARE",
            [
                {
                    name: "SHAREABLE", value: body.SHAREABLE
                },
                {
                    name: "USER_ID", value: body.USERID
                },
                {
                    name: "EDITABLE", value: body.EDITABLE
                },
                {
                    name: "MA_DULIEU", value: body.MA_DULIEU
                },
                {
                    name: "USER_MDF_ID", value: body.USER_MDF_ID
                }
            ]);
    }

    deleteSharedRecord(maDuLieu: string, userId: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-KTDL-DELETE-SHARE",
            [
                {
                    name: "USER_ID", value: userId
                },
                {
                    name: "MA_DULIEU", value: maDuLieu
                }
            ]);
    }

    insertMauDuLieuCopy(maDuLieu: string, userId: string, userCreateId: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-KTDL-INSERT-COPY", [
            { "name": "USER_ID", "value": userId },
            { "name": "MA_DULIEU", "value": maDuLieu },
            { "name": "USER_CR_ID", "value": userCreateId }
        ]);
    }

    insertOrUpdateMauDuLieuOrd(maDuLieu: string, userId: string, ord: any): Observable<any> {
        return this._serviceService.execServiceLogin('API-KTDL-ORDER-MAUDULIEU-USER', [
            { "name": "USER_ID", "value": userId },
            { "name": "MA_DULIEU", "value": maDuLieu },
            { "name": "STT", "value": ord }
        ]);
    }
}

