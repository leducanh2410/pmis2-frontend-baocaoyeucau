import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ActivatedRoute, Router } from '@angular/router';
import { State } from 'app/shared/commons/conmon.types';
import { FunctionService } from 'app/core/function/function.service';
import { KhaiThacDuLieuService } from '../khaithacdulieu.service';
import { KhaiThacDuLieuComponent } from '../khaithacdulieu.component';
import { MatDialog } from '@angular/material/dialog';
import { ShareDialogComponent } from './share-dialog/share-dialog.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'component-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KhaiThacDuLieuListComponent implements OnInit, OnDestroy {
  public State = State;
  dataSource: any[];
  lstKhaiThacDuLieu: any[];
  apisAddNew: any[];
  loading: boolean = false;
  selectedObject: any;
  user: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  searching: boolean = false;
  searchingValue: string = '';

  // dataSourceShared: any[] = [];
  // lstKhaiThacDuLieuShared: any[] = [];
  // sharedSearchingValue: string = '';

  showSharedCheckbox: boolean;
  showCopiedCheckbox: boolean;
  isCopy: boolean;
  /**
   * Constructor
   */
  constructor(
    public _khaithacdulieuComponent: KhaiThacDuLieuComponent,
    private _khaithacdulieuService: KhaiThacDuLieuService,
    private _messageService: MessageService,
    private _userService: UserService,
    public _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _functionService: FunctionService,
    private el: ElementRef,
    private _dialog: MatDialog,
  ) {
    this.showSharedCheckbox = false;
    this.showCopiedCheckbox = false;
  }

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: any) => {
        this.user = user;
      });

    // Api New
    this._khaithacdulieuService.lstKhaiThacDuLieu$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((lstKhaiThacDuLieu: any[]) => {
        console.log(lstKhaiThacDuLieu);
        
        this.lstKhaiThacDuLieu = lstKhaiThacDuLieu;
        // this.lstKhaiThacDuLieu = lstKhaiThacDuLieu.filter(e => this.lstKhaiThacDuLieuShared.filter(ee => ee.MA_DULIEU == e.MA_DULIEU).length == 0);
        this.dataSource = this.lstKhaiThacDuLieu;
        this.clearListChecked();
      });


    this._khaithacdulieuService.Object$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((object: any) => {
        console.log(object);
        
        this.selectedObject = object;
      });

    this._khaithacdulieuService.lstKhaiThacDuLieuShared$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.lstKhaiThacDuLieu.forEach(e => {
          let findElement = response.find(ee => ee.MA_DULIEU == e.MA_DULIEU);
          if (findElement != null) {
            e.SHAREABLE = findElement.SHAREABLE;
            e.EDITABLE = findElement.EDITABLE;
            e.COPYABLE = 0;
          } else {
            e.SHAREABLE = 1;
            e.EDITABLE = 1;
            e.COPYABLE = 1;
          }
        })
        // this.dataSourceShared = response;
        // this.lstKhaiThacDuLieuShared = response;
        // this.lstKhaiThacDuLieu = this.lstKhaiThacDuLieu.filter(e => this.lstKhaiThacDuLieuShared.filter(ee => ee.MA_DULIEU == e.MA_DULIEU).length == 0);
        // this.dataSource = this.lstKhaiThacDuLieu;
      });
  }

  ngAfterViewInit() {
    this.selectObjectMarker();
  }
  selectObjectMarker() {
    this.el.nativeElement.querySelector('.selectObject')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  addNew() {
    this._functionService.isInsert().subscribe((auth: boolean) => {
      if (auth) {
        this._khaithacdulieuService.createObject({ "userId": this.user.userId }).pipe(takeUntil(this._unsubscribeAll))
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

  onApiSelected(object: any): void {
    // If the mail is unread...
    //this._apiService.getApiById(api.API_SERVICEID);
    // Execute the mailSelected observable
    this._khaithacdulieuService.selectedObjectChanged.next(object);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  onSearching() {
    this.lstKhaiThacDuLieu = this.dataSource.filter(e => e.MO_TA.toUpperCase().includes(this.searchingValue.toUpperCase()));
  }

  // onSharedSearching() {
  //   this.lstKhaiThacDuLieuShared = this.dataSourceShared.filter(e => e.MO_TA.toUpperCase().includes(this.sharedSearchingValue.toUpperCase()));
  // }

  share(): void {
    this.showSharedCheckbox = true;
    this.isCopy = false;
  }

  showSharedUserDialog(): void {
    let lstSelectedDuLieu = [];
    this.lstKhaiThacDuLieu.forEach(e => {
      if (e?.CHECKED) {
        lstSelectedDuLieu.push(e.MA_DULIEU);
      }
    });
    // this.lstKhaiThacDuLieuShared.forEach(e => {
    //   if (e?.CHECKED) {
    //     lstSelectedDuLieu.push(e.MA_DULIEU);
    //   }
    // });
    if (lstSelectedDuLieu.length == 0) {
      this._messageService.showWarningMessage('Thông báo', 'Bạn chưa chọn mẫu dữ liệu nào.');
      return;
    }
    
    const dialogRef = this._dialog.open(ShareDialogComponent, {
      width: '50%',
      height: 'auto',
      data: { 
        lstSelectedDuLieu: lstSelectedDuLieu,
        isCopy: this.isCopy,
        title: this.isCopy ? 'Sao chép dữ liệu cho người dùng khác' : 'Chia sẻ dữ liệu tới người dùng khác',
        isShareDashboard: false,
      }
    });

    dialogRef.afterClosed().subscribe((response: any) => {

    })
  }

  cancelShare(): void {
    this.showSharedCheckbox = false;
    this.isCopy = false;
    this.clearListChecked();
  }

  copy(): void {
    this.isCopy = true;
    this.showCopiedCheckbox = true;
  }

  cancelCopied(): void {
    this.isCopy = false;
    this.showCopiedCheckbox = false;
    this.clearListChecked();
  }

  clearListChecked(): void {
    this.lstKhaiThacDuLieu.forEach(e => {
      e.CHECKED = false;
    })
  }

  onCancelSearch() {
    this.searching = false;
    this.searchingValue = '';
    this.lstKhaiThacDuLieu = this.dataSource;
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    let index = 0;
    this.lstKhaiThacDuLieu.forEach(e => {
      this._khaithacdulieuService.insertOrUpdateMauDuLieuOrd(e.MA_DULIEU, this.user.userId, index).subscribe();
      index++;
    });
  }
}
