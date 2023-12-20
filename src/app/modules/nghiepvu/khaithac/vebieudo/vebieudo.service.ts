import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { ServiceService } from 'app/shared/service/service.service';
import ShortUniqueId from 'short-unique-id';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailService } from 'app/shared/commons/BaseDetail.service';
import { BaseService } from 'app/shared/commons/base.service';
import { BCTM_BIEUDO_CHITIET } from 'app/core/constants/chart-info';


@Injectable({
    providedIn: 'root'
})
export class VeBieuDoService extends BaseService implements BaseDetailService {
    selectedObjectChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _objects: BehaviorSubject<any[]> = new BehaviorSubject(null);
    //private _lstCotDuLieu: BehaviorSubject<any[]> = new BehaviorSubject(null);
    _object: BehaviorSubject<any> = new BehaviorSubject(null);
    _objectColumn: BehaviorSubject<any> = new BehaviorSubject(null);
    private _groups: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _group: BehaviorSubject<any> = new BehaviorSubject(null);
    private _lstObjectType: BehaviorSubject<any[]> = new BehaviorSubject(null);
    private _toggle: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private _duLieuDaKhaiThac: BehaviorSubject<any> = new BehaviorSubject(null);
    private _rows: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        public _serviceService: ServiceService) {
        super(_serviceService);
    }

    get groups$(): Observable<any[]> {
        return this._groups.asObservable();
    }

    get group$(): Observable<any> {
        return this._group.asObservable();
    }

    get lstObjects$(): Observable<any[]> {
        return this._objects.asObservable();
    }

    get Object$(): Observable<any> {
        return this._object.asObservable();
    }

    get ObjectListType$(): Observable<any[]> {
        return this._lstObjectType.asObservable();
    }

    get ObjectColumn$(): Observable<any> {
        return this._objectColumn.asObservable();
    }

    get toggle$(): Observable<boolean> {
        return this._toggle.asObservable();
    }

    get duLieuDaKhaiThac$(): Observable<any> {
        return this._duLieuDaKhaiThac.asObservable();
    }

    get rows$(): Observable<any> {
        return this._rows.asObservable();
    }

    toggle(isHide: boolean): void {
        this._toggle.next(isHide);
    }
    
    setDuLieuDaKhaiThac(data: any): void {
        this._duLieuDaKhaiThac.next(data);
    }

    setRows(rows: any): void {
        this._rows.next(rows);
    }
    
    getLstObjectType(): Observable<any> {
        return this._serviceService.execServiceLogin("API-95", null).pipe(
            tap((response: any) => {
                this._lstObjectType.next(response.data);
            })
        );
    }
    getGroups(): Observable<any> {
        return this._serviceService.execServiceLogin("API-86", [{ "name": "USERID", "value": null }]).pipe(
            tap((response: any) => {
                this._groups.next(response.data);
            })
        );
    }

    getTable(tableId: string): Observable<any> {
        return this._serviceService.execServiceLogin("API-31", [{ "name": "MA_BANG", "value": tableId }]).pipe(
            map((response: any) => {
                return response.data;
            })
        )
    }

    // Lấy dữ liệu từ server (danh sách tất cả bản ghi theo một mã khai thác nào đó)
    loadDataToServer(obj: any): Observable<any> {
        return this._serviceService.execServiceLogin("APIC-L-1", [
            { "name": "MA_BANG", "value": obj.MA_BANG },
            { "name": "TEN_BANG", "value": obj.TEN_BANG },
            { "name": "LST_COT_JSON", "value": obj.lstCots },
            { "name": "LST_FILTER_JSON", "value": obj.lstFilter },
            { "name": "PAGE_NUM", "value": obj.PAGE_NUM },
            { "name": "PAGE_ROW_NUM", "value": obj.PAGE_ROW_NUM },
            { "name": "USERID", "value": null }
        ]).pipe(map((response: any) => {
            return response;
        }));
    }

    // Tạo một đối tượng biểu đồ ở local
    createObject(param: any): Observable<any> {
        let userId: string = param.userId;
        let MA_DULIEU: string = param.MA_DULIEU;
        const uid = new ShortUniqueId();
        return this._objects.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let objectItem = {
                    "USER_CR_ID": userId,
                    "USER_CR_DTIME": null, "MA_BIEUDO": uid.stamp(10),
                    "MA_DULIEU": MA_DULIEU,
                    "MA_LOAI_BIEUDO": "",
                    "TEN_COT": "",
                    "CHIEU": "doc",
                    "HIEN": "",
                    "TRUC": "",
                    "DON_VI": "",
                    "MAU_SAC": "",
                    "STT_COT": "",
                    "SYS_ACTION": State.create
                };
                objects.push(objectItem);
                this._objects.next(objects);
                this._object.next(objectItem);
                return objectItem.MA_BIEUDO;
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }

    // Gọi API cập nhật biểu đồ
    editObjectToServer(param: any): Observable<any> {
        let maKetNoi: string = param;
        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.MA_BIEUDO == maKetNoi);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-96", [
                        { "name": "MA_BIEUDO", "value": lstObject[0].MA_BIEUDO },
                        { "name": "MO_TA", "value": lstObject[0].MO_TA },
                        { "name": "MA_LOAI_BIEUDO", "value": lstObject[0].MA_LOAI_BIEUDO },
                        { "name": "CHIEU", "value": lstObject[0].CHIEU },
                        { "name": "TEN_COT", "value": lstObject[0].TEN_COT },
                        { "name": "HIEN", "value": lstObject[0].HIEN },
                        { "name": "TRUC", "value": lstObject[0].TRUC },
                        { "name": "DON_VI", "value": lstObject[0].DON_VI },
                        { "name": "MAU_SAC", "value": lstObject[0].MAU_SAC },
                        { "name": "STT_COT", "value": lstObject[0].STT_COT },
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
                                    "MA_BIEUDO_CTIET": itemInput.MA_BIEUDO_CTIET,
                                    "MA_COT": itemInput.MA_COT,
                                    "TEN_COT": itemInput.TEN_COT,
                                    "MO_TA": itemInput.MO_TA,
                                    "MA_KIEU_DLIEU": itemInput.MA_KIEU_DLIEU,
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

    // Gọi API tạo biểu đồ
    createObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;

        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.MA_BIEUDO == serviceId);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    return this._serviceService.execServiceLogin("API-97", [
                        { "name": "MA_DULIEU", "value": lstObjectAddNew[0].MA_DULIEU },
                        { "name": "MO_TA", "value": lstObjectAddNew[0].MO_TA },
                        { "name": "MA_LOAI_BIEUDO", "value": lstObjectAddNew[0].MA_LOAI_BIEUDO },
                        { "name": "CHIEU", "value": lstObjectAddNew[0].CHIEU },
                        { "name": "TEN_COT", "value": lstObjectAddNew[0].TEN_COT },
                        { "name": "HIEN", "value": lstObjectAddNew[0].HIEN },
                        { "name": "TRUC", "value": lstObjectAddNew[0].TRUC },
                        { "name": "DON_VI", "value": lstObjectAddNew[0].DON_VI },
                        { "name": "MAU_SAC", "value": lstObjectAddNew[0].MAU_SAC },
                        { "name": "STT_COT", "value": lstObjectAddNew[0].STT_COT },
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

    // Lấy thông tin 1 biểu đồ theo mã biểu đồ
    getObjectfromServer(param: any): Observable<any> {
        return this._serviceService.execServiceLogin("API-94", [{ "name": "USERID", "value": null }, { "name": "MA_BIEUDO", "value": param }]);
    }

    // Gọi API xóa biểu đồ
    deleteObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.MA_BIEUDO == serviceId);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-98", [
                        { "name": "MA_BIEUDO", "value": lstObject[0].MA_BIEUDO },
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

    // Xóa 1 đối tượng biểu đồ ở local theo mã biểu đồ
    deleteObject(param: any): Observable<any> {
        return this._objects.pipe(
            take(1),
            map((objects) => {
                let lstApiDel = objects.filter(item => item.MA_BIEUDO == param);
                if (lstApiDel.length > 0) {
                    try {
                        objects = objects.filter(item => item.MA_BIEUDO != param);
                        this._objects.next(objects);
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

    // Lấy thông tin về biểu đồ cần sửa
    editObject(param: any): Observable<any> {
        let MA_BIEUDO: any = param.MA_BIEUDO;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._objects.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects.findIndex(item => item.MA_BIEUDO === MA_BIEUDO);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._objects.next(objects);
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
        return this._objects.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.MA_BIEUDO === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = null;
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._objects.next(objects);
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
        return this._objects.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.MA_BIEUDO === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        objects = objects.filter(item => item.MA_BIEUDO != param);
                        this._objects.next(objects);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = objects[itemIndex];
                        data.SYS_ACTION = null;
                        objects[itemIndex] = data;
                        // Update the Api
                        this._object.next(objects[itemIndex]);
                        this._objects.next(objects);
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

    getVeBieuDoByAll(): Observable<any> {
        // Execute the Apis loading with true
        return this._serviceService.execServiceLogin("API-86", [{ "name": "USERID", "value": null }]).pipe(
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

    // Cập nhật thông tin của một đối tượng biểu đồ phía local
    updateObjectById(id: string, data: any): Observable<any> {
        return this._objects.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.MA_BIEUDO === id);
                if (itemIndex >= 0) {
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._objects.next(objects);
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


    getObjectById(id: string): Observable<any> {
        return this._objects.pipe(
            take(1),
            switchMap((objects: any) => {
                // Find the Api
                const object = objects.find(item => item.MA_BIEUDO === id) || null;

                if (!object) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (object.SYS_ACTION != State.create && object.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((objectResult) => {
                        return objectResult.data
                    }), switchMap((apiResult) => {
                        return combineLatest([this.getCotDuLieuByAll(apiResult.MA_BIEUDO, apiResult.MA_BANG)]).pipe(
                            map(([lstCot]) => {
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
                                let itemIndex = objects.findIndex(item => item.MA_BIEUDO === id);
                                if (itemIndex >= 0) {
                                    objects[itemIndex] = apiResult;
                                    this._object.next(apiResult);
                                    this._objects.next(objects);
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

    getObjectsByFolder(groupid: string, page: string = '1'): Observable<any> {
        // Execute the Apis loading with true
        return this._serviceService.execServiceLogin("API-93", [{ "name": "MA_DULIEU", "value": groupid }]).pipe(
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

    getGroupById(groupid: string): Observable<any> {
        return this._groups.pipe(
            take(1),
            map((groups) => {

                // Find the Group
                const group = groups.find(item => item.MA_DULIEU === groupid) || null;

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

    resetObject(): Observable<boolean> {
        return of(true).pipe(
            take(1),
            tap(() => {
                this._object.next(null);
            })
        );
    }

    getSeries(lines: string[], xCoordinate: string, categories: any[], dataExploitation: string): Observable<any> {
        return this._serviceService.getSeries({
            lines: lines,
            xCoordinate: xCoordinate,
            categories: categories,
            dataExploitation: dataExploitation
        })
    }

    getBarChartSeries(xCol: string, columns: string[], categories: any[], dataExploitation: string): Observable<any> {
        return this._serviceService.getBarChartSeries({
            xCol: xCol,
            columns: columns,
            categories: categories,
            dataExploitation: dataExploitation
        })
    }
    
    getDataExploitation(maDuLieu: string): Observable<any> {
        return this._serviceService.getDataExploitation(maDuLieu);
    }

    getExcelData(maDuLieu: string): Observable<any> {
        return this._serviceService.getExcelData(maDuLieu)
    }
}
