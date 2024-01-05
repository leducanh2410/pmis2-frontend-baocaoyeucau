import { Component, OnInit } from '@angular/core';
import { Chart, Dashboard, Frame, LayoutType, MODE, URL } from '../dashboard-constants';
import { DashboardService } from '../dashboard.service';
import { DashboardComponent } from '../dashboard.component';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
dashboards: any = [
  //  "isEdit": false
];
dashboard: Dashboard = {
  MA_DASHBOARD: '',
  LAYOUT: '',
  USER_ID: '',
  LST_CHARTS: '',
  POSITION: '',
  USER_CR_ID: '',
  USER_CR_DTIME: null,
  USER_MDF_ID: '',
  USER_MDF_DTIME: null,
  NAME: '',
  ENABLE: null,
  ORD:null,
   isEdit: false
};
user: User;
tmpName = "";
tmpEnable = null;
// disabled = true;
private _unsubscribeAll: Subject<any> = new Subject<any>;
  constructor(       
     private _dashboardService: DashboardService,
     private _userService: UserService,
     private _messageService: MessageService
    ) { }

  ngOnInit(): void {
    this._userService.user$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((user: User) => {
      this.user = user;
    });

    this._dashboardService.dashboard$.subscribe((res:any) =>{
      this.dashboards = res;
  })
    // api serive table
  }
  onEdit(dashboard: any) {
    dashboard.isEdit = true;
    // this.disabled = !this.disabled;
    this.tmpName = dashboard.NAME;
  } 
  cancel(dashboard: any) {
    dashboard.isEdit = false;
    dashboard.NAME = this.tmpName;
  }
  onSaveChange(dashboard: any) {
    this._dashboardService.updateDashboard(this.dashboard)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response: any) => {
      this._messageService.showSuccessMessage("Thông báo", "Xử lý thành công");
      
    });
    dashboard.isEdit = false;
  }
}
