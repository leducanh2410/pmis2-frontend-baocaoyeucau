import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { SPLIT_USERID_AND_PASS } from '../constants/constant';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    set refreshToken(token: string) {
        localStorage.setItem('refreshToken', token);
    }

    get refreshToken(): string {
        return localStorage.getItem('refreshToken') || '';
    }

    get orgCode(): string {
        return localStorage.getItem('orgCode')
    }

    set orgCode(orgCode: string) {
        localStorage.setItem('orgCode', orgCode);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(body: any): Observable<any> {
        let accessToken = localStorage.getItem('accessToken') || '';
        return this._httpClient.post(`${environment.appAPI}auth/change-password`, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(userId: string, password: string, deviceInfo: any): Observable<any> {
        // Before login
        // Throw error, if the user is already logged in
        // const credentials = { 'userId': userId, 'password': `${userId}${SPLIT_USERID_AND_PASS}${password}`, 'deviceInfo': deviceId };
        // if (this._authenticated) {
        //     return throwError('Bạn đã đăng nhập.');
        // }

        // return this._httpClient.post(environment.appAPI + 'auth/sign-in', credentials).pipe(
        //     switchMap((response: any) => {
        //         if (response.status) {
        //             this.accessToken = response.token;

        //             // Set the authenticated flag to true
        //             this._authenticated = true;

        //             // Store the user on the user service
        //             this._userService.user = response.userInfo;

        //             // Return a new observable with the response

        //         }
        //         return of(response);

        //     })

        // );

        if (this._authenticated) {
            return throwError('Bạn đã đăng nhập.');
        }

        // ktat login
        const credentials = {
            deviceInfo: deviceInfo,
            email: "test@gmail.com",
            expiration: 180,
            "password": password,
            "userid": userId,
            "username": userId
        }

        return this._httpClient.post(`${environment.loginBase}/auth/login`, credentials).pipe(
            switchMap((response: any) => {
                if (response.state != undefined && response.state) {
                    this.accessToken = response.data.accessToken;
                    this.refreshToken = response.data.refreshToken;
                    this.orgCode = response.data.orgCode;

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    this.getUserInfo(this.accessToken, this.orgCode);

                    // Store the user on the user service
                    // this._userService.user = response.userInfo;

                    // Return a new observable with the response
                }
                return of(response);

            })

        );
    }

    getUserInfo(accessToken: string, orgCode): void {
        // Get user info
        this._httpClient.get(`${environment.appAPI}user/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Org-Code': orgCode
            }
        }).subscribe((response1: any) => {
            if (response1.status == 1) {
                this._userService.user = response1.data;
            } else {
                
            }
        })
    }

    /**
     * Sign in using the refresh token
     */
    signInUsingToken(): Observable<any> {
        // return this._httpClient.post(environment.appAPI + 'auth/sign-in-token', {
        //     accessToken: token,            
        // }).pipe(
        //     catchError(() =>

        //         // Return false
        //         of(false)
        //     ),
        //     switchMap((response: any) => {
        //         if (response.status) {
        //             this.accessToken = response.token;
        //             this._authenticated = true;
        //             this._userService.user = response.userInfo;
        //             return of(true);
        //         } else {
        //             localStorage.removeItem('accessToken');
        //             this._authenticated = false;
        //             return of(false);
        //         }
        //     })
        // );
        let deviceId = localStorage.getItem('DEVICE_ID') || '';

        return this._httpClient.post(`${environment.loginBase}/auth/refresh`, {
            "refreshToken": this.refreshToken, 
            "expiration": 180, 
            "deviceId": deviceId,
            "orgCode": this.orgCode
        }).pipe(
            catchError(() => of(false)),
            switchMap((response: any) => {
                if (response.state) {
                    this.accessToken = response.data.accessToken;
                    this.refreshToken = response.data.refreshToken;
                    this.orgCode = response.data.orgCode;
                    this.getUserInfo(this.accessToken, this.orgCode);
                    return of(true);
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('orgCode');
                    this._authenticated = false;
                    return of(false);
                }
            })
        );
    }

    /**
     * Sign out
     */
    signOut(deviceType: string): Observable<any> {
        if (deviceType == null) {
            localStorage.clear();
            return of(true);
        }

        // if (this._authenticated) {
            let requestBody = {  
                "deviceInfo": {
                    "deviceId": localStorage.getItem("DEVICE_ID") || '',
                    "deviceType": deviceType,
                    "appId": environment.appId,
                    "appVersion": environment.appVersion,
                    "notificationToken": "string"
                }
            }              
            return this._httpClient.post(environment.loginBase + '/user/logout', requestBody, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Org-Code': `${this.orgCode}`
                }
            }).pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    if (response.state) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('orgCode');

                        // Set the authenticated flag to false
                        this._authenticated = false;

                        // Return the observable
                        return of(true);

                    } else {
                        return of(false);
                    }

                })

            );
        // } else {
        //     return of(true);
        // }
        // Remove the access token from the local storage

    }
    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    resendOTP(userId: string): Observable<any> {
        return this._httpClient.post(`${environment.loginBase}/auth/resend-otp?userId=${userId}`, {});
    }

    validateOTP(body: any): Observable<any> {
        return this._httpClient.post(`${environment.loginBase}/auth/validate-otp`, body);
    }
}
