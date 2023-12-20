import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { FuseNavigationItem, FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { ApiService } from 'app/modules/admin/api/listapi/api.service';
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
export class ApiGroupComponent implements OnInit, OnDestroy {
  groups: any[];
  group: any;
  lstTreeNhomControl = new FlatTreeControl<ObjectFlatNode>(
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
  lstTreeNhomFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );
  lstTreeNhom = new MatTreeFlatDataSource(this.lstTreeNhomControl, this.lstTreeNhomFlattener);

  lstTreeNhomHasChild = (_: number, node: ObjectFlatNode) => node.expandable;
  selectedObjectGroup: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _apiService: ApiService,    
  ) {
    this.lstTreeNhom.data = []
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Folders
    this._apiService.groups$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lstNhom: any[]) => {
        //this.groups = groups;

        let lstTreeDataNhom: ObjectNode[] = []
        if (lstNhom && lstNhom.length > 0) {

          lstNhom.forEach((obj) => {
            if (obj?.API_SERVICE_PARENT_GROUPID == null) {
              lstTreeDataNhom.push({ object: obj, children: this.getChildObjectByParent(obj.API_SERVICE_GROUPID, lstNhom) })
            }
          })
          this.lstTreeNhom.data = lstTreeDataNhom;
          //this.lstTreeNhomControl.dataNodes = lstTreeDataNhom;
          this.lstTreeNhomControl.expandAll()
        } else {
          this.lstTreeNhom.data = lstTreeDataNhom;
          //this.lstTreeNhomControl.dataNodes = lstTreeDataNhom;
        }
      });

    this._apiService.group$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((group: any[]) => {
        this.group = group;
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
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}
