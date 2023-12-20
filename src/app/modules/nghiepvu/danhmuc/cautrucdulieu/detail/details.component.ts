import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { State } from 'app/shared/commons/conmon.types';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { FunctionService } from 'app/core/function/function.service';
import { CauTrucDuLieuService } from '../cautrucdulieu.service';
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

export class CauTrucDuLieuDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild("MatTableDetail", { static: false }) matTableDetail: MatTable<any>;

    public StateEnum = State;
    labelColors: any;
    obj: any;
    lstNguonDuLieu: any[];
    lstKieuDuLieu: any[];
    public filteredNguonDuLieu: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    displayedColumns: string[] = ['STT', 'TEN_COT', 'MO_TA', 'KIEU_DLIEU', 'USER_CR_ID', 'USER_CR_DTIME'];
    displayedColumnsInput: string[] = ['STT', 'TEN_COT', 'MO_TA', 'MA_KIEU_DLIEU', 'ACTION'];
    dialogForm: UntypedFormGroup;
    @ViewChild(MatSort, { static: false }) sort: MatSort;

    lstBang: any[];
    public filteredBang: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    lstCotOfBang: any[];
    
    /**
     * Constructor
     */
    constructor(
        private _cautrucdulieuService: CauTrucDuLieuService,
        private _formBuilder: UntypedFormBuilder,
        public _activatedRoute: ActivatedRoute,
        public _router: Router,
        public _functionService: FunctionService,
        public _userService: UserService,
        public _messageService: MessageService
    ) {
        super(_activatedRoute, _router, _functionService, _userService, _messageService);
        this.lstBang = [];
        this.lstCotOfBang = [];
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
        this._cautrucdulieuService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((obj: any) => {
                this.obj = obj;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        MA_KETNOI: [obj?.MA_KETNOI, [Validators.required]],
                        TEN_BANG: [obj?.TEN_BANG, [Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_]*")]],
                        MO_TA: [obj?.MO_TA, [Validators.required, Validators.maxLength(250)]],
                        MA_KETNOIFilter: [],
                        BANGFilter: [],
                        LST_COTFilter: [],
                        // LST_COT: this._formBuilder.array([])
                        LST_COT: [],
                        LST_COT_NEW: [],
                        LST_COT_REMAIN: []
                    });

                    // this.setLstCotForm(obj?.LST_COT);
                    this.obj.LST_COT_ORIGIN = obj?.LST_COT;

                    this.onChangeKetNoi({
                        value: obj?.MA_KETNOI
                    });
                    setTimeout(() => {
                        this.onChangeBang({
                            value: obj?.TEN_BANG
                        });
                    }, 1000);

                    this.dialogForm.controls.MA_KETNOIFilter.valueChanges
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe(() => {
                            this.filterNguonDuLieu();
                        });
                    this.dialogForm.controls.BANGFilter.valueChanges
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe(() => {
                            this.filterBang();
                        });
                    this.dialogForm.get("MA_KETNOI").valueChanges.subscribe(value => {
                        obj.MA_KETNOI = value;
                    })
                    this.dialogForm.get("TEN_BANG").valueChanges.subscribe(value => {
                        obj.TEN_BANG = value;
                    })
                    this.dialogForm.get("MO_TA").valueChanges.subscribe(value => {
                        obj.MO_TA = value;
                    })
                    this.dialogForm.get("LST_COT").valueChanges.subscribe(value => {
                        obj.LST_COT = value;
                    })
                    this.dialogForm.get("LST_COT_NEW").valueChanges.subscribe(value => {
                        obj.LST_COT_NEW = value;
                    })
                    this.dialogForm.get("LST_COT_REMAIN").valueChanges.subscribe(value => {
                        obj.LST_COT_REMAIN = value;
                    })
                }
            });
        //Chi tiet dau vao

        this._cautrucdulieuService.ObjectNguonDuLieu$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstNguonDuLieu: any[]) => {
                this.lstNguonDuLieu = lstNguonDuLieu;
                this.filteredNguonDuLieu.next(this.lstNguonDuLieu.slice());

            });
        this._cautrucdulieuService.ObjectKieuDuLieu$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstKieuDuLieu: any[]) => {
                this.lstKieuDuLieu = lstKieuDuLieu;
            });

    }

    initObjectDetail() {
        const uid = new ShortUniqueId();
        return this._formBuilder.group({
            MA_COT: [uid.stamp(10), [Validators.required, Validators.maxLength(50)]],
            STT: [this.lstCot.length + 1, [Validators.required]],
            TEN_COT: ['', [Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_]*")]],
            MO_TA: ['', [Validators.required, Validators.maxLength(250)]],
            MA_KIEU_DLIEU: ['', [Validators.required]],
            USER_CR_ID: [this.user.userId],
            SYS_ACTION: [State.create]
        });
    }
    private setLstCotForm(lstCot: any[]) {
        const lstCotCtrl = this.dialogForm.get('LST_COT') as FormArray;
        lstCot.forEach((obj) => {
            lstCotCtrl.push(this.setlstCotFormArray(obj))
        })
    };
    private setlstCotFormArray(obj) {
        return this._formBuilder.group({
            MA_COT: [obj?.MA_COT, [Validators.required, Validators.maxLength(50)]],
            STT: [obj?.STT, [Validators.required]],
            TEN_COT: [obj?.TEN_COT, [Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_]*")]],
            MO_TA: [obj?.MO_TA, [Validators.required, Validators.maxLength(250)]],
            MA_KIEU_DLIEU: [obj?.MA_KIEU_DLIEU, [Validators.required]],
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
        this.matTableDetail.renderRows();
    }
    onDeleteObjectDetail(index) {
        this.lstCot.removeAt(index);
        this.matTableDetail.renderRows();
    }
    onSortObjectDetail() {
        let stt = 0;
        this.lstCot.controls.forEach(obj => {
            stt += 1;
            obj.value.STT = stt;
            obj.setValue(obj.value);
        });
        //this.lstCot.controls.push(this.initObjectDetail());
        this.matTableDetail.renderRows();
    }
    onAddObjectDetail() {
        this.lstCot.push(this.initObjectDetail());
        //this.lstCot.controls.push(this.initObjectDetail());
        this.matTableDetail.renderRows();
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
        this.setLstCotValue();
        if (this.obj?.LST_COT == undefined || this.obj?.LST_COT == null || this.obj?.LST_COT.length == 0) {
            this._messageService.showWarningMessage("Thông báo", "Thông tin dịch vụ bạn nhập chưa đủ");
            return;
        }
        if (!this.dialogForm.valid) {
            this.dialogForm.markAllAsTouched();
            this._messageService.showWarningMessage("Thông báo", "Thông tin dịch vụ bạn nhập chưa đủ");
        } else {
            this.obj.MO_TA = this.dialogForm.controls['MO_TA'].value;
            this.obj.TEN_BANG = this.dialogForm.controls['TEN_BANG'].value;
            this.obj.LST_COT = this.dialogForm.controls['LST_COT'].value;
            this.obj.MA_KETNOI = this.dialogForm.controls['MA_KETNOI'].value;

            if (this.obj?.SYS_ACTION == State.create) {
                this.authInsertFromServer.subscribe((auth) => {
                    if (auth) {
                        this._cautrucdulieuService.createObjectToServer(this.obj?.MA_BANG).pipe(takeUntil(this._unsubscribeAll))
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
                                            this._cautrucdulieuService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._cautrucdulieuService.updateApiById(this.obj?.MA_BANG, resultApi.data).subscribe(() => {
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
                let lstCotRemain = [];
                let lstCotOrigin = this.obj.LST_COT_ORIGIN;
                let lstCotNew = [];
                
                if (this.obj.LST_COT_ORIGIN.length > 0) {
                    lstCotOrigin.forEach(e => {
                        let exists = false;
                        this.obj.LST_COT.forEach(ee => {
                            if (ee.TEN_COT == e.TEN_COT) {
                                exists = true;
                            }
                        });
                        if (exists) {
                            lstCotRemain.push(e.MA_COT);
                        }
                    });
                }
                this.dialogForm.patchValue({
                    LST_COT_REMAIN: lstCotRemain
                });

                this.obj.LST_COT.forEach(e => {
                    let exists = false;
                    lstCotOrigin.forEach(ee => {
                        if (e.TEN_COT == ee.TEN_COT) {
                            exists = true;
                        }
                    });
                    if(!exists) {
                        lstCotNew.push(e);
                    }
                });
                this.dialogForm.patchValue({
                    LST_COT_NEW: lstCotNew
                })

                this.authEditFromServer.subscribe((auth) => {
                    if (auth) {
                        this._cautrucdulieuService.editObjectToServer(this.obj?.MA_BANG).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case 100:
                                        this._messageService.showWarningMessage("Thông báo", "Đã ghi dữ liệu thành công, tuy nhiên một số cột không thể xóa do đã được sử dụng");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dịch vụ hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case 1:
                                        this._cautrucdulieuService.viewObject(this.obj?.MA_BANG).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.obj?.MA_BANG], { relativeTo: this._activatedRoute.parent });
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
                this._cautrucdulieuService.editObject({ "MA_BANG": this.obj?.MA_BANG, "USER_MDF_ID": this.user.userId })
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
        this._cautrucdulieuService.cancelObject(this.obj?.MA_BANG)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._cautrucdulieuService.viewObject(this.obj?.MA_BANG).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.obj?.MA_BANG], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa cấu trúc dữ liệu \"" + this.obj.TEN_BANG + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.obj?.SYS_ACTION == State.create) {
                        this._cautrucdulieuService.deleteObject(this.obj?.MA_BANG)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy cấu trúc dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa cấu trúc dữ liệu");
                                        break;
                                }

                            });
                    } else {
                        this._cautrucdulieuService.deleteObjectToServer(this.obj?.MA_BANG)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._cautrucdulieuService.deleteObject(this.obj?.MA_BANG)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa cấu trúc dữ liệu thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy cấu trúc dữ liệu cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa cấu trúc dữ liệu");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy cấu trúc dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa cấu trúc dữ liệu");
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
    protected filterNguonDuLieu() {
        if (!this.lstNguonDuLieu) {
            return;
        }
        // get the search keyword
        let search = this.dialogForm.controls.MA_KETNOIFilter.value;
        if (!search) {
            this.filteredNguonDuLieu.next(this.lstNguonDuLieu.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredNguonDuLieu.next(
            this.lstNguonDuLieu.filter(obj => obj.TEN_KETNOI.toLowerCase().indexOf(search) > -1 || obj.TEN_CSDL.toLowerCase().indexOf(search) > -1)
        );
    }

    protected filterBang() {
        if (!this.lstBang) {
            return;
        }
        // get the search keyword
        let search = this.dialogForm.controls.BANGFilter.value;
        if (!search) {
            this.filteredBang.next(this.lstBang.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        // filter the banks
        this.filteredBang.next(
            this.lstBang.filter(obj => obj.TEN_BANG.toLowerCase().indexOf(search) > -1 || obj.MO_TA.toLowerCase().indexOf(search) > -1)
        );
    }

    onChangeKetNoi(event: any): void {
        if (event.value == undefined || event.value == null) {
            return;
        }
        this.getLstTablesOfConn(event.value);
    }

    async getLstTablesOfConn(maKetNoi: string) {
        await firstValueFrom(this._cautrucdulieuService.getLstBang(maKetNoi)
            .pipe(takeUntil(this._unsubscribeAll)))
                .then((response: any) => {
                    if (response.status > 0) {
                        this.lstBang = response.data;
                        this.filteredBang.next(this.lstBang.slice());
                    } else {
                        this._messageService.showErrorMessage('Thông báo', response.message);
                    }
                });
    }

    onChangeBang(event: any): void {
        if (event.value == undefined || event.value == null) {
            return;
        }
        let table = this.lstBang.filter(e => e.TEN_BANG == event.value)[0];
        this.dialogForm.patchValue({
            MO_TA: table.MO_TA
        });
        this.getLstFieldsOfTable(table.ID);
    }

    async getLstFieldsOfTable(tableId: number) {
        await firstValueFrom(this._cautrucdulieuService.getLstCot(tableId)
            .pipe(takeUntil(this._unsubscribeAll)))
            .then((response: any) => {
                if (response.status > 0) {
                    this.lstCotOfBang = response.data;
                    let lstCotOrigin = this.obj.LST_COT;
                    let length = lstCotOrigin.length;
                    this.lstCotOfBang.forEach(e => {
                        for(let i = 0; i < length; i++) {
                            if (e.TEN_COT == lstCotOrigin[i].TEN_COT) {
                                e.SELECTED = 1;
                            }
                        }
                    });
                } else {
                    this._messageService.showErrorMessage('Thông báo', response.message);
                }
            })
    }

    getTenMaKieuDuLieu(maKieuDL: string): string {
        return this.lstKieuDuLieu.filter(e => e.MA_KIEU_DLIEU == maKieuDL)[0].KIEU_DLIEU;
    }

    onCheckAll(event: any): void {
        if (event.checked) {
            this.lstCotOfBang.forEach(e => {
                e.SELECTED = 1;
            })
        } else {
            this.lstCotOfBang.forEach(e => {
                e.SELECTED = 0;
            })
        }
        // this.setLstCotValue();
    }

    setSelected(element: any): void {
        element.SELECTED = !element.SELECTED;
        // this.setLstCotValue();
    }

    setLstCotValue(): void {
        let lstCot = [];
        this.lstCotOfBang.forEach(e => {
            if (e.SELECTED == 1) {
                lstCot.push({
                    STT: e.STT,
                    MA_BANG: e.MA_BANG,
                    TEN_COT: e.TEN_COT,
                    MO_TA: e.MO_TA,
                    MA_KIEU_DLIEU: e.MA_KIEU_DIEU,
                    USER_CR_ID: null
                })   
            }
        });
        this.dialogForm.controls['LST_COT'].setValue(lstCot);
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
