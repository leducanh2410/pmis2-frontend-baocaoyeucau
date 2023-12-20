import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ReplaySubject, takeUntil } from 'rxjs';
import { KhaiThacDuLieuService } from '../../khaithacdulieu.service';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { MauDuLieuShare } from 'app/core/models/MauDuLieuShare';

@Component({
  selector: 'app-share-user-dialog',
  templateUrl: './share-user-dialog.component.html',
  styleUrls: ['./share-user-dialog.component.scss']
})
export class ShareUserDialogComponent implements OnInit {
  displayedColumns: string[] = ['STT', 'USERID', 'USERNAME', 'EDITABLE', 'SHAREABLE', 'ACTION'];
  userId: string;
  maDuLieu: string;
  private _unsubsribeAll: ReplaySubject<any> = new ReplaySubject(null);
  lstUserDataSource: MatTableDataSource<any> = new MatTableDataSource(null);
  @ViewChild('paginator') paginator: MatPaginator;
  filterValue: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { userId: string, maDuLieu: string },
    public dialogRef: MatDialogRef<ShareUserDialogComponent>,
    private _khaiThacDuLieuService: KhaiThacDuLieuService,
    private _messageService: MessageService
  ) { 
    this.userId = data.userId;
    this.maDuLieu = data.maDuLieu;
    this.filterValue = '';
  }

  ngOnInit(): void {
    this._khaiThacDuLieuService.getAllSharedUsers(this.maDuLieu)
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
      this._khaiThacDuLieuService.deleteSharedRecord(this.maDuLieu, row.USERID)
        .pipe(takeUntil(this._unsubsribeAll))
        .subscribe((response: any) => {
          if (response.status) {
            this._messageService.showSuccessMessage('Thông báo', `Hủy chia sẻ dữ liệu tới người dùng ${row.USERNAME} thành công`);
            this.lstUserDataSource.data = this.lstUserDataSource.data.filter(e => e.USERID != row.USERID);
            this.lstUserDataSource.filterPredicate = (data: any, filter: string) => data.USERID.indexOf(filter) != -1 || data.USERNAME.indexOf(filter) != -1;
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
        let body: MauDuLieuShare = {
          MA_DULIEU: this.maDuLieu,
          USERID: e.USERID,
          EDITABLE: e.EDITABLE,
          SHAREABLE: e.SHAREABLE,
          USER_MDF_ID: this.userId
        } 
        this._khaiThacDuLieuService.updateSharedRecord(body).subscribe();
      });
      this._messageService.showSuccessMessage('Thông báo', 'Cập nhật thông tin chia sẻ dữ liệu thành công');
    } catch (error) {
      this._messageService.showErrorMessage('Thông báo', 'Cập nhật thông tin chia sẻ dữ liệu không thành công');
    }
  }
}
