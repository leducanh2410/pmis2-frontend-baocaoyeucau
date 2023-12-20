import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import { ApiService } from 'app/modules/admin/api/listapi/api.service';
import { labelColorDefs } from 'app/modules/admin/api/listapi/api.constants';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { FunctionService } from 'app/core/function/function.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';


@Component({
    selector: 'api-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class ApiDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    displayedColumns: string[] = ['FUNCTIONID', 'FUNCTIONNAME', 'ENABLE', 'ISPUPLIC', 'USER_CR_ID', 'USER_CR_DTIME'];
    public StateEnum = State;
    groups: any[];
    labelColors: any;
    api: any;
    apiInputs: any[];
    lstApiInputs: any[];
    public filteredlstApiInputs: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    lstApiOutputs: any[];
    lstApiTypes: any[];

    dialogForm: UntypedFormGroup;
    codeMirrorOptions: any = {
        mode: "text/x-mysql",
        indentWithTabs: true,
        smartIndent: true,
        lineNumbers: true,
        lineWrapping: false,
        extraKeys: { "Ctrl-Space": "autocomplete" },
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        autoCloseBrackets: true,
        matchBrackets: true,
        lint: true
    };
    /**
     * Constructor
     */
    constructor(
        private _apiService: ApiService,
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
        return this.api?.SYS_ACTION == State.create || this.api?.SYS_ACTION == State.edit;
    }

    get viewMode(): Boolean {
        return this.api?.SYS_ACTION != State.create && this.api?.SYS_ACTION != State.edit;
    }
    get inputMode(): Boolean {
        return this.api?.SYS_ACTION == State.create || this.api?.SYS_ACTION == State.edit;
    }
    get actionCreate(): Boolean {
        return this.authInsert;
    }
    get actionDelete(): Boolean {
        return this.authDelete && this.api?.SYS_ACTION != State.create && !this.api.IS_SYS
    }
    get actionEdit(): Boolean {
        return this.authEdit && (!this.api?.SYS_ACTION && !this.api.IS_SYS);
    }
    get actionSave(): Boolean {

        return (this.api?.SYS_ACTION == State.create || this.api?.SYS_ACTION == State.edit) && !this.api.IS_SYS
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */

    ngOnInit(): void {
        super.ngOnInit()
        this.labelColors = labelColorDefs;

        // Nhom
        this._apiService.group$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((groups: any[]) => {
                this.groups = groups;
            });

        // Chi tiet API
        this._apiService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((api: any) => {
                this.api = api;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        API_SERVICE_DESC: [api?.API_SERVICE_DESC, [Validators.required, Validators.maxLength(250)]],
                        API_SERVICE_TYPEID: [api?.API_SERVICE_TYPEID, [Validators.required]],
                        API_SERVICE_LST_INPUTID: [api?.API_SERVICE_LST_INPUTID],
                        API_SERVICE_LST_INPUTIDFilter: [],
                        API_SERVICE_OUTPUTID: [api?.API_SERVICE_OUTPUTID, [Validators.required]],
                        IS_PUBLIC: [api?.IS_PUBLIC],
                        IS_LOGIN: [api?.IS_LOGIN],
                        API_SERVICE_DATA: [api?.API_SERVICE_DATA, [Validators.required]],

                    });

                    this.dialogForm.controls.API_SERVICE_LST_INPUTIDFilter.valueChanges
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe(() => {
                            this.filterApiInputs();
                        });
                    this.dialogForm.get("API_SERVICE_DESC").valueChanges.subscribe(value => {
                        api.API_SERVICE_DESC = value;
                    })
                    this.dialogForm.get("API_SERVICE_TYPEID").valueChanges.subscribe(value => {
                        api.API_SERVICE_TYPEID = value;
                    })
                    this.dialogForm.get("API_SERVICE_LST_INPUTID").valueChanges.subscribe(value => {
                        api.API_SERVICE_LST_INPUTID = value;
                    })
                    this.dialogForm.get("API_SERVICE_OUTPUTID").valueChanges.subscribe(value => {
                        api.API_SERVICE_OUTPUTID = value;
                    })
                    this.dialogForm.get("IS_PUBLIC").valueChanges.subscribe(value => {
                        api.IS_PUBLIC = value;
                    })
                    this.dialogForm.get("IS_LOGIN").valueChanges.subscribe(value => {
                        api.IS_LOGIN = value;
                    })
                    this.dialogForm.get("API_SERVICE_DATA").valueChanges.subscribe(value => {
                        api.API_SERVICE_DATA = value;
                    })
                }
            });
        //Chi tiet dau vao
        this._apiService.LstApiOutputs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstApiOutputs: any[]) => {
                this.lstApiOutputs = lstApiOutputs;

            });

        this._apiService.ApiInput$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((apiInputs: any[]) => {
                this.apiInputs = apiInputs;

            });

        this._apiService.LstApiTypes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstApiTypes: any[]) => {
                this.lstApiTypes = lstApiTypes;
            });

        this._apiService.LstApiInputs$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstApiInputs: any[]) => {
                this.lstApiInputs = lstApiInputs;
                this.filteredlstApiInputs.next(this.lstApiInputs.slice());
            });

    }
    lstColumns(lst): any {
        let columns = new MatTableDataSource<any>(lst);
        columns.sort = this.sort;
        return columns;
    };
    onCreateObject(): void {
        throw new Error('Method not implemented.');
    }
    onSaveObject() {

        if (!this.dialogForm.valid) {
            this.dialogForm.markAllAsTouched();
            this._messageService.showWarningMessage("Thông báo", "Thông tin dịch vụ bạn nhập chưa đủ");
        } else {
            if (this.api?.SYS_ACTION == State.create) {
                this.authInsertFromServer.subscribe((auth) => {
                    if (auth) {
                        this._apiService.createObjectToServer(this.api?.API_SERVICEID).pipe(takeUntil(this._unsubscribeAll))
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
                                            this._apiService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._apiService.updateApiById(this.api?.API_SERVICEID, resultApi.data).subscribe(() => {
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
            if (this.api?.SYS_ACTION == State.edit) {
                this.authEditFromServer.subscribe((auth) => {
                    if (auth) {
                        this._apiService.editObjectToServer(this.api?.API_SERVICEID).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dịch vụ hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case 1:
                                        this._apiService.viewObject(this.api?.API_SERVICEID).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.api?.API_SERVICEID], { relativeTo: this._activatedRoute.parent });
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
                this._apiService.editObject({ "API_SERVICEID": this.api?.API_SERVICEID, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dịch vụ cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }
    onCancelObject(): void {
        this._apiService.cancelObject(this.api?.API_SERVICEID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._apiService.viewObject(this.api?.API_SERVICEID).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.api?.API_SERVICEID], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa dịch vụ \"" + this.api.API_SERVICE_DESC + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.api?.SYS_ACTION == State.create) {
                        this._apiService.deleteObject(this.api?.API_SERVICEID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa dịch vụ thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dịch vụ cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa dịch vụ");
                                        break;
                                }

                            });
                    } else {
                        this._apiService.deleteObjectToServer(this.api?.API_SERVICEID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._apiService.deleteObject(this.api?.API_SERVICEID)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa dịch vụ thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dịch vụ cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa dịch vụ");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dịch vụ cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa dịch vụ");
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
    protected filterApiInputs() {
        if (!this.lstApiInputs) {
            return;
        }
        // get the search keyword
        let search = this.dialogForm.controls.API_SERVICE_LST_INPUTIDFilter.value;
        if (!search) {
            this.filteredlstApiInputs.next(this.lstApiInputs.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredlstApiInputs.next(
            this.lstApiInputs.filter(obj => obj.API_SERVICE_INPUTNAME.toLowerCase().indexOf(search) > -1)
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

    moveToFolder(groupid: string): void {
        // Find the folder details
        const group = this.groups.find(item => item.API_SERVICE_GROUPID === groupid);

        // Return if the current folder of the mail
        // is already equals to the given folder
        if (this.api.API_SERVICE_GROUPID === group.API_SERVICE_GROUPID) {
            return;
        }

        // Update the mail object
        this.api.API_SERVICE_GROUPID = group.API_SERVICE_GROUPID;

        // Update the mail on the server
        //this._apiService.updateGroup(this.api.API_SERVICE_GROUPID, {group: this.api.API_SERVICE_GROUPID}).subscribe();

        // Navigate to the parent
        this._router.navigate(['../'], { relativeTo: this._activatedRoute.parent });
    }

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
