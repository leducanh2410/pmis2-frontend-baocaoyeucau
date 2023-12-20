import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxCaptchaService } from '@binssoft/ngx-captcha';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { Observable, of, switchMap, takeUntil, throwError } from 'rxjs';
import * as uuid from 'uuid';
import { DeviceDetectorService, DeviceInfo } from 'ngx-device-detector';
import { environment } from 'environments/environment';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };

    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    showOTPInput: boolean = false;
    otpExpire: number = 120;
    countDownInterval: any;

    captchaStatus: number = -1;
    showCaptcha: boolean = false;

    captchaConfig: any = {
        length: 6,
        cssClass: 'custom',
        back: {
            stroke: "#2F9688",
            solid: "#f2efd2"
        },
        font: {
            color: "#000000",
            size: "35px"
        }
    };

    deviceInfoRequest: any;
    deviceInfo: DeviceInfo;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _captchaService: NgxCaptchaService,
        private _deviceDetectorService: DeviceDetectorService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            userid: ['', [Validators.required]],
            password: ['', Validators.required],
            otp: [''],
            rememberMe: ['']
        });

        let deviceId = localStorage.getItem("DEVICE_ID") || '';
        if (deviceId.length == 0) {
            deviceId = uuid.v4();
            localStorage.setItem("DEVICE_ID", deviceId);
        }
        this.deviceInfo = this._deviceDetectorService.getDeviceInfo();

        this._captchaService.captchStatus.subscribe((status) => {
            if (status != null) {
                if (status) {
                    this.captchaStatus = 1;
                } else {
                    this.captchaStatus = 0;
                }
            }
        });

        this.deviceInfoRequest = {
            deviceId: deviceId,
            deviceType: this.deviceInfo.deviceType,
            appId: environment.appId,
            appVersion: environment.appVersion,
            notificationToken: "",
            browser: this.deviceInfo.browser,
            browserVersion: this.deviceInfo.browser_version,
            operatingSystem: this.deviceInfo.os,
            osVersion: this.deviceInfo.os_version
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // TFA
        if (this.showOTPInput) {
            this._authService.validateOTP({
                otp: this.signInForm.get('otp').value,
                userId: this.signInForm.get('userid').value,
                deviceInfo: this.deviceInfoRequest
            })
                .subscribe((response: any) => {
                    if (response.status) {
                        this.callSignInAPI();
                    } else {
                        this.signInForm.enable();

                        // Reset the form
                        //this.signInNgForm.resetForm();

                        // Set the alert
                        this.alert = {
                            type: 'error',
                            message: response.message
                        };
                        this.showAlert = true;
                    }
                })
        } else {
            this.callSignInAPI();
        }
        // this.callSignInAPI(deviceId);
    }

    otpExpireCountDown(): void {
        clearInterval(this.countDownInterval);
        this.otpExpire = 120;
        this.countDownInterval = setInterval(() => {
            this.otpExpire--;
        }, 1000)
    }

    resendOTP(): void {
        this.showAlert = true;
        this.alert = {
            type: 'info',
            message: 'Đang gửi mã OTP ...'
        }
        this._authService.resendOTP(encodeURI(this.signInForm.get('userid').value))
            .subscribe((response: any) => {
                this.alert = {
                    type: response.status == 1 ? 'success' : 'error',
                    message: response.message
                }
                if (response.status) {
                    this.otpExpireCountDown();
                }
            })
    }

    callSignInAPI(): void {
        // Sign in
        this._authService.signIn(
            this.signInForm.get('userid').value, 
            this.signInForm.get('password').value, 
            this.deviceInfoRequest
        )
            .subscribe(
                {
                    next: (data) => {
                        if (data.status != undefined && !data.status) {
                            if (data?.data == "OTP") {
                                this.showOTPInput = true;
                                this.showCaptcha = false;
                                this.otpExpireCountDown();
                                this.alert = {
                                    type: 'info',
                                    message: data.message
                                }
                            } else if (data?.data == "LOGIN_ERR") {
                                if (!this.showCaptcha) {
                                    this.showCaptcha = true;   
                                }
                                this.reloadCaptcha();
                                // Set the alert
                                this.alert = {
                                    type: 'error',
                                    message: data.message
                                };
                            } else {
                                this.alert = {
                                    type: 'error',
                                    message: data.message
                                };
                            }
                            this.signInForm.enable();
                            this.showAlert = true;
                            return of(false);
                        } 

                        if (data.state != undefined && !data.state) {
                            this.alert = {
                                type: 'error',
                                message: 'Tên đăng nhập hoặc mật khẩu không chính xác'
                            };
                            this.signInForm.enable();
                            this.showAlert = true;
                            return of(false);
                        }

                        return this._authService.check()
                            .subscribe(
                                {
                                    next: (authenticated) => {

                                        // If the user is not authenticated...
                                        if (!authenticated) {
                                            this.signInForm.enable();

                                            // Reset the form
                                            // this.signInNgForm.resetForm();

                                            // Set the alert
                                            this.alert = {
                                                type: 'error',
                                                message: data.message
                                            };
                                            this.showAlert = true;

                                            // Prevent the access
                                            return of(false);
                                        }
                                        const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                                        // Navigate to the redirect url
                                        this._router.navigateByUrl(redirectURL);
                                        // Allow the access
                                        return of(true);
                                    }
                                }
                            );
                    },
                    error: (error: HttpErrorResponse) => {
                        this.signInForm.enable();
                        // Reset the form
                        //this.signInNgForm.resetForm();

                        // Set the alert
                        this.alert = {
                            type: 'error',
                            message: 'Lỗi kết nối tới máy chủ'
                        };
                        this.showAlert = true;
                    },
                },
            );
    }

    reloadCaptcha(): void {
        this.captchaStatus = -1;
        this.captchaConfig = {
            length: 6,
            cssClass: 'custom',
            back: {
                stroke: "#2F9688",
                solid: "#f2efd2"
            },
            font: {
                color: "#000000",
                size: "35px"
            }
        };
    }
}
