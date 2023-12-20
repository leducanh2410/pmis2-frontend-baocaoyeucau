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
import { ApiGroupService } from '../listapigroup.service';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
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
}

@Component({
    selector: 'component-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.css'],
    encapsulation: ViewEncapsulation.None,
})

export class ApiGroupDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild('trigger') trigger: MatAutocompleteTrigger;
    public StateEnum = State;
    object: any;
    dialogForm: UntypedFormGroup;
    displayedColumns: string[] = ['API_SERVICEID', 'API_SERVICE_DESC', 'USER_CR_ID', 'USER_CR_DTIME'];
    lstTreeListApiGroupControl = new FlatTreeControl<ObjectFlatNode>(
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
    lstTreeListApiGroupFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );
    lstTreeListApiGroup = new MatTreeFlatDataSource(this.lstTreeListApiGroupControl, this.lstTreeListApiGroupFlattener);

    lstTreeListApiGroupnHasChild = (_: number, node: ObjectFlatNode) => node.expandable;
    /**
     * Constructor
     */
    constructor(
        private _ApiGroupService: ApiGroupService,
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
        this._ApiGroupService.lstApiGroup$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstApiGroup: any[]) => {
                let lstTreeDataApiGroup: ObjectNode[] = []
                if (lstApiGroup && lstApiGroup.length > 0) {

                    lstApiGroup.forEach((obj) => {
                        if (obj?.API_SERVICE_PARENT_GROUPID == null) {
                            lstTreeDataApiGroup.push({ object: obj, children: this.getChildObjectByParent(obj.API_SERVICE_GROUPID, lstApiGroup) })
                        }
                    })
                    this.lstTreeListApiGroup.data = lstTreeDataApiGroup;
                    this.lstTreeListApiGroupControl.expandAll()
                } else {
                    this.lstTreeListApiGroup.data = lstTreeDataApiGroup;
                }
            });
        // Chi tiet API
        this._ApiGroupService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((object: any) => {
                this.object = object;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        API_SERVICE_PARENT_GROUPID: [object?.API_SERVICE_PARENT_GROUPID],
                        API_SERVICE_GROUPID: [object?.API_SERVICE_GROUPID],
                        API_SERVICE_GROUPORD: [object?.API_SERVICE_GROUPORD, [Validators.required]],
                        API_SERVICE_GROUP_ICON: [object?.API_SERVICE_GROUP_ICON, [Validators.required, Validators.maxLength(50)]],
                        API_SERVICE_GROUPDESC: [object?.API_SERVICE_GROUPDESC, [Validators.required, Validators.maxLength(250)]]
                    });
                    this.dialogForm.get("API_SERVICE_PARENT_GROUPID").valueChanges.subscribe(value => {
                        if (value == '') {
                            value = null;
                        }
                        object.API_SERVICE_PARENT_GROUPID = value;
                        this._ApiGroupService.updateObjectById(this.object?.API_SERVICE_GROUPID, this.object).subscribe();
                    })
                    this.dialogForm.get("API_SERVICE_GROUPDESC").valueChanges.subscribe(value => {
                        object.API_SERVICE_GROUPDESC = value;
                    })
                    this.dialogForm.get("API_SERVICE_GROUPORD").valueChanges.subscribe(value => {
                        object.API_SERVICE_GROUPORD = value;
                    })
                    this.dialogForm.get("API_SERVICE_GROUP_ICON").valueChanges.subscribe(value => {
                        object.API_SERVICE_GROUP_ICON = value;
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
    getChildObjectByParent(parentId, lstItem): ObjectNode[] {
        let items: ObjectNode[] = [];
        let item: ObjectNode;
        lstItem.forEach((obj) => {
            if (obj.API_SERVICE_PARENT_GROUPID != null && obj.API_SERVICE_PARENT_GROUPID == parentId) {
                items.push({
                    object: obj,
                    children: this.getChildObjectByParent(obj.API_SERVICE_GROUPID, lstItem)
                })
            }
        });
        return items;
    }
    onOpenApiGroupParentSelect() {
        setTimeout(_ => this.trigger.openPanel());
    }
    onTreeNodeApiGroupParent(node: any): void {
        if ((!node.object.SYS_ACTION || node.object.SYS_ACTION != State.create)
            && this.checkChangeParent(this.dialogForm.controls['API_SERVICE_GROUPID'].value, node.object.API_SERVICE_GROUPID)) {
            this.dialogForm.controls['API_SERVICE_PARENT_GROUPID'].setValue(node.object.API_SERVICE_GROUPID);
        } else {
            this._messageService.showWarningMessage("Thông báo", "Không thể chuyển vào vị trí này");
        }
    }
    searchNodeObject(id, tree: ObjectNode[]): ObjectNode {
        let objResult: ObjectNode = null;
        if (tree) {
            for (let obj of tree) {
                if (obj.object.API_SERVICE_GROUPID == id) {
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
    checkChangeParent(parentId, parentIdChange): boolean {
        if (parentId == parentIdChange) {
            return false;
        }
        let node = this.searchNodeObject(parentId, this.lstTreeListApiGroup.data);
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
                        this._ApiGroupService.createObjectToServer(this.object?.API_SERVICE_GROUPID).pipe(takeUntil(this._unsubscribeAll))
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
                                    case -4:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm cha chưa ghi dữ liệu hoặc không tồn tại");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._ApiGroupService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._ApiGroupService.updateObjectById(this.object?.API_SERVICE_GROUPID, resultApi.data).subscribe(() => {
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
                        this._ApiGroupService.editObjectToServer(this.object?.API_SERVICE_GROUPID).pipe(takeUntil(this._unsubscribeAll))
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
                                    case -4:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm cha chưa ghi dữ liệu hoặc không tồn tại");
                                        break;
                                    case 1:
                                        this._ApiGroupService.viewObject(this.object?.API_SERVICE_GROUPID).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.API_SERVICE_GROUPID], { relativeTo: this._activatedRoute.parent });
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
                this._ApiGroupService.editObject({ "API_SERVICE_GROUPID": this.object?.API_SERVICE_GROUPID, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dịch vụ cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }

    onCancelObject(): void {
        this._ApiGroupService.cancelObject(this.object?.API_SERVICE_GROUPID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._ApiGroupService.viewObject(this.object?.API_SERVICE_GROUPID).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.API_SERVICE_GROUPID], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa nhóm dịch vụ \"" + this.object.API_SERVICE_GROUPDESC + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._ApiGroupService.deleteObject(this.object?.API_SERVICE_GROUPID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nhóm dịch vụ thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dịch vụ cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm dịch vụ");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm dữ liệu đã sử dụng nên ko thể xóa");
                                        break;
                                }

                            });
                    } else {
                        this._ApiGroupService.deleteObjectToServer(this.object?.API_SERVICE_GROUPID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._ApiGroupService.deleteObject(this.object?.API_SERVICE_GROUPID)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa nhóm dịch vụ thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dịch vụ cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm dịch vụ");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy nhóm dịch vụ cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa nhóm dịch vụ");
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
