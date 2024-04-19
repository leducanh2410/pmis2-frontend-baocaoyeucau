import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ReplaySubject, takeUntil } from 'rxjs';
import { DashboardService } from '../dashboard.service';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { DashboardShare } from 'app/core/models/DashboardShare';

@Component({
  selector: 'app-share-dashboard-user-dialog',
  templateUrl: './share-dashboard-user-dialog.component.html',
  styleUrls: ['./share-dashboard-user-dialog.component.scss']
})
export class ShareDashboardUserDialogComponent implements OnInit {
  displayedColumns: string[] = ['STT', 'USER_ID', 'USERNAME', 'EDITABLE', 'SHAREABLE', 'ACTION'];
  userId: string;
  maDuLieu: string;
  dashboardId: string;
  private _unsubsribeAll: ReplaySubject<any> = new ReplaySubject(null);
  lstUserDataSource: MatTableDataSource<any> = new MatTableDataSource(null);
  @ViewChild('paginator') paginator: MatPaginator;
  filterValue: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { userId: string, dashboardId: string },
    public dialogRef: MatDialogRef<ShareDashboardUserDialogComponent>,
    private _dashboardService: DashboardService,
    private _messageService: MessageService
  ) { 
    this.userId = data.userId;
    this.dashboardId = data.dashboardId;
    this.filterValue = '';
  }

  ngOnInit(): void {
    this._dashboardService.getAllSharedDashboardUsers(this.dashboardId)
      .pipe(takeUntil(this._unsubsribeAll))
      .subscribe((response: any) => {
        if (response.status == 1) {
          let index = 0;
          response.data.forEach(e => {
            e.STT = index;
            index++;
          });
          this.lstUserDataSource = new MatTableDataSource(response.data);
          this.lstUserDataSource.paginator = this.paginator;
        } else {
          this._messageService.showErrorMessage('Thông báo', response.message);
        }
      })
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onCheck(type: string, event: any, record: any): void {
    record[type] = event.checked ? 1 : 0;
  }

  onDeleteEvent(row: any): void {
    this._messageService.showConfirm('Thông báo', `Bạn có chắc chắn muốn hủy chia sẻ dữ liệu cho người dùng ${row.USERNAME}?`, (toast: SnotifyToast) => {
      this._messageService.notify().remove(toast.id);
      this._dashboardService.deleteSharedDashboard(this.dashboardId, row.USER_ID)
        .pipe(takeUntil(this._unsubsribeAll))
        .subscribe((response: any) => {
          if (response.status) {
            this._messageService.showSuccessMessage('Thông báo', `Hủy chia sẻ dữ liệu tới người dùng ${row.USERNAME} thành công`);
            this.lstUserDataSource.data = this.lstUserDataSource.data.filter(e => e.USER_ID != row.USER_ID);
            this.lstUserDataSource.filterPredicate = (data: any, filter: string) => data.USER_ID.indexOf(filter) != -1 || data.USERNAME.indexOf(filter) != -1;
          } else {
            this._messageService.showErrorMessage('Thông báo', response.message);
          }
        })
    })
  }

  applyFilter(): void {
    this.lstUserDataSource.filter = this.filterValue.toLowerCase();
  }
  
  onSave(): void {
    let existsEditMode = false;
    this.lstUserDataSource.data.forEach(e => {
      if (e.EDITMODE) {
        existsEditMode = true;
      }
    });

    if (existsEditMode) {
      this._messageService.showWarningMessage('Thông báo', 'Bạn cần lưu tất cả thay đổi trước khi ghi dữ liệu');
      return;
    }
    
    try {
      this.lstUserDataSource.data.forEach(e => {
        console.log(e);
        
        let body: DashboardShare = {
          SHAREABLE: e.SHAREABLE,
          USER_ID: e.USERID,
          MA_DASHBOARD: this.dashboardId,
          EDITABLE: e.EDITABLE,
          USER_MDF_ID: this.userId

          // MA_DASHBOARD: this.dashboardId,
          // USER_ID: e.USER_ID,
          // EDITABLE: e.EDITABLE,
          // SHAREABLE: e.SHAREABLE,
          // USER_MDF_ID: this.userId
        } 
        this._dashboardService.updateSharedDashboard(body).subscribe();
      });
      this._messageService.showSuccessMessage('Thông báo', 'Cập nhật thông tin chia sẻ dữ liệu thành công');
    } catch (error) {
      this._messageService.showErrorMessage('Thông báo', 'Cập nhật thông tin chia sẻ dữ liệu không thành công');
    }
  }
}
