import { Injectable } from '@angular/core';
import { ServiceService } from 'app/shared/service/service.service';
import { BehaviorSubject, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { Dashboard, MODE } from './dashboard-constants';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    private _lstFrame1Charts: BehaviorSubject<any> = new BehaviorSubject([]);
    private _lstFrame2Charts: BehaviorSubject<any> = new BehaviorSubject([]);
    private _lstFrame3Charts: BehaviorSubject<any> = new BehaviorSubject([]);
    private _dashboard: BehaviorSubject<any> = new BehaviorSubject([]);
    // private _selectedIndex = new BehaviorSubject<number>(0)
    private _selectedIndex: BehaviorSubject<number> = new BehaviorSubject(0);
    
    selectedIndex$ = this._selectedIndex.asObservable();
    setSelectedIndex(index: number) {
        this._selectedIndex.next(index);
      }

    constructor(private _serviceService: ServiceService) {}

    get dashboard$(): Observable<any>{
      return this._dashboard.asObservable();
    }
    get lstFrame1Charts$(): Observable<any> {
        return this._lstFrame1Charts.asObservable();
    }

    get lstFrame2Charts$(): Observable<any> {
        return this._lstFrame2Charts.asObservable();
    }

    get lstFrame3Charts$(): Observable<any> {
        return this._lstFrame3Charts.asObservable();
    }


    setLstFrame1Charts(lstCharts: any): void {
        this._lstFrame1Charts.next(lstCharts);
    }

    setLstFrame2Charts(lstCharts: any): void {
        this._lstFrame2Charts.next(lstCharts);
    }

    setLstFrame3Charts(lstCharts: any): void {
        this._lstFrame3Charts.next(lstCharts);
    }

    getDashboardByUserId(userId: string): Observable<any> {
        return this._serviceService.execServiceLogin(
            '2EE6A1BB-19EA-4922-A2D4-AA7D52BBC13F',
            [{ name: 'USER_ID', value: userId }]
        ).pipe(
            tap((response: any) => {
                this._dashboard.next(response.data);
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

    getChartsByUserId(userId: string): Observable<any> {
        return this._serviceService.execServiceLogin(
            '4B186386-CA80-4252-8139-94EF4FA481F8',
            [{ name: 'USER_ID', value: userId }]
        );
    }

    getDashboardByDashboardId(dashboardId: string): Observable<any> {
        return this._serviceService.execServiceLogin(
            'C74C172B-7F65-4B44-A0F0-A75DC8FA76FE',
            [{ name: 'MA_DASHBOARD', value: dashboardId }]
        );

    }
    getGroupAndDuLieuByUserId(userId: string): Observable<any> {
        return this._serviceService.execServiceLogin(
            '874A6C06-CBD4-4EAA-AFBC-F7238E483475',
            [{ name: 'USER_ID', value: userId }]
        );
    }

    getGroupAndDuLieuByChartId(chartId: string): Observable<any> {
        return this._serviceService.execServiceLogin(
            '939F2669-1EF3-40B8-88CE-7A17303C7EAA',
            [{ name: 'MA_BIEUDO', value: chartId }]
        );
    }

    createDashboard(dashboard: Dashboard): Observable<any> {
        return this._serviceService.execServiceLogin('API-100', [
            { name: 'LST_CHARTS', value: dashboard.LST_CHARTS },
            { name: 'USER_ID', value: dashboard.USER_ID },
            { name: 'LAYOUT', value: dashboard.LAYOUT },
            { name: 'POSITION', value: dashboard.POSITION },
            { name: 'USER_CR_ID', value: dashboard.USER_CR_ID },
            { name: 'NAME', value:dashboard.NAME}
        ]).pipe(
            switchMap((response: any) => {
                if (!response.status) {
                    return throwError({
                        message: 'Requested page is not available!',
                        pagination: response.pagination
                    });
                }
                return this.getDashboardByUserId(dashboard.USER_ID);
            })
        );
    }

    updateDashboard(dashboard: Dashboard): Observable<any> {
        return this._serviceService.execServiceLogin(
            'F133BA48-3864-43FB-ADB9-DF7882C54DBE',
            [
                // { name: 'LST_CHARTS', value: dashboard.LST_CHARTS },
                // { name: 'ORD', value: dashboard.ORD },
                // { name: 'NAME', value: dashboard.NAME},
                // { name: 'USER_ID', value: dashboard.USER_ID },
                // { name: 'LAYOUT', value: dashboard.LAYOUT },
                // { name: 'MA_DASHBOARD', value: dashboard.MA_DASHBOARD },
                // { name: 'POSITION', value: dashboard.POSITION },
                // { name: 'ENABLE', value: dashboard.ENABLE},
                // { name: 'USER_MDF_ID', value: dashboard.USER_MDF_ID },
                { name: 'LST_CHARTS', value: dashboard.LST_CHARTS },
                { name: 'USER_ID', value: dashboard.USER_ID },
                { name: 'LAYOUT', value: dashboard.LAYOUT },
                { name: 'MA_DASHBOARD', value: dashboard.MA_DASHBOARD },
                { name: 'POSITION', value: dashboard.POSITION },
                { name: 'USER_MDF_ID', value: dashboard.USER_MDF_ID },
                { name: 'NAME', value: dashboard.NAME},
                { name: 'ENABLE', value: dashboard.ENABLE},
                { name: 'ORD', value: dashboard.ORD }
            ]
        );
    }

    deleteDashboard(dashboardId: string, userId: string): Observable<any> {
        return this._serviceService.execServiceLogin(
            'A016A693-A490-48F0-95CB-405EF0E019E1',
            [
                { name: 'MA_DASHBOARD', value: dashboardId },
                { name: 'USER_MDF_ID', value: userId },
            ]
        );
    }

    getCotDuLieuByAll(id: String, tableId: String): Observable<any> {
        // Execute the Apis loading with true
        return this._serviceService
            .execServiceLogin('API-91', [
                { name: 'MA_DULIEU', value: id },
                { name: 'MA_BANG', value: tableId },
                { name: 'USERID', value: null },
            ])
            .pipe(
                map((response: any) => {
                    return response;
                }),
                switchMap((response: any) => {
                    let objectColumn = response?.data;
                    if (
                        response.status == 1 &&
                        objectColumn &&
                        objectColumn.length > 0
                    ) {
                        return this._serviceService
                            .execServiceLogin('API-92', [
                                { name: 'MA_DULIEU', value: id },
                            ])
                            .pipe(
                                map((response: any) => {
                                    if (response.status == 1) {
                                        if (
                                            response.data &&
                                            response.data.length > 0
                                        ) {
                                            let dataColumnFilter = [];
                                            objectColumn.forEach((column) => {
                                                dataColumnFilter =
                                                    response.data.filter(
                                                        (item) =>
                                                            item.MA_COT ==
                                                            column.MA_COT
                                                    );
                                                column.LST_FILTER =
                                                    dataColumnFilter;
                                            });
                                        }
                                        response.data = objectColumn;
                                        return response;
                                    } else {
                                        return [];
                                    }
                                })
                            );
                    } else {
                        return of([]);
                    }
                })
            );
    }

    getTable(tableId: string): Observable<any> {
        return this._serviceService.execServiceLogin('API-31', [
            { name: 'MA_BANG', value: tableId },
        ]);
    }

    // Lấy dữ liệu từ server (danh sách tất cả bản ghi theo một mã khai thác nào đó)
    loadDataToServer(obj: any): Observable<any> {
        return this._serviceService.execServiceLogin('APIC-L-1', [
            { name: 'MA_BANG', value: obj.MA_BANG },
            { name: 'TEN_BANG', value: obj.TEN_BANG },
            { name: 'LST_COT_JSON', value: obj.lstCots },
            { name: 'LST_FILTER_JSON', value: obj.lstFilter },
            { name: 'PAGE_NUM', value: obj.PAGE_NUM },
            { name: 'PAGE_ROW_NUM', value: obj.PAGE_ROW_NUM },
            { name: 'USERID', value: null },
        ]);
    }

    getSeries(
        lines: string[],
        xCoordinate: string,
        categories: any[],
        dataExploitation: string
    ): Observable<any> {
        return this._serviceService.getSeries({
            lines: lines,
            xCoordinate: xCoordinate,
            categories: categories,
            dataExploitation: dataExploitation,
        });
    }

    getDashboardData(dashboardId: string): Observable<any> {
        return this._serviceService.getDashboardData(dashboardId);
    }

    getExcelDataByChartFromDashboard(
        dashboardId: string,
        frame: string,
        position: number
    ): Observable<any> {
        return this._serviceService.getExcelDataFromDashboardChart(
            dashboardId,
            frame,
            position
        );
    }
}
