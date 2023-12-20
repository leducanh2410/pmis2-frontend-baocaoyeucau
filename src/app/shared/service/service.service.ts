import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize } from 'rxjs';
import { environment } from 'environments/environment';
import { MessageService } from '../message.services';
import { Router } from '@angular/router';
import { LoadingService } from 'app/core/loader/loadingservice';

@Injectable({
    providedIn: 'root'
})
export class ServiceService {

    constructor(
        private _httpClient: HttpClient,
        private _messageService: MessageService,
        private  loader: LoadingService,
        private _router: Router
    ) {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current logged in user data
     */
    execServiceNoLogin(serviceId, userParameter): any {
        let exeParameter = { "serviceId": serviceId, "parameters": userParameter };
        return this._httpClient.post<any>(environment.appAPI + 'service/execServiceNoLogin', exeParameter);
    }

    execServiceLogin(serviceId, userParameter): any {
        let exeParameter = { "serviceId": serviceId, "parameters": userParameter };
        return this._httpClient.post<any>(environment.appAPI + 'service/execServiceLogin', exeParameter);
    }
    
    execServiceLogin_withLoading(serviceId, userParameter): any {
        let exeParameter = { "serviceId": serviceId, "parameters": userParameter };
        this.loader.show()
        var kq= this._httpClient.post<any>(environment.appAPI + 'service/execServiceLogin', exeParameter).pipe(finalize(()=>{
            this.loader.hide()}));
            this.loader.hide()
            return kq;
    }

    getSeries(body: any): Observable<any> {
        return this._httpClient.post(`${environment.appAPI}chart`, body);
    }

    getBarChartSeries(body: any): Observable<any> {
        return this._httpClient.post(`${environment.appAPI}chart/bar`, body);
    }
    
    getDashboardData(dashboardId: string): Observable<any> {
        return this._httpClient.get(`${environment.appAPI}dashboard/data/${dashboardId}`);
    }

    getDataExploitation(maDuLieu: string): Observable<any> {
        return this._httpClient.get(`${environment.appAPI}dataExploitation/${maDuLieu}`);
    }

    getExcelData(maDuLieu: string): Observable<any> {
        return this._httpClient.get(`${environment.appAPI}excel/${maDuLieu}`);
    }

    getExcelDataFromDashboardChart(dashboardId: string, frame: string, position: number): Observable<any> {
        return this._httpClient.get(`${environment.appAPI}excel/dashboard?dashboardId=${dashboardId}&frame=${frame}&position=${position}`);
    }
}
