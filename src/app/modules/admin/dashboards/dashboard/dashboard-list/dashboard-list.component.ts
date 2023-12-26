import { Component, OnInit } from '@angular/core';
import { Chart, Dashboard, Frame, LayoutType, MODE, URL } from '../dashboard-constants';
import { DashboardService } from '../dashboard.service';
import { DashboardComponent } from '../dashboard.component';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
dashboards: any = [];
user: User;
private _unsubscribeAll: Subject<any> = new Subject<any>;
  constructor(       
     private _dashboardService: DashboardService,
     private _userService: UserService
    ) { }

  ngOnInit(): void {
    this._userService.user$
    .pipe(takeUntil(this._unsubscribeAll))

    this._dashboardService.dashboard$.subscribe((res:any) =>{
      // this.tabs =res; 
      this.dashboards = res;
  })
    // api serive table
  }

}
