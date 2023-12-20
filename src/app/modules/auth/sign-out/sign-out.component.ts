import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil, takeWhile, tap, timer } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { MessageService } from 'app/shared/message.services';
import { DeviceDetectorService } from 'ngx-device-detector';
@Component({
    selector: 'auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
    countdown: number = 5;
    countdownMapping: any = {
        '=1': '# giây',
        'other': '# giây'
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
        private _messageService: MessageService,
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
        // Sign out

        this._authService.signOut(this._deviceDetectorService.deviceType)
            .subscribe((status: Boolean) => {
                if (status) {
                    timer(1000, 1000)
                        .pipe(
                            finalize(() => {
                                this._router.navigate(['sign-in']);
                            }),
                            takeWhile(() => this.countdown > 0),
                            takeUntil(this._unsubscribeAll),
                            tap(() => this.countdown--)
                        )
                        .subscribe();
                } else {
                    this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện thoát khỏi hệ thống")
                }
            })
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
