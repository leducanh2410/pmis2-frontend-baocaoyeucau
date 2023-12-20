import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { ApiInputService } from '../listapiinput.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';


@Component({
    selector: 'component-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class ApiInputDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild(MatSort, { static: false }) sort: MatSort;


    public StateEnum = State;
    object: any;
    dialogForm: UntypedFormGroup;
    displayedColumns: string[] = ['API_SERVICEID', 'API_SERVICE_DESC', 'USER_CR_ID', 'USER_CR_DTIME'];
    /**
     * Constructor
     */
    constructor(
        private _listapiinputService: ApiInputService,
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
        this._listapiinputService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((object: any) => {
                this.object = object;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        API_SERVICE_INPUTNAME: [object?.API_SERVICE_INPUTNAME, [Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_]*")]],
                        API_SERVICE_INPUTDESC: [object?.API_SERVICE_INPUTDESC, [Validators.required, Validators.maxLength(250)]],
                        API_SERVICE_INPUT_TYPEID: [object?.API_SERVICE_INPUT_TYPEID, [Validators.required, Validators.maxLength(50)]],
                        DEFAULT_VALUE_SYSTEM: [object?.DEFAULT_VALUE_SYSTEM, [Validators.required]],
                        DEFAULT_VALUE_NAME: [{ value: object?.DEFAULT_VALUE_NAME, disabled: object?.DEFAULT_VALUE_SYSTEM ? false : true }, [Validators.required, Validators.maxLength(50)]]
                    });

                    this.dialogForm.get("API_SERVICE_INPUTNAME").valueChanges.subscribe(value => {
                        object.API_SERVICE_INPUTNAME = value;
                    })
                    this.dialogForm.get("API_SERVICE_INPUTDESC").valueChanges.subscribe(value => {
                        object.API_SERVICE_INPUTDESC = value;
                    })
                    this.dialogForm.get("API_SERVICE_INPUT_TYPEID").valueChanges.subscribe(value => {
                        object.API_SERVICE_INPUT_TYPEID = value;
                    })
                    this.dialogForm.get("DEFAULT_VALUE_SYSTEM").valueChanges.subscribe(value => {
                        object.DEFAULT_VALUE_SYSTEM = value;
                        if (value) {
                            this.dialogForm.controls['DEFAULT_VALUE_NAME']['enable']();
                        } else {
                            this.dialogForm.controls['DEFAULT_VALUE_NAME']['disable']();
                            this.dialogForm.controls['DEFAULT_VALUE_NAME'].setValue('');
                        }
                    })
                    this.dialogForm.get("DEFAULT_VALUE_NAME").valueChanges.subscribe(value => {
                        object.DEFAULT_VALUE_NAME = value;
                    })
                }
            });

    }
    
    lstColumns(lst): any {
        let columns = new MatTableDataSource<any>();
        columns = lst;
        columns.sort = this.sort;
        return columns;
    };
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
                        this._listapiinputService.createObjectToServer(this.object?.API_SERVICE_INPUTID).pipe(takeUntil(this._unsubscribeAll))
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
                                    case -3:
                                        this._messageService.showErrorMessage("Thông báo", "Tham số đã tồn tại trong hệ thống");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._listapiinputService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._listapiinputService.updateObjectById(this.object?.API_SERVICE_INPUTID, resultApi.data).subscribe(() => {
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
                        this._listapiinputService.editObjectToServer(this.object?.API_SERVICE_INPUTID).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy tham số hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case -3:
                                        this._messageService.showErrorMessage("Thông báo", "Tham số đã tồn tại trong hệ thống");
                                        break;
                                    case 1:
                                        this._listapiinputService.viewObject(this.object?.API_SERVICE_INPUTID).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.API_SERVICE_INPUTID], { relativeTo: this._activatedRoute.parent });
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
                this._listapiinputService.editObject({ "API_SERVICE_INPUTID": this.object?.API_SERVICE_INPUTID, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy tham số cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }

    onCancelObject(): void {
        this._listapiinputService.cancelObject(this.object?.API_SERVICE_INPUTID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._listapiinputService.viewObject(this.object?.API_SERVICE_INPUTID).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.API_SERVICE_INPUTID], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa tham số \"" + this.object.API_SERVICE_INPUTNAME + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._listapiinputService.deleteObject(this.object?.API_SERVICE_INPUTID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa tham số thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy tham số cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa tham số");
                                        break;

                                }

                            });
                    } else {
                        this._listapiinputService.deleteObjectToServer(this.object?.API_SERVICE_INPUTID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._listapiinputService.deleteObject(this.object?.API_SERVICE_INPUTID)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa tham số thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy tham số cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa tham số");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy tham số cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa tham số");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Tham số đã sử dụng nên ko thể xóa");
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
