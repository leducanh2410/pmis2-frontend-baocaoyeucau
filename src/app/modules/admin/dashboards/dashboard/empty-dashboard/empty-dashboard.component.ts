import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-empty-dashboard',
  templateUrl: './empty-dashboard.component.html',
  styleUrls: ['./empty-dashboard.component.scss']
})
export class EmptyDashboardComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private user: User;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _dashboardService: DashboardService,
    private _userService: UserService
  ) { }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;
      });

    this._dashboardService.getDashboardByUserId(this.user.userId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        if (response.status == 1) {
          if (response.data.length > 0) {
            this._router.navigate([''], { relativeTo: this._route });
          }
        }
      });
  }

  onCreateDashboard() {
    this._router.navigate(['../create'], { relativeTo: this._route });
  }
}
