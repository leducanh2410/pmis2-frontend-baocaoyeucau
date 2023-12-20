import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from 'app/shared/commons/conmon.types';
import { FunctionService } from 'app/core/function/function.service';
import { ApiGroupService } from '../listapigroup.service';
import { ApiGroupComponent } from '../listapigroup.component';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';

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
  selector: 'component-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ApiGroupListComponent implements OnInit, OnDestroy {
  @ViewChild('objectList') apiList: ElementRef;
  public State = State;
  lstTreeApiGroupControl = new FlatTreeControl<ObjectFlatNode>(
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
  lstTreeApiGroupFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );
  lstTreeApiGroup = new MatTreeFlatDataSource(this.lstTreeApiGroupControl, this.lstTreeApiGroupFlattener);

  lstTreeApiGroupHasChild = (_: number, node: ObjectFlatNode) => node.expandable;
  apisAddNew: any[];
  loading: boolean = false;
  selectedObject: any;
  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    public _listapigroupComponent: ApiGroupComponent,
    private _listapigroupService: ApiGroupService,
    private _messageService: MessageService,
    private _userService: UserService,
    public _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _functionService: FunctionService,
    private el: ElementRef
  ) {
    this.lstTreeApiGroup.data = []

  }

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });

    // Api New
    this._listapigroupService.lstApiGroup$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lstApiGroup: any[]) => {
        let lstTreeDataApiGroup: ObjectNode[] = []
        if (lstApiGroup && lstApiGroup.length > 0) {

          lstApiGroup.forEach((obj) => {
            if (obj?.API_SERVICE_PARENT_GROUPID == null) {
              lstTreeDataApiGroup.push({ object: obj, children: this.getChildObjectByParent(obj.API_SERVICE_GROUPID, lstApiGroup) })
            }
          })
          this.lstTreeApiGroup.data = lstTreeDataApiGroup;
          //this.lstTreeApiGroupControl.dataNodes = lstTreeDataApiGroup;
          this.lstTreeApiGroupControl.expandAll()
        } else {
          this.lstTreeApiGroup.data = lstTreeDataApiGroup;
          //this.lstTreeApiGroupControl.dataNodes = lstTreeDataApiGroup;
        }
      });


    this._listapigroupService.Object$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((object: any) => {
        this.selectedObject = object;
      });
  }
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
  ngAfterViewInit() {
    this.selectObjectMarker();
  }
  selectObjectMarker() {
    this.el.nativeElement.querySelector('.selectObject')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  addNewGroup() {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        this._listapigroupService.createObject({ "userId": this.user.userId, "maNhomCha": null }).pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            //this._router.navigate([data]);
            this._router.navigate(['./' + data], { relativeTo: this._activatedRoute }).then(() => {
              this.selectObjectMarker();
            });;
          });
      } else {
        this._messageService.showErrorMessage("Thông báo", "Bạn không được phép thêm mới");
      }
    })

  }
  addNewGroupParent(parentId: string) {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        this._listapigroupService.createObject({ "userId": this.user.userId, "maNhomCha": parentId }).pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            //this._router.navigate([data]);
            this._router.navigate(['./' + data], { relativeTo: this._activatedRoute }).then(() => {
              this.selectObjectMarker();
            });;
          });
      } else {
        this._messageService.showErrorMessage("Thông báo", "Bạn không được phép thêm mới");
      }
    })

  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onObjectSelected(object: any): void {
    // If the mail is unread...
    //this._apiService.getApiById(api.API_SERVICEID);
    // Execute the mailSelected observable
    this._listapigroupService.selectedObjectChanged.next(object);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

}
