import { Component, OnInit } from '@angular/core';
import { Chart, Dashboard, Frame, LayoutType, MODE, URL } from '../dashboard-constants';
import { DashboardService } from '../dashboard.service';
import { DashboardComponent } from '../dashboard.component';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, filter, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
dashboards: any = [
  //  "isEdit": false
];
dashboardId: string;
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
userId: string = null;
dashboardName: string;
dashboardEnable: boolean;
user: User;
tmpName = "";
tmpEnable = null;
dashboardComponent: DashboardComponent

// disabled = true;
private _unsubscribeAll: Subject<any> = new Subject<any>;
  constructor(       
     private _dashboardService: DashboardService,
     private _userService: UserService,
     private _messageService: MessageService,
     public dialogRef: MatDialogRef<DashboardListComponent>,
     public _route: ActivatedRoute,
     private _router: Router,

    ) { }

  ngOnInit(): void {
    this._userService.user$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((user: User) => {
      this.user = user;
    });
  
  //   this._dashboardService.dashboard$.subscribe((res:any) =>{
  //     this.dashboards = res;
  //     console.log(res);
  // })
  
  this._dashboardService.getDashboardByUserId(this.user.userId).subscribe((res:any) =>{
    this.dashboards = res.data;
    // console.log(res.data);  
})
    
  }
  ngAfterViewInit(): void {
    // this.renderDashboard();

    // Bắt sự kiện khi có thay đổi url
    // this._router.events
    //     .pipe(filter((event) => event instanceof NavigationStart))
    //     .pipe(takeUntil(this._unsubscribeAll))
    //     .subscribe((response: any) => {
    //         if (response.url === URL.VIEW) {
    //             // this.clearData();
    //             // this.renderDashboard(); //lấy dashboard và gọi dashboard đầu tiên
    //             if (
    //                 this.dashboardId == null ||
    //                 this.dashboardId.length == 0
    //             ) {
    //                 this._router.navigate(['empty'], {
    //                     relativeTo: this._route,
    //                 });
    //             }
    //         }
    //     });
}

//   initDashboard(data: any): void {
//     this.dashboardId = data.MA_DASHBOARD;
//     // this.layout = data.LAYOUT;

//     // let layouts = data.POSITION.split(';');
//     // layouts.forEach((e) => {
//     //     if (e == Frame.F1) {
//     //         this.lstFrame1Charts.push(DEFAULT_NULL_CHART);
//     //     } else if (e == Frame.F2) {
//     //         this.lstFrame2Charts.push(DEFAULT_NULL_CHART);
//     //     } else {
//     //         this.lstFrame3Charts.push(DEFAULT_NULL_CHART);
//     //     }
//     // });
// }
  onEdit(dashboard: any) {
    dashboard.isEdit = true;
    this.dashboardName = dashboard.NAME;
    // this.disabled = !this.disabled;
    this.tmpName = dashboard.NAME;
    // this.tmpName = this.dashboardName;
    this.tmpEnable = dashboard.ENABLE;
  } 
  cancel(dashboard: any) {
    dashboard.isEdit = false;
    dashboard.NAME = this.tmpName;
    dashboard.ENABLE = this.tmpEnable;
  }
  onSaveChange(dashboard: any) {
    dashboard.USER_MDF_ID = this.userId;
    // dashboard.NAME = this.dashboardName;
    // dashboard.ENABLE = this.dashboardEnable;
    // console.log(this.dashboard);
    // return;
    this._dashboardService.updateDashboard(dashboard)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((response: any) => {
      // this._messageService.showSuccessMessage("Thông báo", "Xử lý thành công");
      if (response.status == 1) {
        this._messageService.showSuccessMessage(
          'Thông báo',
          'Cập nhật dashboard thành công'
        );
        setTimeout(() => {
          this.routeToHome();
        }, 200);
      } else {
        this._messageService.showErrorMessage(
          'Thông báo',
          'Đã xảy ra lỗi khi cập nhật Dashboard'
        );
      }
    });
  
    dashboard.isEdit = false;
    
    // for (dashboard of this.dashboards) {
    //   if (dashboard.ENABLE == true) {
    //     console.log(dashboard.LST_CHARTS);
    //   }
    // }
   
  }
   closeDialog(MA_DASHBOARD: string) {
    this.dialogRef.close(MA_DASHBOARD);
    // this._dashboardService
    // .getEnableDashboardByUserId(this.user.userId)
    // .subscribe((response: any) => {
    //     // console.log('Thong bao', response);
    //     // if (response.status == 1) {
    //     //     if (response.data.length == 0) {
    //     //         this._router.navigate(['empty'], {
    //     //            relativeTo: this._route,
    //     //         });
    //     //     } else {
    //     //         // this.dashboardComponent.renderDashboard();

    //     //       //   if (this.dashboardComponent) {
    //     //       //     this.dashboardComponent.renderDashboard();
    //     //       // } else {
    //     //       //     console.log("dashboardComponent is undefined or null");
    //     //       // }
    //     //       if (!this.dashboards || this.dashboards.length == 0) {
    //     //             return;
    //     //         } else {
    //     //           this.dashboardComponent.renderDashboard();
    //     //         }
    //     //     }
    //     // } else {
    //     //     this._messageService.showErrorMessage(
    //     //         'Thong bao',
    //     //         response.message
    //     //     );
    //     // }
    //      this.dashboards = response.data;
    //      console.log(response.data);
    // });

    
     
    // console.log(MA_DASHBOARD);
  }
  toggleEnable(dashboard:any) {
    dashboard.ENABLE = !dashboard.ENABLE;
    console.log(dashboard.ENABLE);
    
    // dashboard.ENABLE = !this.dashboardEnable;
  }
  showName() {
    console.log(this.dashboardName);
  }
  onEditDashboard(MA_DASHBOARD: string): void {
    this.closeDialog(MA_DASHBOARD);
    //  this._router.navigate(['edit', MA_DASHBOARD], { relativeTo: this._route });
    // console.log('hello');
}
routeToHome(): void {
  this._router.navigate(['dashboards/dashboard']);
}
}
