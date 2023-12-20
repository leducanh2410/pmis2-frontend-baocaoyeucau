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
export class NguonDuLieuService extends BaseService implements BaseDetailService {
    selectedObjectChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    //private _category: BehaviorSubject<ApiCategory> = new BehaviorSubject(null);
    private _lstNguonDuLieu: BehaviorSubject<any[]> = new BehaviorSubject(null);
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
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let objectItem = {
                    "USER_CR_ID": userId,
                    "PORT": "1433",
                    "USER_CR_DTIME": null, "MA_KETNOI": uid.stamp(10),
                    "SYS_ACTION": State.create
                };
                objects.push(objectItem);
                this._lstNguonDuLieu.next(objects);
                this._object.next(objectItem);
                return objectItem.MA_KETNOI;
            }),
            switchMap((objects) => {
                return of(objects);
            })
        );

    }
    editObjectToServer(param: any): Observable<any> {
        let maKetNoi: string = param;
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.MA_KETNOI == maKetNoi);
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
                    return this._serviceService.execServiceLogin("API-22", [
                        { "name": "IP", "value": lstObject[0].IP },
                        { "name": "PORT", "value": lstObject[0].PORT },
                        { "name": "MA_KETNOI", "value": lstObject[0].MA_KETNOI },
                        { "name": "MAT_KHAU", "value": lstObject[0].MAT_KHAU },
                        { "name": "TEN_CSDL", "value": lstObject[0].TEN_CSDL },
                        { "name": "TEN_DANG_NHAP", "value": lstObject[0].TEN_DANG_NHAP },
                        { "name": "TEN_KETNOI", "value": lstObject[0].TEN_KETNOI },
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

        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstObjectAddNew = objects.filter(item => item.MA_KETNOI == serviceId);
                return lstObjectAddNew;
            }),
            switchMap((lstObjectAddNew: any) => {
                if (lstObjectAddNew.length > 0) {
                    return this._serviceService.execServiceLogin("API-21", [
                        { "name": "IP", "value": lstObjectAddNew[0].IP },
                        { "name": "PORT", "value": lstObjectAddNew[0].PORT },
                        { "name": "MAT_KHAU", "value": lstObjectAddNew[0].MAT_KHAU },
                        { "name": "TEN_CSDL", "value": lstObjectAddNew[0].TEN_CSDL },
                        { "name": "TEN_DANG_NHAP", "value": lstObjectAddNew[0].TEN_DANG_NHAP },
                        { "name": "TEN_KETNOI", "value": lstObjectAddNew[0].TEN_KETNOI },
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
        return this._serviceService.execServiceLogin("API-20", [{ "name": "MA_KETNOI", "value": param }]);
    }
    deleteObjectToServer(param: any): Observable<any> {
        let serviceId: string = param;
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstObject = objects.filter(item => item.MA_KETNOI == serviceId);
                return lstObject;
            }),
            switchMap((lstObject: any) => {
                if (lstObject.length > 0) {
                    return this._serviceService.execServiceLogin("API-23", [
                        { "name": "MA_KETNOI", "value": lstObject[0].MA_KETNOI },
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
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                let lstApiDel = objects.filter(item => item.MA_KETNOI == param);
                if (lstApiDel.length > 0) {
                    try {
                        objects = objects.filter(item => item.MA_KETNOI != param);
                        this._lstNguonDuLieu.next(objects);
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
        let MA_KETNOI: any = param.MA_KETNOI;
        let USER_MDF_ID: any = param.USER_MDF_ID;
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                // Find the Api
                let itemIndex = objects.findIndex(item => item.MA_KETNOI === MA_KETNOI);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = State.edit;
                    data.USER_MDF_ID = USER_MDF_ID
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstNguonDuLieu.next(objects);
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
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.MA_KETNOI === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    data.SYS_ACTION = null;
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstNguonDuLieu.next(objects);
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
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.MA_KETNOI === param);
                if (itemIndex >= 0) {
                    let data = objects[itemIndex];
                    if (data.SYS_ACTION == State.create) {
                        objects = objects.filter(item => item.MA_KETNOI != param);
                        this._lstNguonDuLieu.next(objects);
                        this._object.next(null);
                        return 0;
                    };
                    if (data.SYS_ACTION == State.edit) {
                        let data = objects[itemIndex];
                        data.SYS_ACTION = null;
                        objects[itemIndex] = data;
                        // Update the Api
                        this._object.next(objects[itemIndex]);
                        this._lstNguonDuLieu.next(objects);
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
    checkConnectObject(param: any): Observable<any> {
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {
                let itemIndex = objects.findIndex(item => item.MA_KETNOI === param);
                if (itemIndex >= 0) {
                    return objects[itemIndex];
                } else {
                    return null;
                }
            }),
            switchMap((object: any) => {
                if (object) {
                    return this._serviceService.execServiceNoLogin("APIC-NL-1", [
                        { "name": "MA_KETNOI", "value": object.MA_KETNOI },
                        { "name": "IP", "value": object.IP },
                        { "name": "PORT", "value": object.PORT },
                        { "name": "TEN_DANG_NHAP", "value": object.TEN_DANG_NHAP },
                        { "name": "MAT_KHAU", "value": object.MAT_KHAU },
                        { "name": "TEN_CSDL", "value": object.TEN_CSDL }
                    ]).pipe(map((response: any) => {
                        return response.status;
                    }));
                } else { return -1 }
            })
        );
    }



    get lstNguonDuLieu$(): Observable<any[]> {
        return this._lstNguonDuLieu.asObservable();
    }


    get Object$(): Observable<any> {
        return this._object.asObservable();
    }



    getNguonDuLieuByAll(): Observable<any> {
        // Execute the Apis loading with true


        return this._serviceService.execServiceLogin("API-19", null).pipe(
            tap((response: any) => {
                this._lstNguonDuLieu.next(response.data);
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
    getNguonDuLieuBySearch(txtSearch): Observable<any> {

        return this._serviceService.execServiceLogin("API-24", [{ "name": "TEXT_SEARCH", "value": txtSearch }]).pipe(
            tap((response: any) => {
                this._lstNguonDuLieu.next(response.data);
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
        return this._lstNguonDuLieu.pipe(
            take(1),
            map((objects) => {

                // Find the Api
                let itemIndex = objects.findIndex(item => item.MA_KETNOI === id);
                if (itemIndex >= 0) {
                    objects[itemIndex] = data;
                    // Update the Api
                    this._object.next(objects[itemIndex]);
                    this._lstNguonDuLieu.next(objects);
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
        return this._lstNguonDuLieu.pipe(
            take(1),
            switchMap((objects: any) => {
                // Find the Api
                const object = objects.find(item => item.MA_KETNOI === id) || null;

                if (!object) {
                    return throwError('Could not found Object with id of ' + id + '!');
                }
                //Trường hợp đang trong quá trình thêm mới và chỉnh sửa thì lấy dữ liệu local, những trường hợp khác lấy từ server
                if (object.SYS_ACTION != State.create && object.SYS_ACTION != State.edit) {
                    return this.getObjectfromServer(id).pipe(map((objectResult) => {
                        let itemIndex = objects.findIndex(item => item.MA_KETNOI === id);
                        if (itemIndex >= 0) {
                            objects[itemIndex] = objectResult.data;
                            this._object.next(objectResult.data);
                            this._lstNguonDuLieu.next(objects);
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
