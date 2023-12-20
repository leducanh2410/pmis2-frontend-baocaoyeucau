import { BehaviorSubject, Observable } from "rxjs";

export declare interface BaseDetailService {
    _object: BehaviorSubject<any>;
    get Object$(): Observable<any>;
    resetObject(): Observable<boolean>;
    createObject(param: any): Observable<any>;
    createObjectToServer(param: any): Observable<any>;
    getObjectfromServer(param: any): Observable<any>
    deleteObject(param: any): Observable<any>;
    cancelObject(param: any): Observable<any>;
}