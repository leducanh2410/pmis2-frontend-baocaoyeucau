import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from "rxjs/operators";
import { Router } from '@angular/router';

@Injectable()
export class ErrorCatchingInterceptor implements HttpInterceptor {

    constructor(
        private _router: Router
    ) {
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request)
            .pipe(
                map(res => {
                    //console.log("Passed through the interceptor in response");
                    return res
                }),
                catchError((error: HttpErrorResponse) => {
                    switch(error.status.toString())
                    {
                        case "401":
                            this._router.navigate(['401-not-found']);
                            break;
                        case "409":
                            this._router.navigate(['sign-in']);
                            break;
                        default:
                            this._router.navigate(['405-not-found']);
                            break;
                    }                    
                    return throwError(error.message);
                })
            )
    }
}