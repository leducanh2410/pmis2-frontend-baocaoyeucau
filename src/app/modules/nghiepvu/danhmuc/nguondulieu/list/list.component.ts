import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from 'app/shared/commons/conmon.types';
import { FunctionService } from 'app/core/function/function.service';
import { NguonDuLieuService } from '../nguondulieu.service';
import { NguonDuLieuComponent } from '../nguondulieu.component';

@Component({
  selector: 'component-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NguonDuLieuListComponent implements OnInit, OnDestroy {
  @ViewChild('objectList') apiList: ElementRef;
  public State = State;
  lstNguonDuLieu: any[];
  apisAddNew: any[];
  loading: boolean = false;
  selectedObject: any;
  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    public _nguonDuLieuComponent: NguonDuLieuComponent,
    private _nguonDuLieuService: NguonDuLieuService,
    private _messageService: MessageService,
    private _userService: UserService,
    public _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _functionService: FunctionService,
    private el: ElementRef
  ) {
  }

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });

    // Api New
    this._nguonDuLieuService.lstNguonDuLieu$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lstNguonDuLieu: any[]) => {
        this.lstNguonDuLieu = lstNguonDuLieu;
      });


    this._nguonDuLieuService.Object$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((object: any) => {
        this.selectedObject = object;
      });
  }
  ngAfterViewInit() {
    this.selectObjectMarker();
  }
  selectObjectMarker() {
    this.el.nativeElement.querySelector('.selectObject')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    //filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    //this.lstNguonDuLieu.filter = filterValue;
    this._nguonDuLieuService.getNguonDuLieuBySearch(filterValue).subscribe();
  }
  addNew() {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        this._nguonDuLieuService.createObject({ "userId": this.user.userId }).pipe(takeUntil(this._unsubscribeAll))
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

  onApiSelected(object: any): void {
    // If the mail is unread...
    //this._apiService.getApiById(api.API_SERVICEID);
    // Execute the mailSelected observable
    this._nguonDuLieuService.selectedObjectChanged.next(object);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
