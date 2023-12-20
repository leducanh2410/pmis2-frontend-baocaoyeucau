import { TestBed } from '@angular/core/testing';

import { HttpXsrfInterceptor } from './http-xsrf.interceptor';

describe('HttpXsrfInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      HttpXsrfInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: HttpXsrfInterceptor = TestBed.inject(HttpXsrfInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
