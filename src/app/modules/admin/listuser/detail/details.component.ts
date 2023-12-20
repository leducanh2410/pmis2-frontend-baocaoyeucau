import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { FormArray, FormControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { FunctionService } from 'app/core/function/function.service';
import { ListUserService } from '../listuser.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import ShortUniqueId from 'short-unique-id';
import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragHandle } from '@angular/cdk/drag-drop';


@Component({
    selector: 'api-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class ListUserDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild("MatTableDetail", { static: false }) matTableDetail: MatTable<any>;

    public StateEnum = State;
    labelColors: any;
    obj: any;
    listTITLE: any[];
    listOffice: any[];
    listDomain: any[];
    displayedColumns: string[] = ['STT', 'TEN_COT', 'MO_TA', 'KIEU_DLIEU', 'USER_CR_ID', 'USER_CR_DTIME'];
    displayedColumnsInput: string[] = ['STT', 'TEN_COT', 'MO_TA', 'MA_KIEU_DLIEU', 'ACTION'];
    dialogForm: UntypedFormGroup;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    /**
     * Constructor
     */
    constructor(
        private _listUserService: ListUserService,
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
        return this.obj?.SYS_ACTION == State.create || this.obj?.SYS_ACTION == State.edit;
    }

    get viewMode(): Boolean {
        return this.obj?.SYS_ACTION != State.create && this.obj?.SYS_ACTION != State.edit;
    }
    get inputMode(): Boolean {
        return this.obj?.SYS_ACTION == State.create || this.obj?.SYS_ACTION == State.edit;
    }
    get actionCreate(): Boolean {
        return this.authInsert;
    }
    get actionDelete(): Boolean {
        return this.authDelete && this.obj?.SYS_ACTION != State.create
    }
    get actionEdit(): Boolean {
        return this.authEdit && (!this.obj?.SYS_ACTION);
    }
    get actionEditDetail(): Boolean {
        return (this.obj?.SYS_ACTION == State.create || this.obj?.SYS_ACTION == State.edit);
    }
    get actionDeleteDetail(): Boolean {
        return (this.obj?.SYS_ACTION == State.create || this.obj?.SYS_ACTION == State.edit);
    }
    get actionSave(): Boolean {

        return (this.obj?.SYS_ACTION == State.create || this.obj?.SYS_ACTION == State.edit)
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
        this._listUserService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((obj: any) => {
                this.obj = obj;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        USERID: [{ value: obj?.USERID, disabled: obj?.SYS_ACTION == State.create ? false : true }, [Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_.]*")]],
                        USERNAME: [obj?.USERNAME, [Validators.required, Validators.maxLength(250)]],
                        PASSWORD: [obj?.PASSWORD, obj?.SYS_ACTION == State.create ? [Validators.required, Validators.maxLength(50)] : [Validators.maxLength(50)]],
                        DESCRIPT: [obj?.DESCRIPT, [Validators.required, Validators.maxLength(250)]],
                        MOBILE: [obj?.MOBILE, [Validators.maxLength(12), Validators.pattern("[0-9]*")]],
                        EMAIL: [obj?.EMAIL, [Validators.maxLength(150)]],
                        OFFICEID: [obj?.OFFICEID, [Validators.maxLength(50)]],
                        USERID_DOMAIN: [obj?.USERID_DOMAIN, [Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_.]*")]],
                        DOMAINID: [obj?.DOMAINID, [Validators.maxLength(50)]],
                        ENABLE: [obj?.ENABLE,],
                        LST_TITLE: [obj?.LST_TITLE,]
                    });

                    this.dialogForm.get("USERID").valueChanges.subscribe(value => {
                        obj.USERID = value;
                    })
                    this.dialogForm.get("USERNAME").valueChanges.subscribe(value => {
                        obj.USERNAME = value;
                    })
                    this.dialogForm.get("PASSWORD").valueChanges.subscribe(value => {
                        obj.PASSWORD = value;
                    })
                    this.dialogForm.get("DESCRIPT").valueChanges.subscribe(value => {
                        obj.DESCRIPT = value;
                    })
                    this.dialogForm.get("MOBILE").valueChanges.subscribe(value => {
                        obj.MOBILE = value;
                    })
                    this.dialogForm.get("EMAIL").valueChanges.subscribe(value => {
                        obj.EMAIL = value;
                    })
                    this.dialogForm.get("OFFICEID").valueChanges.subscribe(value => {
                        obj.OFFICEID = value;
                    })
                    this.dialogForm.get("USERID_DOMAIN").valueChanges.subscribe(value => {
                        obj.USERID_DOMAIN = value;
                    })
                    this.dialogForm.get("DOMAINID").valueChanges.subscribe(value => {
                        obj.DOMAINID = value;
                    })
                    this.dialogForm.get("ENABLE").valueChanges.subscribe(value => {
                        obj.ENABLE = value;
                    })
                    this.dialogForm.get("LST_TITLE").valueChanges.subscribe(value => {
                        obj.LST_TITLE = value;
                    })
                }
            });
        //Chi tiet dau vao

        this._listUserService.ObjectListDomain$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstDomain: any[]) => {
                this.listDomain = lstDomain;

            });
        this._listUserService.ObjectListOffice$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listOffice: any[]) => {
                this.listOffice = listOffice;
            });

        this._listUserService.ObjectListTITLE$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listTITLE: any[]) => {
                this.listTITLE = listTITLE;
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
            if (this.obj?.SYS_ACTION == State.create) {
                this.authInsertFromServer.subscribe((auth) => {
                    if (auth) {
                        this._listUserService.createObjectToServer(this.obj?.USERID_KEY).pipe(takeUntil(this._unsubscribeAll))
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
                                        this._messageService.showErrorMessage("Thông báo", "Tên đăng nhập đã tồn tại trong hệ thống");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._listUserService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._listUserService.updateApiById(this.obj?.USERID_KEY, resultApi.data).subscribe(() => {
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
            if (this.obj?.SYS_ACTION == State.edit) {
                this.authEditFromServer.subscribe((auth) => {
                    if (auth) {
                        this._listUserService.editObjectToServer(this.obj?.USERID_KEY).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case 100:
                                        this._messageService.showWarningMessage("Thông báo", "Đã ghi dữ liệu thành công, tuy nhiên một số cột không thể xóa do đã được sử dụng");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy người dùng hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case 1:
                                        this._listUserService.viewObject(this.obj?.USERID_KEY).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.obj?.USERID_KEY], { relativeTo: this._activatedRoute.parent });
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
                this._listUserService.editObject({ "USERID": this.obj?.USERID_KEY, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy người dùng cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }
    onCancelObject(): void {
        this._listUserService.cancelObject(this.obj?.USERID_KEY)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._listUserService.viewObject(this.obj?.USERID_KEY).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.obj?.USERID_KEY], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa người dùng \"" + this.obj.USERNAME + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.obj?.SYS_ACTION == State.create) {
                        this._listUserService.deleteObject(this.obj?.USERID_KEY)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy người dùng cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa người dùng");
                                        break;
                                }

                            });
                    } else {
                        this._listUserService.deleteObjectToServer(this.obj?.USERID_KEY)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._listUserService.deleteObject(this.obj?.USERID_KEY)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa người dùng thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy người dùng cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa người dùng");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy người dùng cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa người dùng");
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
