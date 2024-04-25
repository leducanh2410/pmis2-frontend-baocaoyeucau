import { Component, OnInit, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { ReplaySubject, takeUntil } from 'rxjs';
import { KhaiThacDuLieuService } from '../../khaithacdulieu.service';
import { MessageService } from 'app/shared/message.services';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MauDuLieuShare } from 'app/core/models/MauDuLieuShare';
import { DashboardService } from 'app/modules/admin/dashboards/dashboard/dashboard.service';
import { DashboardShare } from 'app/core/models/DashboardShare';
@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss']
})
export class ShareDialogComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['CHECKBOX', 'USERID', 'USERNAME', 'EDITABLE', 'SHAREABLE'];
  user: User;
  private _unsubsribeAll: ReplaySubject<any> = new ReplaySubject(null);
  lstUserDataSource: MatTableDataSource<any> = new MatTableDataSource(null);
  @ViewChild('paginator') paginator: MatPaginator;
  lstSelectedDuLieu: string[];
  filterValue: string;
  title: string;
  isCopy: boolean;
  isShareDashboard: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { lstSelectedDuLieu: string[], title: string, isCopy: boolean, isShareDashboard: boolean },
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    private _userService: UserService,
    private _khaiThacDuLieuService: KhaiThacDuLieuService,
    private _messageService: MessageService,
    private _dashboardService: DashboardService
  ) { 
    this.lstSelectedDuLieu = data.lstSelectedDuLieu;
    this.filterValue = '';
    this.title = data.title;
    this.isCopy = data.isCopy;
    this.isShareDashboard = data.isShareDashboard;
    if (this.isCopy) {
      this.displayedColumns = ['CHECKBOX', 'USERID', 'USERNAME'];
    } else {
      this.displayedColumns = ['CHECKBOX', 'USERID', 'USERNAME', 'EDITABLE', 'SHAREABLE'];
    }
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this._unsubsribeAll.next(null);
    this._unsubsribeAll.complete();
  }

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubsribeAll))
      .subscribe((response: any) => {
        this.user = response;
      });
    
    // this._khaiThacDuLieuService.getAllUserSameOrg(this.user.userId)
    this._dashboardService.getAllUser(this.user.userId)
      .pipe(takeUntil(this._unsubsribeAll))
      .subscribe((response: any) => {
        if (response.status == 1) {
          this.lstUserDataSource = new MatTableDataSource(response.data);
          this.lstUserDataSource.paginator = this.paginator;
          this.lstUserDataSource.filterPredicate = (data: any, filter: string) => data.USERID.indexOf(filter) != -1 || data.USERNAME.indexOf(filter) != -1;
        } else {
          this._messageService.showErrorMessage('Thông báo', response.message);
        }
      })
  }

  closeDialog() {
    this.dialogRef.close();
  }

  applyFilter(): void {
    this.lstUserDataSource.filter = this.filterValue.toLowerCase();
  }

  allChecked(type: string): boolean {
    let lstUser = this.lstUserDataSource.data;
    if (lstUser == undefined || lstUser == null || lstUser.length == 0) {
      return false;
    }
    for (const e of lstUser) {
      if (!e[type]) {
        return false;
      }
    }
    return true;
  }

  checkAll(type: string): void {
    let lstUser = this.lstUserDataSource.data;
    if (!this.allChecked(type)) {
      for (const e of lstUser) {
        e[type] = 1;
      }
    } else {
      for (const e of lstUser) {
        e[type] = 0;
      }
    }
  }

  selectedRow(record: any): void {
    record.SELECTED = !record.SELECTED;
    record.EDITABLE = record.SELECTED;
    record.SHAREABLE = record.SELECTED;
  }

  onCheck(type: string, event: any, record: any): void {
    record[type] = event.checked ? 1 : 0;
  }

  onSave(): void {
    if (this.isShareDashboard == true) {
      try {
        this.lstUserDataSource.data.forEach(e => {
          if (e.SELECTED == 1) {
            this.lstSelectedDuLieu.forEach(ee => {
             
                let body: DashboardShare = {
                  MA_DASHBOARD: ee,
                  USER_ID: e.USERID,
                  USER_CR_ID: this.user.userId,
                  EDITABLE: e.EDITABLE,
                  SHAREABLE: e.SHAREABLE,
                 }
                this._dashboardService.insertDashboardShare(body).subscribe(); 
              
            });
          }
        });
        this._messageService.showSuccessMessage('Thông báo',  'Chia sẻ dashboard tới người dùng khác thành công');
      } catch (error) {
        this._messageService.showErrorMessage('Thông báo', 'Xảy ra lỗi khi chia sẻ dashboard tới người dùng khác');
      }
    } else {
    try {
      this.lstUserDataSource.data.forEach(e => {
        if (e.SELECTED == 1) {
          this.lstSelectedDuLieu.forEach(ee => {
            if (this.isCopy) {
              this._khaiThacDuLieuService.insertMauDuLieuCopy(ee, e.USERID, this.user.userId).subscribe();
            } else {
              let body: MauDuLieuShare = {
                MA_DULIEU: ee,
                USERID: e.USERID,
                USER_CR_ID: this.user.userId,
                EDITABLE: e.EDITABLE,
                SHAREABLE: e.SHAREABLE,
              }
              this._khaiThacDuLieuService.insertMauDuLieuShare(body).subscribe(); 
            }
          });
        }
      });
      this._messageService.showSuccessMessage('Thông báo', this.isCopy ? 'Dữ liệu được sao chép thành công' : 'Chia sẻ dữ liệu khai thác tới người dùng khác thành công');
    } catch (error) {
      this._messageService.showErrorMessage('Thông báo', 'Xảy ra lỗi khi chia sẻ dữ liệu khai thác tới người dùng khác');
    }
   }
  }
}
