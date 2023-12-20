import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { FunctionService } from 'app/core/function/function.service';
import { VeBieuDoService } from '../vebieudo.service';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { FileSaverService } from 'ngx-filesaver';

@Component({
    selector: 'component-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class VeBieuDoDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild('trigger') trigger: MatAutocompleteTrigger;
    @ViewChild("MatTableColumnDetail", { static: false }) matTableColumnDetail: MatTable<any>;
    @ViewChild("MatTableColumnDetailResult", { static: false }) matTableColumnDetailResult: MatTable<any>;
    @ViewChild(MatSort, { static: false }) sort: MatSort;


    public StateEnum = State;
    object: any;
    listObjectType: any[];
    dialogForm: UntypedFormGroup;
    displayedColumnsInput: string[] = ['STT', 'MO_TA'];
    // bieuDoChiTiet: BCTM_BIEUDO_CHITIET = new BCTM_BIEUDO_CHITIET();
    eventsSubject: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _vebieudoService: VeBieuDoService,
        private _formBuilder: UntypedFormBuilder,
        public _activatedRoute: ActivatedRoute,
        public _router: Router,
        public _functionService: FunctionService,
        public _userService: UserService,
        public _messageService: MessageService,
        public _dialogMat: MatDialog,
        private fileSaverService: FileSaverService
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
        this._vebieudoService.ObjectListType$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listObjectType: any[]) => {
                this.listObjectType = listObjectType;
            });
        
        // được gọi khi có thay đổi lựa chọn xem / sửa / tạo biểu đồ
        this._vebieudoService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((sobject: any) => {
                this.object = sobject;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        MA_LOAI_BIEUDO: [sobject?.MA_LOAI_BIEUDO, [Validators.required]],
                        MO_TA: [sobject?.MO_TA, [Validators.required, Validators.maxLength(250)]]
                    });

                    this.dialogForm.get("MA_LOAI_BIEUDO").valueChanges.subscribe(value => {
                        sobject.MA_LOAI_BIEUDO = value;
                        this.eventsSubject.next(value);
                    });

                    this.dialogForm.get("MO_TA").valueChanges.subscribe(value => {
                        sobject.MO_TA = value;
                    });
                }
            });
        this.object.VALID_CHART_DATA = true;
    }

    onCreateObject(): void {
        throw new Error('Method not implemented.');
    }


    onLoadData() {
        /*this._vebieudoService.loadDataToServer(this.columnsResultDataCurrentPage, this.columnsResultDataPageSize).pipe(take(1))
            .subscribe((result: any) => {
                if (this.inputMode) {
                    this.columnsResultData = new MatTableDataSource<any>(result.data?.rowData);
                } else {
                    this.columnsResultDataView = new MatTableDataSource<any>(result.data?.rowData);
                }
                setTimeout(() => {
                    this.columnsResultDataPaginator.pageIndex = this.columnsResultDataCurrentPage;
                    this.columnsResultDataPaginator.length = result.data?.rowCount;
                });
            });*/
    }
    onSaveObject() {
        if (!this.object.VALID_CHART_DATA) {
            this._messageService.showWarningMessage('Thông báo', 'Số lượng điểm dữ liệu quá lớn khiến hệ thống tốn nhiều thời gian để xử lý');
            return;
        }
        if (!this.dialogForm.valid) {
            this.dialogForm.markAllAsTouched();
            this._messageService.showWarningMessage("Thông báo", "Thông tin bạn nhập chưa đủ hoặc không hợp lệ");
        } else {
            if (this.object?.SYS_ACTION == State.create) {
                this.authInsertFromServer.subscribe((auth) => {
                    if (auth) {
                        this._vebieudoService.createObjectToServer(this.object?.MA_BIEUDO).pipe(takeUntil(this._unsubscribeAll))
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
                                        this._messageService.showErrorMessage("Thông báo", "Loại biểu đồ không tồn tại");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._vebieudoService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._vebieudoService.updateObjectById(this.object?.MA_BIEUDO, resultApi.data).subscribe(() => {
                                                    this._messageService.showSuccessMessage("Thông báo", "Ghi biểu đồ thành công");
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
                        this._vebieudoService.editObjectToServer(this.object?.MA_BIEUDO).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy biểu đồ hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case 1:
                                        this._vebieudoService.viewObject(this.object?.MA_BIEUDO).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi biểu đồ thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.MA_BIEUDO], { relativeTo: this._activatedRoute.parent });
                                        });
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
                this._vebieudoService.editObject({ "MA_BIEUDO": this.object?.MA_BIEUDO, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy biểu đồ cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }

    onCancelObject(): void {
        this._vebieudoService.cancelObject(this.object?.MA_BIEUDO)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._vebieudoService.viewObject(this.object?.MA_BIEUDO).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.MA_BIEUDO], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa biểu đồ \"" + this.object.MO_TA + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._vebieudoService.deleteObject(this.object?.MA_BIEUDO)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa biểu đồ thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy biểu đồ cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa biểu đồ");
                                        break;

                                }

                            });
                    } else {
                        this._vebieudoService.deleteObjectToServer(this.object?.MA_BIEUDO)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._vebieudoService.deleteObject(this.object?.MA_BIEUDO)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa biểu đồ thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy biểu đồ cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa biểu đồ");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy biểu đồ cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa biểu đồ");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Mẫu biểu đồ đã sử dụng nên ko thể xóa");
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
    onOpenNhomDuLieuParentSelect() {
        setTimeout(_ => this.trigger.openPanel());
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


