import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, takeUntil } from 'rxjs';
import { AbstractControl, FormArray, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { FunctionService } from 'app/core/function/function.service';
import { KhaiThacDuLieuService } from '../khaithacdulieu.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { KhaiThacDuLieuDetailsFilterDialogComponent } from './detailsfilter.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FileSaverService } from 'app/shared/service/file-saver.service';
import { FILE_TYPE } from 'app/core/constants/file-type';
import { ShareUserDialogComponent } from './share-user-dialog/share-user-dialog.component';

interface ObjectNode {
    object: any;
    children?: ObjectNode[];
}
interface ObjectFlatNode {
    expandable: boolean;
    object: string;
    level: number;
}

@Component({
    selector: 'component-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class KhaiThacDuLieuDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild('trigger') trigger: MatAutocompleteTrigger;
    @ViewChild("MatTableColumnDetail", { static: false }) matTableColumnDetail: MatTable<any>;
    @ViewChild("MatTableColumnDetailResult", { static: false }) matTableColumnDetailResult: MatTable<any>;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild(MatPaginator) columnsResultDataPaginator!: MatPaginator;

    listTable: any[];
    lstTreeListNhomDuLieuControl = new FlatTreeControl<ObjectFlatNode>(
        node => node.level,
        node => node.expandable,
    );
    ;
    private _transformer = (node: ObjectNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            object: node.object,
            level: level,
        };
    };
    lstTreeListNhomDuLieuFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );
    lstTreeListNhomDuLieu = new MatTreeFlatDataSource(this.lstTreeListNhomDuLieuControl, this.lstTreeListNhomDuLieuFlattener);

    lstTreeListNhomDuLieunHasChild = (_: number, node: ObjectFlatNode) => node.expandable;

    public StateEnum = State;
    object: any;
    dialogForm: UntypedFormGroup;
    displayedColumnsInput: string[] = ['STT', 'MO_TA', 'STATUS'];

    columnsResultData = new MatTableDataSource<any>();
    columnsResultDataView = new MatTableDataSource<any>();
    columnsResultDataTotalRows = 0;
    columnsResultDataPageSize = 100;
    columnsResultDataCurrentPage = 0;
    columnsResultDataPageSizeOptions: number[] = [5, 10, 25, 100];

    sharedObject: any;

    /**
     * Constructor
     */
    constructor(
        private _khaithacdulieuService: KhaiThacDuLieuService,
        private _formBuilder: UntypedFormBuilder,
        public _activatedRoute: ActivatedRoute,
        public _router: Router,
        public _functionService: FunctionService,
        public _userService: UserService,
        public _messageService: MessageService,
        public _dialogMat: MatDialog,
        private _fileSaverService: FileSaverService
    ) {
        super(_activatedRoute, _router, _functionService, _userService, _messageService);
    }

    get actionCancel(): Boolean {
        return this.object?.SYS_ACTION == State.create || this.object?.SYS_ACTION == State.edit;
    }
    get actionGetData(): Boolean {
        let countColumn = 0;
        this.object?.LST_COT?.forEach((obj) => {
            if (obj?.VIEW) {
                countColumn += 1;
            }
        })
        if (countColumn > 0) {
            return true;
        } else {
            return false;
        }
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
        this._khaithacdulieuService.lstNhomDuLieu$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstNhomDuLieu: any[]) => {
                let lstTreeDataNhomDuLieu: ObjectNode[] = []
                if (lstNhomDuLieu && lstNhomDuLieu.length > 0) {

                    lstNhomDuLieu.forEach((obj) => {
                        if (obj?.MA_NHOM_CHA == null) {
                            lstTreeDataNhomDuLieu.push({ object: obj, children: this.getChildObjectByParent(obj.MA_NHOM, lstNhomDuLieu) })
                        }
                    })
                    this.lstTreeListNhomDuLieu.data = lstTreeDataNhomDuLieu;
                    this.lstTreeListNhomDuLieuControl.expandAll()
                } else {
                    this.lstTreeListNhomDuLieu.data = lstTreeDataNhomDuLieu;
                }
            });
        this._khaithacdulieuService.lstBangDuLieu$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((listTable: any[]) => {
                this.listTable = listTable;
            });
        // Chi tiet API
        this._khaithacdulieuService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((sobject: any) => {
                this.object = sobject;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        MA_NHOM: [sobject?.MA_NHOM, [Validators.required]],
                        TEN_NHOM: [sobject?.TEN_NHOM, [Validators.required]],
                        MA_BANG: [sobject?.MA_BANG, [Validators.required]],
                        MO_TA: [sobject?.MO_TA, [Validators.required, Validators.maxLength(250)]],
                        LST_COTFilter: [],
                        LST_COT: this._formBuilder.array([])
                    });
                    this.setLstCotForm(sobject?.LST_COT);

                    this.dialogForm.get("MA_NHOM").valueChanges.subscribe(value => {
                        if (value && sobject.MA_NHOM != value) {
                            sobject.MA_NHOM = value;
                            this._khaithacdulieuService.getBangDuLieuByAll(sobject.MA_NHOM).subscribe();
                        }
                    })
                    this.dialogForm.get("TEN_NHOM").valueChanges.subscribe(value => {
                        sobject.TEN_NHOM = value;
                    })
                    this.dialogForm.get("MA_BANG").valueChanges.subscribe(value => {
                        sobject.MA_BANG = value;
                        if (!value) {
                            sobject.LST_COT = null;
                        } else {
                            this._khaithacdulieuService.changeTableObject({ "MA_DULIEU": sobject.MA_DULIEU, "MA_BANG": value }).subscribe();
                        }
                    })
                    this.dialogForm.get("MO_TA").valueChanges.subscribe(value => {
                        sobject.MO_TA = value;
                    })
                    this.dialogForm.get("LST_COT").valueChanges.subscribe(value => {
                        sobject.LST_COT = value;
                    })
                    this.columnsResultData = new MatTableDataSource<any>([]);
                    this.columnsResultDataTotalRows = 0;
                    this.columnsResultDataCurrentPage = 0;
                } else {
                    if (this.actionGetData) {
                        this.onLoadData();
                    }
                }
                this._khaithacdulieuService.lstKhaiThacDuLieuShared$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: any) => {
                        this.sharedObject = response.find(e => e.MA_DULIEU == this.object.MA_DULIEU);
                    });
            });
    }

    lstColumns(lst): any {

        let lstView: any[] = [];
        lst?.forEach((obj) => {
            if (obj?.VIEW || (obj!.LST_FILTER && obj!.LST_FILTER.length > 0)) {
                lstView.push(obj)
            }
        })
        let columns = new MatTableDataSource<any>(lstView);
        columns.sort = this.sort;
        return columns;
    };
    displayedColumnsResultObjectView(lst: any[]): any[] {
        let lstColumn: any[] = [];
        lst.forEach((obj) => {
            if (obj?.VIEW) {
                lstColumn.push(obj)
            }
        })
        return lstColumn;
    };
    displayedColumnsResultView(lst: any[]): string[] {
        let lstColumn: string[] = [];
        let templstColumn: any[] = lst;
        if (templstColumn) {
            templstColumn.forEach(element => {
                if (element.VIEW) {
                    lstColumn.push(element.TEN_COT)
                }
            });
        }
        return lstColumn;
    };

    openFilterViewDialog(obj: any) {
        this._khaithacdulieuService.editColumnFilter(obj?.MA_COT).subscribe((obj => {
            if (obj) {
                const dialogRef = this._dialogMat.open(KhaiThacDuLieuDetailsFilterDialogComponent, {
                    data: obj
                });

                dialogRef.afterClosed().subscribe((confirmed: boolean) => {

                });
            } else {
                this._messageService.showWarningMessage("Thông báo", "Không tìm thấy cột dữ liệu");
            }
        }))

    }
    openFilterDialog(obj: FormArray) {
        this._khaithacdulieuService.editColumnFilter(obj.controls['MA_COT'].value).subscribe((obj => {
            if (obj) {
                const dialogRef = this._dialogMat.open(KhaiThacDuLieuDetailsFilterDialogComponent, {
                    data: obj
                });

                dialogRef.afterClosed().subscribe((confirmed: boolean) => {
                    if (confirmed) {
                        this.matTableColumnDetail.renderRows();
                    }
                });
            } else {
                this._messageService.showWarningMessage("Thông báo", "Không tìm thấy cột dữ liệu");
            }
        }))

    }
    onViewColumn(obj: FormArray): void {
        if (obj.controls['VIEW'] && obj.controls['VIEW'].value) {
            obj.controls['VIEW'].setValue(!obj.controls['VIEW'].value);
        } else {
            obj.controls['VIEW'].setValue(1);
        }

    }
    onSortColumn(obj: FormArray): void {
        if (obj.controls['SORT'].value == 1) {
            obj.controls['SORT'].setValue(0);
            return;
        }
        if (obj.controls['SORT'].value == 0) {
            obj.controls['SORT'].setValue(null);
            return;
        }
        obj.controls['SORT'].setValue(1);

    }


    displayedColumnsResultObject(lst: FormArray): FormArray {
        let lstColumn: FormArray = new FormArray([]);
        lst.controls.forEach((obj) => {
            if (obj.value.VIEW) {
                lstColumn.controls.push(obj)
            }
        })
        return lstColumn;
    };
    displayedColumnsResult(lst: FormArray): string[] {
        let lstColumn: string[] = [];
        let templstColumn: any[] = lst.value;
        if (templstColumn) {
            templstColumn.forEach(element => {
                if (element.VIEW) {
                    lstColumn.push(element.TEN_COT)
                }
            });
        }
        return lstColumn;
    };

    private setLstCotForm(lstCot: any[]) {
        const lstCotCtrl = this.dialogForm.get('LST_COT') as FormArray;
        lstCotCtrl.clear();
        if (lstCot) {
            lstCot.forEach((obj) => {
                lstCotCtrl.push(this.setlstCotFormArray(obj))
            })
        }
    };

    private setlstCotFormArray(obj) {
        return this._formBuilder.group({
            MA_COT: [obj?.MA_COT],
            MA_DULIEU_CTIET: [obj?.MA_DULIEU_CTIET],
            MA_KIEU_DLIEU: [obj?.MA_KIEU_DLIEU],
            STT: [obj?.STT],
            TEN_COT: [obj?.TEN_COT],
            MO_TA: [obj?.MO_TA],
            VIEW: [obj?.VIEW],
            SORT: [obj?.SORT],
            FORMAT: [obj?.FORMAT],
            LST_FILTER: [obj?.LST_FILTER],
            USER_CR_ID: [obj?.USER_CR_ID],
            SYS_ACTION: [obj.SYS_ACTION ? obj.SYS_ACTION : State.edit]
        });
    }
    get lstCot(): FormArray {
        return this.dialogForm.get('LST_COT') as FormArray;
    }
    dropSortRowTable(event) {
        const prevIndex = this.lstCot.controls.findIndex((d) => d === event.item.data);
        moveItemInArray(this.lstCot.controls, prevIndex, event.currentIndex);
        let stt = 0;
        this.lstCot.controls.forEach(obj => {
            stt += 1;
            obj.value.STT = stt;
            obj.setValue(obj.value);
        });
        this.matTableColumnDetail.renderRows();
    }
    onTreeNodeNhomDuLieuParent(node: any): void {
        if ((!node.object.SYS_ACTION || node.object.SYS_ACTION != State.create)) {
            this.dialogForm.controls['MA_NHOM'].setValue(node.object.MA_NHOM);
            this.dialogForm.controls['TEN_NHOM'].setValue(node.object.TEN_NHOM);
            this.dialogForm.controls['MA_BANG'].setValue(null);
        } else {
            this._messageService.showWarningMessage("Thông báo", "Không thể chuyển vào vị trí này");
        }
    }
    getChildObjectByParent(parentId, lstItem): ObjectNode[] {
        let items: ObjectNode[] = [];
        let item: ObjectNode;
        lstItem.forEach((obj) => {
            if (obj.MA_NHOM_CHA != null && obj.MA_NHOM_CHA == parentId) {
                items.push({
                    object: obj,
                    children: this.getChildObjectByParent(obj.MA_NHOM, lstItem)
                })
            }
        });
        return items;
    }
    onCreateObject(): void {
        throw new Error('Method not implemented.');
    }
    columnsResultDataPageChanged(event: PageEvent) {
        this.columnsResultDataPageSize = event.pageSize;
        this.columnsResultDataCurrentPage = event.pageIndex;
        this.onLoadData();
    }

    onLoadDataExcel() {
        this._khaithacdulieuService.loadDataExcelToServer().pipe(take(1))
            .subscribe((result: any) => {
                if (result.data?.dataExcel) {
                    // const byteStr = atob(result.data?.dataExcel);
                    const byteStr = result.data?.dataExcel;
                    this._fileSaverService.downloadFile(byteStr, result.data?.fileName, FILE_TYPE.EXCEL);
                } else {
                    this._messageService.showErrorMessage("Thông báo", "Dữ liệu không tồn tại")
                }
            });
    }
    onLoadData() {
        this._khaithacdulieuService.loadDataToServer(this.columnsResultDataCurrentPage, this.columnsResultDataPageSize).pipe(take(1))
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
            });
    }
    onSaveObject() {

        if (!this.dialogForm.valid) {
            this.dialogForm.markAllAsTouched();
            this._messageService.showWarningMessage("Thông báo", "Thông tin bạn nhập chưa đủ hoặc không hợp lệ");
        } else {
            if (this.object?.SYS_ACTION == State.create) {
                this.authInsertFromServer.subscribe((auth) => {
                    if (auth) {
                        this._khaithacdulieuService.createObjectToServer(this.object?.MA_DULIEU).pipe(takeUntil(this._unsubscribeAll))
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
                                        this._messageService.showErrorMessage("Thông báo", "Bảng dữ liệu không tồn tại");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._khaithacdulieuService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._khaithacdulieuService.updateObjectById(this.object?.MA_DULIEU, resultApi.data).subscribe(() => {
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
                        this._khaithacdulieuService.editObjectToServer(this.object?.MA_DULIEU).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy mẫu dữ liệu hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case 1:
                                        this._khaithacdulieuService.viewObject(this.object?.MA_DULIEU).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.MA_DULIEU], { relativeTo: this._activatedRoute.parent });
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
                this._khaithacdulieuService.editObject({ "MA_DULIEU": this.object?.MA_DULIEU, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy mẫu dữ liệu cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }

    onCancelObject(): void {
        this._khaithacdulieuService.cancelObject(this.object?.MA_DULIEU)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._khaithacdulieuService.viewObject(this.object?.MA_DULIEU).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.MA_DULIEU], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa mẫu dữ liệu \"" + this.object.MO_TA + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._khaithacdulieuService.deleteObject(this.object?.MA_DULIEU)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa Mẫu dữ liệu thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy mẫu dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa mẫu dữ liệu");
                                        break;

                                }

                            });
                    } else {
                        this._khaithacdulieuService.deleteObjectToServer(this.object?.MA_DULIEU)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._khaithacdulieuService.deleteObject(this.object?.MA_DULIEU)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa mẫu dữ liệu thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy mẫu dữ liệu cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa mẫu dữ liệu");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy mẫu dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa mẫu dữ liệu");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Mẫu dữ liệu đã sử dụng nên ko thể xóa");
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

    showShareableUsersDialog(): void {
        if (this.object?.MA_DULIEU == null) {
            this._messageService.showWarningMessage('Thông báo', 'Bạn cần chọn dữ liệu đã khai thác');
            return;
        }

        const dialogRef = this._dialogMat.open(ShareUserDialogComponent, {
            width: '50%',
            height: 'auto',
            data: {
                maDuLieu: this.object?.MA_DULIEU,
                userId: this.user.userId
            }
        });

        dialogRef.afterClosed().subscribe((response: any) => {

        })
    }

    routeToDrawCharts(): void {
        this._router.navigate([`nghiepvu/khaithac/vebieudo/group/${this.object?.MA_DULIEU}`]);
    }
}


