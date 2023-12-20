import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { FunctionService } from 'app/core/function/function.service';
import { NguonDuLieuService } from '../nguondulieu.service';


@Component({
    selector: 'component-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class NguonDuLieuDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild('infoDetailsPanelOrigin')
    public StateEnum = State;
    object: any;
    dialogForm: UntypedFormGroup;
    /**
     * Constructor
     */
    constructor(
        private _nguondulieuService: NguonDuLieuService,
        private _formBuilder: UntypedFormBuilder,
        public _activatedRoute: ActivatedRoute,
        public _router: Router,
        public _functionService: FunctionService,
        public _userService: UserService,
        public _messageService: MessageService
    ) {
        super(_activatedRoute, _router, _functionService, _userService, _messageService);
    }

    get actionCancel(): Boolean {
        return this.object?.SYS_ACTION == State.create || this.object?.SYS_ACTION == State.edit;
    }

    get viewMode(): Boolean {
        return this.object?.SYS_ACTION != State.create && this.object?.SYS_ACTION != State.edit;
    }
    get inputMode(): Boolean {
        return this.object?.SYS_ACTION == State.create || this.object?.SYS_ACTION == State.edit;
    }
    get actionCreate(): Boolean {
        return this.authInsert;
    }
    get actionDelete(): Boolean {
        return this.authDelete && this.object?.SYS_ACTION != State.create
    }
    get actionCheckConnect(): Boolean {
        return this.object;
    }
    get actionEdit(): Boolean {
        return this.authEdit && (!this.object?.SYS_ACTION);
    }
    get actionSave(): Boolean {

        return (this.object?.SYS_ACTION == State.create || this.object?.SYS_ACTION == State.edit)
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void {
        super.ngOnInit()

        // Chi tiet API
        this._nguondulieuService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((object: any) => {
                this.object = object;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        TEN_KETNOI: [object?.TEN_KETNOI, [Validators.required, Validators.maxLength(250)]],
                        IP: [object?.IP, [Validators.required, Validators.maxLength(50)]],
                        PORT: [object?.PORT, [Validators.required, Validators.maxLength(50)]],
                        TEN_DANG_NHAP: [object?.TEN_DANG_NHAP, [Validators.required, Validators.maxLength(50)]],
                        MAT_KHAU: [object?.MAT_KHAU, this.object?.SYS_ACTION == State.edit ? null : [Validators.required, Validators.maxLength(50)]],
                        TEN_CSDL: [object?.TEN_CSDL, [Validators.required, Validators.maxLength(50)]],

                    });

                    this.dialogForm.get("TEN_KETNOI").valueChanges.subscribe(value => {
                        object.TEN_KETNOI = value;
                    })
                    this.dialogForm.get("IP").valueChanges.subscribe(value => {
                        object.IP = value;
                    })
                    this.dialogForm.get("PORT").valueChanges.subscribe(value => {
                        object.PORT = value;
                    })
                    this.dialogForm.get("TEN_DANG_NHAP").valueChanges.subscribe(value => {
                        object.TEN_DANG_NHAP = value;
                    })
                    this.dialogForm.get("MAT_KHAU").valueChanges.subscribe(value => {
                        object.MAT_KHAU = value;
                    })
                    this.dialogForm.get("TEN_CSDL").valueChanges.subscribe(value => {
                        object.TEN_CSDL = value;
                    })
                }
            });

    }
    onCreateObject(): void {
        throw new Error('Method not implemented.');
    }
    onSaveObject() {

        if (!this.dialogForm.valid) {
            this.dialogForm.markAllAsTouched();
            this._messageService.showWarningMessage("Thông báo", "Thông tin bạn nhập chưa đủ hoặc không hợp lệ");
        } else {
            if (this.object?.SYS_ACTION == State.create) {
                this.authInsertFromServer.subscribe((auth) => {
                    if (auth) {
                        this._nguondulieuService.createObjectToServer(this.object?.MA_KETNOI).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._nguondulieuService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._nguondulieuService.updateObjectById(this.object?.MA_KETNOI, resultApi.data).subscribe(() => {
                                                    this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                                    this._router.navigated = false;
                                                    this._router.navigate([result], { relativeTo: this._activatedRoute.parent });
                                                })

                                            })

                                        } else {
                                            this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        }
                                        break;
                                }
                            })
                    } else {
                        this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
                    }
                })

            }
            if (this.object?.SYS_ACTION == State.edit) {
                this.authEditFromServer.subscribe((auth) => {
                    if (auth) {
                        this._nguondulieuService.editObjectToServer(this.object?.MA_KETNOI).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nguồn dữ liệu hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case 1:
                                        this._nguondulieuService.viewObject(this.object?.MA_KETNOI).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.MA_KETNOI], { relativeTo: this._activatedRoute.parent });
                                        })
                                        break;
                                    default:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                }
                            })
                    } else {
                        this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
                    }
                })
            }

        }
    }
    onEditObject() {
        this.authEditFromServer.subscribe((auth) => {
            if (auth) {
                this._nguondulieuService.editObject({ "MA_KETNOI": this.object?.MA_KETNOI, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nguồn dữ liệu cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }
    onCheckConnectObject(): void {
        this._nguondulieuService.checkConnectObject(this.object?.MA_KETNOI)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                switch (result) {
                    case 1:
                        this._messageService.showSuccessMessage("Thông báo", "Kết nối nguồn dữ liệu thành công");
                        break;
                    case -1:
                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nguồn dữ liệu");
                        break;
                    case -2:
                        this._messageService.showErrorMessage("Thông báo", "Tham số đầu vào không đúng");
                        break;
                    case -4:
                        this._messageService.showErrorMessage("Thông báo", "Không kết nối được tới nguồn dữ liệu");
                        break;
                    case -5:
                        this._messageService.showErrorMessage("Thông báo", "Sai tên đăng nhập hoặc mật khẩu");
                        break;
                    case -6:
                        this._messageService.showErrorMessage("Thông báo", "Tên cơ sở dữ liệu không tồn tại");
                        break;
                    case 0:
                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi trong quá trình thực hiện");
                        break;
                }
            });
    }
    onCancelObject(): void {
        this._nguondulieuService.cancelObject(this.object?.MA_KETNOI)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._nguondulieuService.viewObject(this.object?.MA_KETNOI).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.MA_KETNOI], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa nguồn dữ liệu \"" + this.object.TEN_KETNOI + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._nguondulieuService.deleteObject(this.object?.MA_KETNOI)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nguồn dữ liệu thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nguồn dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nguồn dữ liệu");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Nguồn dữ liệu đã sử dụng nên ko thể xóa");
                                        break;
                                }

                            });
                    } else {
                        this._nguondulieuService.deleteObjectToServer(this.object?.MA_KETNOI)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._nguondulieuService.deleteObject(this.object?.MA_KETNOI)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nguồn dữ liệu thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nguồn dữ liệu cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nguồn dữ liệu");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nguồn dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nguồn dữ liệu");
                                        break;
                                }

                            });
                    }
                });
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        }
        );

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current folder
     */
    getCurrentFolder(): any {
        return this._activatedRoute.snapshot.paramMap.get('group');
    }

    /**
     * Move to folder
     *
     * @param folderSlug
     */



    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
