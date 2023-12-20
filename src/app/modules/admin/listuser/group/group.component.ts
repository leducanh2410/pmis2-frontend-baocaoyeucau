import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ListUserService } from '../listuser.service';
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
  selector: 'api-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListUserGroupComponent implements OnInit, OnDestroy {
  group: any;
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
  selectedObjectGroup: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _listUserService: ListUserService,
  ) {
    this.lstTreeNhomDuLieu.data = []
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this._listUserService.groups$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lstNhomDuLieu: any[]) => {
        let lstTreeDataNhomDuLieu: ObjectNode[] = []
        if (lstNhomDuLieu && lstNhomDuLieu.length > 0) {

          lstNhomDuLieu.forEach((obj) => {
            if (obj?.ORGID_PARENT == null) {
              lstTreeDataNhomDuLieu.push({ object: obj, children: this.getChildObjectByParent(obj.ORGID, lstNhomDuLieu) })
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

    // Nhom
    this._listUserService.group$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((group: any[]) => {
        this.group = group;
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
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}
