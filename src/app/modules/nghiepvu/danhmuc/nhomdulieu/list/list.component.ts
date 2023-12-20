import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from 'app/shared/commons/conmon.types';
import { FunctionService } from 'app/core/function/function.service';
import { NhomDuLieuService } from '../nhomdulieu.service';
import { NhomDuLieuComponent } from '../nhomdulieu.component';
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

export class NhomDuLieuListComponent implements OnInit, OnDestroy {
  @ViewChild('objectList') apiList: ElementRef;
  public State = State;
  lstTreeNhomDuLieuControl = new FlatTreeControl<ObjectFlatNode>(
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
  lstTreeNhomDuLieuFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );
  lstTreeNhomDuLieu = new MatTreeFlatDataSource(this.lstTreeNhomDuLieuControl, this.lstTreeNhomDuLieuFlattener);

  lstTreeNhomDuLieuHasChild = (_: number, node: ObjectFlatNode) => node.expandable;
  apisAddNew: any[];
  loading: boolean = false;
  selectedObject: any;
  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    public _nhomdulieuComponent: NhomDuLieuComponent,
    private _nhomdulieuService: NhomDuLieuService,
    private _messageService: MessageService,
    private _userService: UserService,
    public _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _functionService: FunctionService,
    private el: ElementRef
  ) {
    this.lstTreeNhomDuLieu.data = []

  }

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });

    // Api New
    this._nhomdulieuService.lstNhomDuLieu$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lstNhomDuLieu: any[]) => {
        let lstTreeDataNhomDuLieu: ObjectNode[] = []
        if (lstNhomDuLieu && lstNhomDuLieu.length > 0) {

          lstNhomDuLieu.forEach((obj) => {
            if (obj?.MA_NHOM_CHA == null) {
              lstTreeDataNhomDuLieu.push({ object: obj, children: this.getChildObjectByParent(obj.MA_NHOM, lstNhomDuLieu) })
            }
          })
          this.lstTreeNhomDuLieu.data = lstTreeDataNhomDuLieu;
          //this.lstTreeNhomDuLieuControl.dataNodes = lstTreeDataNhomDuLieu;
          this.lstTreeNhomDuLieuControl.expandAll()
        } else {
          this.lstTreeNhomDuLieu.data = lstTreeDataNhomDuLieu;
          //this.lstTreeNhomDuLieuControl.dataNodes = lstTreeDataNhomDuLieu;
        }
      });


    this._nhomdulieuService.Object$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((object: any) => {
        this.selectedObject = object;
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
  ngAfterViewInit() {
    this.selectObjectMarker();
  }
  selectObjectMarker() {
    this.el.nativeElement.querySelector('.selectObject')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  addNewGroup() {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        this._nhomdulieuService.createObject({ "userId": this.user.userId, "maNhomCha": null }).pipe(takeUntil(this._unsubscribeAll))
          .subscribe((data) => {
            //this._router.navigate([data]);
            this._router.navigate(['./' + data], { relativeTo: this._activatedRoute }).then(() => {
              this.selectObjectMarker();
            });
          });
      } else {
        this._messageService.showErrorMessage("Thông báo", "Bạn không được phép thêm mới");
      }
    })

  }
  addNewGroupParent(parentId: string) {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        this._nhomdulieuService.createObject({ "userId": this.user.userId, "maNhomCha": parentId }).pipe(takeUntil(this._unsubscribeAll))
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
    this._nhomdulieuService.selectedObjectChanged.next(object);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

}
