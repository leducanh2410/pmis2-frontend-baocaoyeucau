import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from 'app/shared/commons/conmon.types';
import { FunctionService } from 'app/core/function/function.service';
import { ListUserService } from '../listuser.service';
import { ListUserComponent } from '../listuser.component';

@Component({
  selector: 'api-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ListUserListComponent implements OnInit, OnDestroy {
  @ViewChild('apiList') apiList: ElementRef;
  public State = State;

  group: any;
  objects: any[];
  apisAddNew: any[];
  loading: boolean = false;
  pagination: any;
  selectedApi: any;
  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    public listuserComponent: ListUserComponent,
    private _listUserService: ListUserService,
    private _messageService: MessageService,
    private _userService: UserService,
    public _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _functionService: FunctionService,
    private el: ElementRef
  ) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });

    this._listUserService.group$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((group: any) => {
        this.group = group;
      });

    // Api New
    this._listUserService.objects$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((objects: any[]) => {
        this.objects = objects;
      });

    this._listUserService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pagination) => {
        this.pagination = pagination;
      });


    this._listUserService.Object$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((api: any) => {
        this.selectedApi = api;
      });
  }
  ngAfterViewInit() {
    this.selectObjectMarker();
  }
  selectObjectMarker() {
    this.el.nativeElement.querySelector('.selectObject')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  addNewListUser() {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        if (this.group == null) {
          this._messageService.showErrorMessage("Thông báo", "Chưa chọn nhóm dữ liệu");
        }
        this._listUserService.createObject({ "groupid": this.group.ORGID, "userId": this.user.userId }).pipe(takeUntil(this._unsubscribeAll))
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
   * On mail selected
   *
   * @param mail
   */
  onObjectSelected(object: any): void {
    // If the mail is unread...
    // Execute the mailSelected observable
    this._listUserService.selectedApiChanged.next(object);
  }

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
