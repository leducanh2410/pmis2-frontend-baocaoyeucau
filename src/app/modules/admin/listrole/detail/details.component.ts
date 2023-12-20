import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { State, StateAthAdmin } from 'app/shared/commons/conmon.types';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { FunctionService } from 'app/core/function/function.service';
import { ListRoleService } from '../listrole.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

interface ObjectNode {
    object: any;
    children?: ObjectNode[];
}
interface ObjectFlatNode {
    expandable: boolean;
    object: string;
    level: number;
    children: ObjectNode[];
}

@Component({
    selector: 'component-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class ListRoleDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    public StateEnum = State;
    object: any;
    dialogForm: UntypedFormGroup;
    public StateAthAdmin = StateAthAdmin;
    selectionFunction = new SelectionModel<String>(true, []);
    selectionFunctionInsert = new SelectionModel<String>(true, []);
    selectionFunctionEdit = new SelectionModel<String>(true, []);
    selectionFunctionDelete = new SelectionModel<String>(true, []);
    displayedColumns: string[] = ['SELECT', 'FUNCTIONNAME', 'R_INSERT', 'R_EDIT', 'R_DELETE'];
    displayedColumnsView: string[] = ['SELECT', 'FUNCTIONNAME', 'R_INSERT', 'R_EDIT', 'R_DELETE'];
    lstTreeListFunctionControl = new FlatTreeControl<ObjectFlatNode>(
        node => node.level,
        node => node.expandable,
    );
    ;
    private _transformer = (node: ObjectNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            object: node.object,
            children: node.children,
            level: level,
        };
    };
    lstTreeListFunctionFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );
    lstTreeListFunction = new MatTreeFlatDataSource(this.lstTreeListFunctionControl, this.lstTreeListFunctionFlattener);
    lstTreeListFunctionHasChild = (_: number, node: ObjectFlatNode) => node.expandable;
    /**
     * Constructor
     */
    constructor(
        private _listroleService: ListRoleService,
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
        this._listroleService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((object: any) => {
                this.object = object;
                let lstListFunction = object.LST_GRANT_FUNCTION
                let lstTreeDataListFunction: ObjectNode[] = []
                this.selectionFunction.clear();
                this.selectionFunctionInsert.clear();
                this.selectionFunctionEdit.clear();
                this.selectionFunctionDelete.clear();
                if (lstListFunction && lstListFunction.length > 0) {

                    lstListFunction.forEach((obj) => {
                        if (obj.ROLEID) {
                            this.selectionFunction.select(obj.FUNCTIONID);
                        }
                        if (obj.R_INSERT) {
                            this.selectionFunctionInsert.select(obj.FUNCTIONID);
                        }
                        if (obj.R_EDIT) {
                            this.selectionFunctionEdit.select(obj.FUNCTIONID);
                        }
                        if (obj.R_DELETE) {
                            this.selectionFunctionDelete.select(obj.FUNCTIONID);
                        }
                        if (obj?.FUNCTION_PARENT_ID == null) {
                            lstTreeDataListFunction.push({ object: obj, children: this.getChildObjectByParent(obj.FUNCTIONID, lstListFunction) })
                        }
                    })
                    this.lstTreeListFunction.data = lstTreeDataListFunction;
                    //this.lstTreeListFunctionControl.dataNodes = lstTreeDataListFunction;
                    this.lstTreeListFunctionControl.expandAll()
                } else {
                    this.lstTreeListFunction.data = lstTreeDataListFunction;
                    //this.lstTreeListFunctionControl.dataNodes = lstTreeDataListFunction;
                }
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        ROLECODE: [object?.ROLECODE, [Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_]*")]],
                        ROLEDESC: [object?.ROLEDESC, [Validators.required, Validators.maxLength(250)]],
                        ENABLE: [object?.ENABLE],
                        ROLEORD: [object?.ROLEORD, [Validators.required]]

                    });
                    this.dialogForm.get("ROLECODE").valueChanges.subscribe(value => {
                        object.ROLECODE = value;
                    })
                    this.dialogForm.get("ROLEDESC").valueChanges.subscribe(value => {
                        object.ROLEDESC = value;
                    })
                    this.dialogForm.get("ENABLE").valueChanges.subscribe(value => {
                        object.ENABLE = value;
                    })
                    this.dialogForm.get("ROLEORD").valueChanges.subscribe(value => {
                        object.ROLEORD = value;
                    })
                }
            });

    }
    lstColumnsView(lst: any[]): any {
        let columns = new MatTableDataSource<any>(lst.filter(item => item.ROLEID != null));
        columns.sort = this.sort;
        return columns;
    };
    lstColumns(lst: any[]): any {
        let columns = new MatTableDataSource<any>(lst);
        columns.sort = this.sort;
        return columns;
    };
    countTreeListFunction(lstTreeListFunction: ObjectNode[]): any {
        let iCount = 0;
        lstTreeListFunction.forEach((obj) => {
            iCount += 1;
            if (obj.children) {
                iCount = iCount + this.countTreeListFunction(obj.children)
            }
        })
        return iCount;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    isAllFunctionSelected(type: StateAthAdmin) {
        let numSelected = 0;
        switch (type) {
            case StateAthAdmin.view:
                numSelected = this.selectionFunction.selected.length;
                break;
            case StateAthAdmin.insert:
                numSelected = this.selectionFunctionInsert.selected.length;
                break;
            case StateAthAdmin.edit:
                numSelected = this.selectionFunctionEdit.selected.length;
                break;
            case StateAthAdmin.delete:
                numSelected = this.selectionFunctionDelete.selected.length;
                break;
        }

        const numRows = this.countTreeListFunction(this.lstTreeListFunction.data);
        return numSelected === numRows;
    }
    masterToggleFunction(type: StateAthAdmin) {
        if (this.isAllFunctionSelected(type)) {
            switch (type) {
                case StateAthAdmin.view:
                    this.selectionFunction.clear()
                    this.selectionFunctionInsert.clear()
                    this.selectionFunctionEdit.clear()
                    this.selectionFunctionDelete.clear()
                    break;
                case StateAthAdmin.insert:
                    this.selectionFunctionInsert.clear()
                    break;
                case StateAthAdmin.edit:
                    this.selectionFunctionEdit.clear()
                    break;
                case StateAthAdmin.delete:
                    this.selectionFunctionDelete.clear()
                    break;
            }
        } else {
            this.selectTreeListFunction(this.lstTreeListFunction.data, type);
        }
    }
    selectTreeListFunction(lstTreeList: ObjectNode[], type: StateAthAdmin) {
        lstTreeList.forEach((obj: any) => {
            switch (type) {
                case StateAthAdmin.view:
                    this.selectionFunction.select(obj.object.FUNCTIONID)
                    break;
                case StateAthAdmin.insert:
                    this.selectionFunction.select(obj.object.FUNCTIONID)
                    this.selectionFunctionInsert.select(obj.object.FUNCTIONID)
                    break;
                case StateAthAdmin.edit:
                    this.selectionFunction.select(obj.object.FUNCTIONID)
                    this.selectionFunctionEdit.select(obj.object.FUNCTIONID)
                    break;
                case StateAthAdmin.delete:
                    this.selectionFunction.select(obj.object.FUNCTIONID)
                    this.selectionFunctionDelete.select(obj.object.FUNCTIONID)
                    break;
            }

            if (obj.children && obj.children.length > 0) {
                this.selectTreeListFunction(obj.children, type)
            }
        })
    }
    itemToggleFunction(nodeFunction: ObjectNode, type: StateAthAdmin, level?: number, state?: Boolean) {
        switch (type) {
            case StateAthAdmin.view:
                if (level === undefined) {
                    this.selectionFunction.toggle(nodeFunction.object.FUNCTIONID);
                    state = this.selectionFunction.isSelected(nodeFunction.object.FUNCTIONID);
                    level = 1;
                } else {
                    if (state) {
                        this.selectionFunction.select(nodeFunction.object.FUNCTIONID);
                    } else {
                        this.selectionFunction.deselect(nodeFunction.object.FUNCTIONID);
                    }
                }
                if (!this.selectionFunction.isSelected(nodeFunction.object.FUNCTIONID)) {
                    this.selectionFunctionInsert.deselect(nodeFunction.object.FUNCTIONID);
                    this.selectionFunctionEdit.deselect(nodeFunction.object.FUNCTIONID);
                    this.selectionFunctionDelete.deselect(nodeFunction.object.FUNCTIONID);
                }
                break;
            case StateAthAdmin.insert:
                if (level === undefined) {
                    this.selectionFunctionInsert.toggle(nodeFunction.object.FUNCTIONID);
                    state = this.selectionFunctionInsert.isSelected(nodeFunction.object.FUNCTIONID);
                    level = 1;
                } else {
                    if (state) {
                        this.selectionFunctionInsert.select(nodeFunction.object.FUNCTIONID);
                    } else {
                        this.selectionFunctionInsert.deselect(nodeFunction.object.FUNCTIONID);
                    }
                }
                if (this.selectionFunctionInsert.isSelected(nodeFunction.object.FUNCTIONID)) {
                    this.selectionFunction.select(nodeFunction.object.FUNCTIONID);
                }
                break;
            case StateAthAdmin.edit:
                if (level === undefined) {
                    this.selectionFunctionEdit.toggle(nodeFunction.object.FUNCTIONID);
                    state = this.selectionFunctionEdit.isSelected(nodeFunction.object.FUNCTIONID);
                    level = 1;
                } else {
                    if (state) {
                        this.selectionFunctionEdit.select(nodeFunction.object.FUNCTIONID);
                    } else {
                        this.selectionFunctionEdit.deselect(nodeFunction.object.FUNCTIONID);
                    }
                }

                if (this.selectionFunctionEdit.isSelected(nodeFunction.object.FUNCTIONID)) {
                    this.selectionFunction.select(nodeFunction.object.FUNCTIONID);
                }
                break;
            case StateAthAdmin.delete:
                if (level === undefined) {
                    this.selectionFunctionDelete.toggle(nodeFunction.object.FUNCTIONID);
                    state = this.selectionFunctionDelete.isSelected(nodeFunction.object.FUNCTIONID);
                    level = 1;
                } else {
                    if (state) {
                        this.selectionFunctionDelete.select(nodeFunction.object.FUNCTIONID);
                    } else {
                        this.selectionFunctionDelete.deselect(nodeFunction.object.FUNCTIONID);
                    }
                }
                if (this.selectionFunctionDelete.isSelected(nodeFunction.object.FUNCTIONID)) {
                    this.selectionFunction.select(nodeFunction.object.FUNCTIONID);
                }
                break;
        }

        if (nodeFunction.children && nodeFunction.children.length > 0) {
            nodeFunction.children.forEach((obj: any) => {
                this.itemToggleFunction(obj, type, level + 1, state);
            })
        }
    }
    getChildObjectByParent(parentId, lstItem): ObjectNode[] {
        let items: ObjectNode[] = [];
        let item: ObjectNode;
        lstItem.forEach((obj) => {
            if (obj.FUNCTION_PARENT_ID != null && obj.FUNCTION_PARENT_ID == parentId) {
                items.push({
                    object: obj,
                    children: this.getChildObjectByParent(obj.FUNCTIONID, lstItem)
                })
            }
        });
        return items;
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
                        this._listroleService.createObjectToServer(
                            {
                                "ROLEID": this.object?.ROLEID,
                                "LSTR_VIEW": this.selectionFunction.selected,
                                "LSTR_INSERT": this.selectionFunctionInsert.selected,
                                "LSTR_EDIT": this.selectionFunctionEdit.selected,
                                "LSTR_DELETE": this.selectionFunctionDelete.selected
                            }
                        ).pipe(takeUntil(this._unsubscribeAll))
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
                                        this._messageService.showErrorMessage("Thông báo", "Mã nhóm đã tồn tại trong hệ thống");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._listroleService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._listroleService.updateObjectById(this.object?.ROLEID, resultApi.data).subscribe(() => {
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
                        this._listroleService.editObjectToServer({
                            "ROLEID": this.object?.ROLEID,
                            "LSTR_VIEW": this.selectionFunction.selected,
                            "LSTR_INSERT": this.selectionFunctionInsert.selected,
                            "LSTR_EDIT": this.selectionFunctionEdit.selected,
                            "LSTR_DELETE": this.selectionFunctionDelete.selected
                        }).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm quyền hoặc không được phép thực hiện");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Dữ liệu nhập không đúng");
                                        break;
                                    case -3:
                                        this._messageService.showErrorMessage("Thông báo", "Mã nhóm đã tồn tại trong hệ thống");
                                        break;
                                    case 1:
                                        this._listroleService.viewObject(this.object?.ROLEID).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.ROLEID], { relativeTo: this._activatedRoute.parent });
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
                this._listroleService.editObject({ "ROLEID": this.object?.ROLEID, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm quyền cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }

    onCancelObject(): void {
        this._listroleService.cancelObject(this.object?.ROLEID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._listroleService.viewObject(this.object?.ROLEID).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.ROLEID], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa nhóm quyền \"" + this.object.ROLEDESC + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._listroleService.deleteObject(this.object?.ROLEID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nhóm quyền thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm quyền cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm quyền");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm quyền đã sử dụng nên ko thể xóa");
                                        break;
                                    case -3:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm quyền hệ thống nên ko thể xóa");
                                        break;
                                }

                            });
                    } else {
                        this._listroleService.deleteObjectToServer(this.object?.ROLEID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._listroleService.deleteObject(this.object?.ROLEID)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nhóm quyền thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm quyền cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm quyền");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm quyền cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm quyền");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm quyền đang sử dụng trong hệ thống nên không thể xóa");
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
