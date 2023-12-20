
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, OnDestroy } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FunctionService } from 'app/core/function/function.service';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { State } from 'app/shared/commons/conmon.types';
import { MessageService } from 'app/shared/message.services';
import { takeUntil } from 'rxjs';
import ShortUniqueId from 'short-unique-id';
import { KhaiThacDuLieuService } from '../khaithacdulieu.service';
import { DatePipe } from '@angular/common';
import { KIEU_DULIEU } from 'app/core/constants/chart-info';

@Component({
    selector: 'component-details_filter-dialog',
    templateUrl: './detailsfilter.component.html',
    styleUrls: ['./detailsfilter.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class KhaiThacDuLieuDetailsFilterDialogComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild("MatTableDetail", { static: false }) matTableDetail: MatTable<any>;
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    _khaiThacDuLieuDetailsFilterDialogForm: UntypedFormGroup;
    displayedColumnsInput: string[] = ['STT', 'NHOM_DKIEU', 'LOAI_DKIEN', 'GIA_TRI_LOC', 'ACTION'];
    displayedColumnsView: string[] = ['STT', 'NHOM_DKIEU', 'LOAI_DKIEN', 'GIA_TRI_LOC'];

    dialogFormFilter: UntypedFormGroup;
    listFilter: any[];
    lstNhomDieuKien: any[];
    lstLoaiDieuKien: any[];
    public StateEnum = State;
    obj: any;
    columnNameFilter: any
    columnTypeDataFilter: any    
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialogRef: MatDialogRef<KhaiThacDuLieuDetailsFilterDialogComponent>,
        private _khaithacdulieuService: KhaiThacDuLieuService,
        private _formBuilder: UntypedFormBuilder,
        public _activatedRoute: ActivatedRoute,
        public _router: Router,
        public _functionService: FunctionService,
        public _userService: UserService,
        public _messageService: MessageService,
        private _datePipe: DatePipe
    ) {
        super(_activatedRoute, _router, _functionService, _userService, _messageService);

        if (data) {
            this.columnNameFilter = data.MO_TA;
            this.columnTypeDataFilter = data.MA_KIEU_DLIEU;
        }

    }
    lstColumns(lst): any {
        let columns = new MatTableDataSource<any>();
        columns = lst;
        columns.sort = this.sort;
        return columns;
    };
    onEditObject(): void {
        throw new Error('Method not implemented.');
    }
    onSaveObject(): void {
        throw new Error('Method not implemented.');
    }
    onDeleteObject(): void {
        throw new Error('Method not implemented.');
    }
    onCreateObject(): void {
        throw new Error('Method not implemented.');
    }
    onCancelObject(): void {
        this.dialogRef.close(true);
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
    ngOnInit(): void {
        super.ngOnInit()
        this._khaithacdulieuService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((obj: any) => {
                this.obj = obj;
            });
        this._khaithacdulieuService.ObjectColumn$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((objectColumn: any) => {
                if (!objectColumn) {
                    this.dialogRef.close(true);
                }
                this.lstNhomDieuKien = [];
                this.lstNhomDieuKien.push({ "name": "Hoặc", "value": "OR" })
                this.lstNhomDieuKien.push({ "name": "Và", "value": "AND" })
                this.lstLoaiDieuKien = [];
                switch (objectColumn?.MA_KIEU_DLIEU) {
                    case 'KDL-1':
                        this.lstLoaiDieuKien.push({ "name": "Chứa chuỗi", "value": "%V%" })
                        this.lstLoaiDieuKien.push({ "name": "Bắt đầu với", "value": "V%" })
                        this.lstLoaiDieuKien.push({ "name": "Kết thúc với", "value": "%V" })
                        this.lstLoaiDieuKien.push({ "name": "=", "value": "=" })
                        this.lstLoaiDieuKien.push({ "name": "!=", "value": "<>" })
                        break;
                    case 'KDL-2':
                        this.lstLoaiDieuKien.push({ "name": "=", "value": "=" })
                        this.lstLoaiDieuKien.push({ "name": "!=", "value": "<>" })
                        this.lstLoaiDieuKien.push({ "name": ">", "value": ">" })
                        this.lstLoaiDieuKien.push({ "name": "<", "value": "<" })
                        this.lstLoaiDieuKien.push({ "name": ">=", "value": ">=" })
                        this.lstLoaiDieuKien.push({ "name": "<=", "value": "<=" })
                        break;
                    case 'KDL-3':
                        this.lstLoaiDieuKien.push({ "name": "=", "value": "=" })
                        this.lstLoaiDieuKien.push({ "name": "!=", "value": "<>" })
                        this.lstLoaiDieuKien.push({ "name": ">", "value": ">" })
                        this.lstLoaiDieuKien.push({ "name": "<", "value": "<" })
                        this.lstLoaiDieuKien.push({ "name": ">=", "value": ">=" })
                        this.lstLoaiDieuKien.push({ "name": "<=", "value": "<=" })
                        break;
                    case 'KDL-4':
                        this.lstLoaiDieuKien.push({ "name": "=", "value": "=" })
                        this.lstLoaiDieuKien.push({ "name": "!=", "value": "<>" })
                        this.lstLoaiDieuKien.push({ "name": ">", "value": ">" })
                        this.lstLoaiDieuKien.push({ "name": "<", "value": "<" })
                        this.lstLoaiDieuKien.push({ "name": ">=", "value": ">=" })
                        this.lstLoaiDieuKien.push({ "name": "<=", "value": "<=" })
                }
                this.listFilter = objectColumn?.LST_FILTER;
                this.dialogFormFilter = this._formBuilder.group({
                    MA_COT: objectColumn?.MA_COT,
                    MA_KIEU_DLIEU: objectColumn?.MA_KIEU_DLIEU,
                    LST_FILTER_COTFilter: [],
                    LST_FILTER: this._formBuilder.array([])
                });
                this.setLstCotForm(objectColumn?.LST_FILTER);

            });
    }
    get lstFilter(): FormArray {
        return this.dialogFormFilter.get('LST_FILTER') as FormArray;
    }
    dropSortRowTable(event) {
        const prevIndex = this.lstFilter.controls.findIndex((d) => d === event.item.data);
        moveItemInArray(this.lstFilter.controls, prevIndex, event.currentIndex);
        let stt = 0;
        this.lstFilter.controls.forEach(obj => {
            stt += 1;
            obj.value.STT = stt;
            obj.setValue(obj.value);
        });
        this.matTableDetail.renderRows();
    }
    onDeleteObjectDetail(index) {
        this.lstFilter.removeAt(index);
        this.matTableDetail.renderRows();
    }
    onSortObjectDetail() {
        let stt = 0;
        this.lstFilter.controls.forEach(obj => {
            stt += 1;
            obj.value.STT = stt;
            obj.setValue(obj.value);
        });
        //this.lstCot.controls.push(this.initObjectDetail());
        this.matTableDetail.renderRows();
    }
    onAddObjectDetail() {
        this.lstFilter.push(this.initObjectDetail());
        this.matTableDetail.renderRows();
    }
    initObjectDetail() {
        const uid = new ShortUniqueId();
        return this._formBuilder.group({
            MA_LOC: [uid.stamp(10), [Validators.required, Validators.maxLength(50)]],
            STT: [this.lstFilter.length + 1, [Validators.required]],
            GIA_TRI_LOC: [null, [Validators.required]],
            LOAI_DKIEN: [null, [Validators.required, Validators.maxLength(50)]],
            NHOM_DKIEU: ['AND', [Validators.required, Validators.maxLength(50)]],
            USER_CR_ID: [this.user.userId],
            SYS_ACTION: [State.create]
        });
    }
    private setLstCotForm(lstFilter: any[]) {
        const lstCotCtrl = this.dialogFormFilter.get('LST_FILTER') as FormArray;
        lstFilter?.forEach((obj) => {
            lstCotCtrl.push(this.setlstColumnFilterFormArray(obj))
        })
    };
    private setlstColumnFilterFormArray(obj) {
        let giaTriLoc = obj?.GIA_TRI_LOC;
        return this._formBuilder.group({
            MA_LOC: [obj?.MA_LOC, [Validators.required, Validators.maxLength(50)]],
            STT: [obj?.STT, [Validators.required]],
            GIA_TRI_LOC: [giaTriLoc, [Validators.required]],
            LOAI_DKIEN: [obj?.LOAI_DKIEN, [Validators.required, Validators.maxLength(50)]],
            NHOM_DKIEU: [obj?.NHOM_DKIEU, [Validators.required, Validators.maxLength(50)]],
            USER_CR_ID: [obj?.USER_CR_ID],
            SYS_ACTION: [obj.SYS_ACTION ? obj.SYS_ACTION : State.edit]
        });
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
    onConfirmClick(): void {
        if (!this.dialogFormFilter.valid) {
            this.dialogFormFilter.markAllAsTouched();
            this._messageService.showWarningMessage("Thông báo", "Thông tin bạn nhập chưa đủ");
        } else {
            this._khaithacdulieuService.updateCotDuLieuFilter({
                "MA_COT": this.dialogFormFilter.get('MA_COT').value
                , "USER_MDF_ID": [this.user.userId]
            }
                , this.dialogFormFilter.get('LST_FILTER').value).subscribe(() => {
                    this.dialogRef.close(true);
                })

        }
    }
    onCloseClick(): void {
        this.dialogRef.close(true);
    }

}