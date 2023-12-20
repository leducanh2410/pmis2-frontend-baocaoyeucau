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
import { NhomDuLieuService } from '../nhomdulieu.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

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

export class NhomDuLieuDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild('trigger') trigger: MatAutocompleteTrigger;
    public StateEnum = State;
    object: any;
    dialogForm: UntypedFormGroup;
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
    /**
     * Constructor
     */
    constructor(
        private _NhomDuLieuService: NhomDuLieuService,
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
        this._NhomDuLieuService.lstNhomDuLieu$
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
        // Chi tiet API
        this._NhomDuLieuService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((object: any) => {
                this.object = object;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        MA_NHOM_CHA: [object?.MA_NHOM_CHA],
                        MA_NHOM: [object?.MA_NHOM],
                        TEN_NHOM: [object?.TEN_NHOM, [Validators.required, Validators.maxLength(250)]]
                    });
                    this.dialogForm.get("MA_NHOM_CHA").valueChanges.subscribe(value => {
                        if (value == '') {
                            value = null;
                        }
                        object.MA_NHOM_CHA = value;
                        this._NhomDuLieuService.updateObjectById(this.object?.MA_NHOM, this.object).subscribe();
                    })
                    this.dialogForm.get("TEN_NHOM").valueChanges.subscribe(value => {
                        object.TEN_NHOM = value;
                    })
                }
            });

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
    onOpenNhomDuLieuParentSelect() {
        setTimeout(_ => this.trigger.openPanel());
    }
    onTreeNodeNhomDuLieuParent(node: any): void {
        if ((!node.object.SYS_ACTION || node.object.SYS_ACTION != State.create)
            && this.checkChangeParent(this.dialogForm.controls['MA_NHOM'].value, node.object.MA_NHOM)) {
            this.dialogForm.controls['MA_NHOM_CHA'].setValue(node.object.MA_NHOM);
        } else {
            this._messageService.showWarningMessage("Thông báo", "Không thể chuyển vào vị trí này");
        }
    }
    searchNodeObject(id, tree: ObjectNode[]): ObjectNode {
        let objResult: ObjectNode = null;
        if (tree) {
            for (let obj of tree) {
                if (obj.object.MA_NHOM == id) {
                    objResult = obj;
                    break;
                } else {
                    objResult = this.searchNodeObject(id, obj.children);
                    if (objResult) {
                        break;
                    }
                }
            }
            return objResult;
        } else {
            return null;
        }
    }
    checkChangeParent(parentId: string, parentIdChange: string): boolean {
        if (parentId == parentIdChange) {
            return false;
        }
        let node = this.searchNodeObject(parentId, this.lstTreeListNhomDuLieu.data);
        if (node) {
            if (!node.children) {
                return true;
            } else {
                if (this.searchNodeObject(parentIdChange, node.children)) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            return false;
        }
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
                        this._NhomDuLieuService.createObjectToServer(this.object?.MA_NHOM).pipe(takeUntil(this._unsubscribeAll))
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
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm dữ liệu cha chưa ghi dữ liệu hoặc không tồn tại");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._NhomDuLieuService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._NhomDuLieuService.updateObjectById(this.object?.MA_NHOM, resultApi.data).subscribe(() => {
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
                        this._NhomDuLieuService.editObjectToServer(this.object?.MA_NHOM).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dữ liệu hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case 1:
                                        this._NhomDuLieuService.viewObject(this.object?.MA_NHOM).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.MA_NHOM], { relativeTo: this._activatedRoute.parent });
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
                this._NhomDuLieuService.editObject({ "MA_NHOM": this.object?.MA_NHOM, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dữ liệu cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }

    onCancelObject(): void {
        this._NhomDuLieuService.cancelObject(this.object?.MA_NHOM)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._NhomDuLieuService.viewObject(this.object?.MA_NHOM).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.MA_NHOM], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa nhóm dữ liệu \"" + this.object.TEN_NHOM + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._NhomDuLieuService.deleteObject(this.object?.MA_NHOM)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nhóm dữ liệu thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm dữ liệu");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm dữ liệu đã sử dụng nên ko thể xóa");
                                        break;
                                }

                            });
                    } else {
                        this._NhomDuLieuService.deleteObjectToServer(this.object?.MA_NHOM)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._NhomDuLieuService.deleteObject(this.object?.MA_NHOM)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nhóm dữ liệu thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dữ liệu cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm dữ liệu");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dữ liệu cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm dữ liệu");
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
