import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpXsrfTokenExtractor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpXsrfInterceptor implements HttpInterceptor {

  constructor(
    private _tokenExtractor: HttpXsrfTokenExtractor
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const headerName = 'X-PMIS2-BCTC-XSRF-TOKEN';
    let token = this._tokenExtractor.getToken() as string;
    if (token !== null && !request.headers.has(headerName)) {
      request = request.clone({ headers: request.headers.set(headerName, token) });
    }
    return next.handle(request);
  }
}
