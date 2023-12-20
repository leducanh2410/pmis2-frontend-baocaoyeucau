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
import { OrganizationService } from '../listorganization.service';
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

export class OrganizationDetailsComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    @ViewChild('trigger') trigger: MatAutocompleteTrigger;
    public StateEnum = State;
    object: any;
    dialogForm: UntypedFormGroup;
    lstTreeListOrganizationControl = new FlatTreeControl<ObjectFlatNode>(
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
    lstTreeListOrganizationFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );
    lstTreeListOrganization = new MatTreeFlatDataSource(this.lstTreeListOrganizationControl, this.lstTreeListOrganizationFlattener);

    lstTreeListOrganizationnHasChild = (_: number, node: ObjectFlatNode) => node.expandable;
    /**
     * Constructor
     */
    constructor(
        private _OrganizationService: OrganizationService,
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
        this._OrganizationService.lstOrganization$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((lstOrganization: any[]) => {
                let lstTreeDataOrganization: ObjectNode[] = []
                if (lstOrganization && lstOrganization.length > 0) {

                    lstOrganization.forEach((obj) => {
                        if (obj?.ORGID_PARENT == null) {
                            lstTreeDataOrganization.push({ object: obj, children: this.getChildObjectByParent(obj.ORGID, lstOrganization) })
                        }
                    })
                    this.lstTreeListOrganization.data = lstTreeDataOrganization;
                    this.lstTreeListOrganizationControl.expandAll()
                } else {
                    this.lstTreeListOrganization.data = lstTreeDataOrganization;
                }
            });
        // Chi tiet API
        this._OrganizationService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((object: any) => {
                this.object = object;
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        ORGID_PARENT: [object?.ORGID_PARENT,[Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_]*")]],
                        ORGID: [object?.ORGID],
                        ORGCODE: [object?.ORGCODE, [Validators.required, Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9_]*")]],
                        ENABLE: [object?.ENABLE, [Validators.required]],
                        ORGORD: [object?.ORGORD, [Validators.required]],
                        ORGDESC: [object?.ORGDESC, [Validators.required, Validators.maxLength(500)]]
                    });
                    this.dialogForm.get("ORGID_PARENT").valueChanges.subscribe(value => {
                        if (value == '') {
                            value = null;
                        }
                        object.ORGID_PARENT = value;
                        this._OrganizationService.updateObjectById(this.object?.ORGID, this.object).subscribe();
                    })
                    this.dialogForm.get("ORGCODE").valueChanges.subscribe(value => {
                        object.ORGCODE = value;
                    })
                    this.dialogForm.get("ENABLE").valueChanges.subscribe(value => {
                        object.ENABLE = value;
                    })
                    this.dialogForm.get("ORGORD").valueChanges.subscribe(value => {
                        object.ORGORD = value;
                    })
                    this.dialogForm.get("ORGDESC").valueChanges.subscribe(value => {
                        object.ORGDESC = value;
                    })
                }
            });

    }
    getChildObjectByParent(parentId, lstItem): ObjectNode[] {
        let items: ObjectNode[] = [];
        let item: ObjectNode;
        lstItem.forEach((obj) => {
            if (obj.ORGID_PARENT != null && obj.ORGID_PARENT == parentId) {
                items.push({
                    object: obj,
                    children: this.getChildObjectByParent(obj.ORGID, lstItem)
                })
            }
        });
        return items;
    }
    onOpenOrganizationParentSelect() {
        setTimeout(_ => this.trigger.openPanel());
    }
    onTreeNodeOrganizationParent(node: any): void {
        if ((!node.object.SYS_ACTION || node.object.SYS_ACTION != State.create)
            && this.checkChangeParent(this.dialogForm.controls['ORGID'].value, node.object.ORGID)) {
            this.dialogForm.controls['ORGID_PARENT'].setValue(node.object.ORGID);
        } else {
            this._messageService.showWarningMessage("Thông báo", "Không thể chuyển vào vị trí này");
        }
    }
    searchNodeObject(id, tree: ObjectNode[]): ObjectNode {
        let objResult: ObjectNode = null;
        if (tree) {
            for (let obj of tree) {
                if (obj.object.ORGID == id) {
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
        let node = this.searchNodeObject(parentId, this.lstTreeListOrganization.data);
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
                        this._OrganizationService.createObjectToServer(this.object?.ORGID).pipe(takeUntil(this._unsubscribeAll))
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
                                        this._messageService.showErrorMessage("Thông báo", "Mã đơn vị đã tồn tại trong hệ thống");
                                        break;
                                    case -4:
                                        this._messageService.showErrorMessage("Thông báo", "Đơn vị cha chưa ghi dữ liệu hoặc không tồn tại");
                                        break;
                                    default:
                                        if (result != null && result.length > 0) {
                                            this._OrganizationService.getObjectfromServer(result).pipe(takeUntil(this._unsubscribeAll)).subscribe((resultApi: any) => {
                                                this._OrganizationService.updateObjectById(this.object?.ORGID, resultApi.data).subscribe(() => {
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
                        this._OrganizationService.editObjectToServer(this.object?.ORGID).pipe(takeUntil(this._unsubscribeAll))
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
                                    case -3:
                                        this._messageService.showErrorMessage("Thông báo", "Mã đơn vị đã tồn tại trong hệ thống");
                                        break;
                                    case -4:
                                        this._messageService.showErrorMessage("Thông báo", "Đơn vị cha chưa ghi dữ liệu hoặc không tồn tại");
                                        break;
                                    case 1:
                                        this._OrganizationService.viewObject(this.object?.ORGID).subscribe(() => {
                                            this._messageService.showSuccessMessage("Thông báo", "Ghi dữ liệu thành công");
                                            this._router.navigated = false;
                                            this._router.navigate([this.object?.ORGID], { relativeTo: this._activatedRoute.parent });
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
                this._OrganizationService.editObject({ "ORGID": this.object?.ORGID, "USER_MDF_ID": this.user.userId })
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result: any) => {
                        switch (result) {
                            case 0:
                                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy đơn vị quản lý cần sửa");
                                break;
                        }

                    })
            } else {
                this._messageService.showErrorMessage("Thông báo", "Bạn không có quyền thực hiện");
            }
        });
    }

    onCancelObject(): void {
        this._OrganizationService.cancelObject(this.object?.ORGID)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result == 1) {
                    this._OrganizationService.viewObject(this.object?.ORGID).subscribe(() => {
                        this._router.navigated = false;
                        this._router.navigate([this.object?.ORGID], { relativeTo: this._activatedRoute.parent });
                    })
                }
            });
    }
    onDeleteObject() {
        this.authDeleteFromServer.subscribe((auth) => {
            if (auth) {
                this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa đơn vị quản lý \"" + this.object.ORGDESC + "\"", (toast: SnotifyToast) => {
                    this._messageService.notify().remove(toast.id);
                    if (this.object?.SYS_ACTION == State.create) {
                        this._OrganizationService.deleteObject(this.object?.ORGID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._messageService.showSuccessMessage("Thông báo", "Xóa đơn vị quản lý thành công");
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy đơn vị quản lý cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa đơn vị quản lý");
                                        break;
                                    case -2:
                                        this._messageService.showErrorMessage("Thông báo", "Nhóm dữ liệu đã sử dụng nên ko thể xóa");
                                        break;
                                }

                            });
                    } else {
                        this._OrganizationService.deleteObjectToServer(this.object?.ORGID)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((result: any) => {
                                switch (result) {
                                    case 1:
                                        this._OrganizationService.deleteObject(this.object?.ORGID)
                                            .pipe(takeUntil(this._unsubscribeAll))
                                            .subscribe((result: any) => {
                                                switch (result) {
                                                    case 1:
                                                        this._messageService.showSuccessMessage("Thông báo", "Xóa đơn vị quản lý thành công");
                                                        break;
                                                    case 0:
                                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy đơn vị quản lý cần xóa");
                                                        break;
                                                    case -1:
                                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa đơn vị quản lý");
                                                        break;
                                                }

                                            });
                                        break;
                                    case 0:
                                        this._messageService.showErrorMessage("Thông báo", "Không tìm thấy đơn vị quản lý cần xóa");
                                        break;
                                    case -1:
                                        this._messageService.showErrorMessage("Thông báo", "Xảy ra lỗi khi thực hiện xóa đơn vị quản lý");
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
