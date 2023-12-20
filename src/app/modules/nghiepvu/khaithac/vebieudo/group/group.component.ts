import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { VeBieuDoService } from '../vebieudo.service';

@Component({
  selector: 'vebieudo-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VeBieuDoGroupComponent implements OnInit, OnDestroy {
  group: any;
  dataSource: any[];
  lstGroup: any[]
  selectedObjectGroup: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  searching: boolean = false;
  searchingValue: string = '';

  /**
   * Constructor
   */
  constructor(
    private _listUserService: VeBieuDoService,
  ) {
    this.lstGroup = []
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
      .subscribe((lstGroup: any[]) => {
        this.lstGroup = lstGroup;
        this.dataSource = lstGroup;
      });

    // Nhom
    this._listUserService.group$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((group: any[]) => {
        this.group = group;
      });

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  
  onSearching() {
    this.lstGroup = this.dataSource.filter(e => e.MO_TA.toUpperCase().includes(this.searchingValue.toUpperCase()));
  }

  onCancelSearch() {
    this.searching = false;
    this.searchingValue = '';
    this.lstGroup = this.dataSource;
  }
}
