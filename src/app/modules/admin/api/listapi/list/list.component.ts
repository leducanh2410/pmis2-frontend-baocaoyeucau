import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'app/modules/admin/api/listapi/api.service';
import { ApiComponent } from 'app/modules/admin/api/listapi/api.component';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from 'app/shared/commons/conmon.types';
import { FunctionService } from 'app/core/function/function.service';

@Component({
  selector: 'api-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApiListComponent implements OnInit, OnDestroy {
  @ViewChild('apiList') apiList: ElementRef;
  public State = State;
  groups: any[];
  group: any;
  apis: any[];
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
    public apiComponent: ApiComponent,
    private _apiService: ApiService,
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
    // Group
    this._apiService.groups$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((groups: any) => {
        this.groups = groups;
      });

    this._apiService.group$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((group: any) => {
        this.group = group;
      });

    // Api New
    this._apiService.apis$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((apis: any[]) => {
        this.apis = apis;
      });

    this._apiService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((pagination) => {
        this.pagination = pagination;
      });


    this._apiService.Object$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((api: any) => {
        this.selectedApi = api;
      });
  }
  addNew() {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        if (this.group == null) {
          this._messageService.showErrorMessage("Thông báo", "Chưa chọn nhóm dịch vụ");
        }
        this._apiService.createObject({ "groupid": this.group.API_SERVICE_GROUPID, "userId": this.user.userId }).pipe(takeUntil(this._unsubscribeAll))
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
  ngAfterViewInit() {
    this.selectObjectMarker();
  }
  selectObjectMarker() {
    this.el.nativeElement.querySelector('.selectObject')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  onApiSelected(api: any): void {
    // If the mail is unread...
    //this._apiService.getApiById(api.API_SERVICEID);
    // Execute the mailSelected observable
    this._apiService.selectedApiChanged.next(api);
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
