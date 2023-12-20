import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from 'app/shared/commons/conmon.types';
import { FunctionService } from 'app/core/function/function.service';
import { VeBieuDoService } from '../vebieudo.service';
import { VeBieuDoComponent } from '../vebieudo.component';
import { MAX_INT_32BIT } from 'app/core/constants/chart-info';

@Component({
  selector: 'component-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VeBieuDoListComponent implements OnInit, OnDestroy {
  public State = State;
  lstObjects: any[];
  apisAddNew: any[];
  loading: boolean = false;
  selectedObject: any;
  user: User;
  group: any;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  isHide: boolean = false;

  /**
   * Constructor
   */
  constructor(
    public _vebieudoComponent: VeBieuDoComponent,
    private _vebieudoService: VeBieuDoService,
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
    this._vebieudoService.group$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((group: any) => {
        this.group = group;
        this.getTableInfoAndRenderChart();
      });
    // Api New
    this._vebieudoService.lstObjects$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lstObjects: any[]) => {
        this.lstObjects = lstObjects;
      });


    this._vebieudoService.Object$
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

  addNew() {
    if (!this.group?.MA_DULIEU) {
      this._messageService.showWarningMessage("Thông báo", "Bạn chưa chọn dữ liệu khai thác");
      return;
    }
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        this._vebieudoService.createObject({ "userId": this.user.userId, "MA_DULIEU": this.group.MA_DULIEU }).pipe(takeUntil(this._unsubscribeAll))
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

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onObjectSelected(object: any): void {
    // If the mail is unread...
    //this._apiService.getApiById(api.API_SERVICEID);
    // Execute the mailSelected observable
    this._vebieudoService.selectedObjectChanged.next(object);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  toggle(): void {
    this.isHide = !this.isHide;
    this._vebieudoService.toggle(this.isHide);
    this._vebieudoComponent.drawer.toggle()
  }

  async getTableInfoAndRenderChart() {
    if (this.group == null) {
      return;
    }
    await firstValueFrom(this._vebieudoService.getDataExploitation(this.group.MA_DULIEU).pipe(takeUntil(this._unsubscribeAll)))
      .then((e: any) => {
        if (e.status == 1) {
          this._vebieudoService.setDuLieuDaKhaiThac(e.data.data);
          this._vebieudoService.setRows(e.data.rows);
        } else {
          this._messageService.showErrorMessage('Thông báo', e.message);
        }
      })
  }

  routeToDataExploitation(): void {
    this._router.navigate([`nghiepvu/khaithac/khaithacdulieu/${this.group?.MA_DULIEU}`])
  }
}
