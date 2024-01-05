import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Chart, Dashboard, Frame, LayoutType, MODE, URL } from '../dashboard-constants';
import { DashboardService } from '../dashboard.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { MessageService } from 'app/shared/message.services';
import { UserService } from 'app/core/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { LayoutDialogComponent } from './layout-dialog/layout-dialog.component';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SnotifyToast } from 'ng-alt-snotify';
import { ActivatedRoute, Router } from '@angular/router';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-dashboard-detail',
  templateUrl: './dashboard-detail.component.html',
  styleUrls: ['./dashboard-detail.component.scss']
})
export class DashboardDetailComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  mode: number = MODE.EDIT;

  charts: Chart[] = [];
  dataSource: Chart[] = [];
  userId: string = null;
  searching: boolean = false;
  searchingValue: string = '';
  selectedLayout: string = '';
  lstChartsF1: Chart[] = [];
  lstChartsF2: Chart[] = [];
  lstChartsF3: Chart[] = [];
  @Input() dashboardName: string;

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
  selectedIndex: number;

  constructor(
    private _dashboardService: DashboardService,
    private _messageService: MessageService,
    private _userService: UserService,
    private _dialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute
  ) { }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  async ngOnInit() {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((response: any) => {
        this.userId = response.userId;
      });

    await firstValueFrom(this._dashboardService.getChartsByUserId(this.userId))
      .then(
        (response: any) => {
          if (response.status == 1) {
            response.data.forEach(e => {
              let tmp: Chart = {
                icon: '',
                name: '',
                chartId: ''
              }
              tmp.chartId = e.MA_BIEUDO;
              tmp.icon = e.LOAI_BIEUDO_ICON;
              tmp.name = e.MO_TA;
              this.charts.push(tmp);
              this.dataSource.push(tmp);
            });
          } else {
            this._messageService.showErrorMessage("Thông báo", response.message);
          }
        }
      )
    
    if (this._router.url === URL.CREATE) {
      this.mode = MODE.CREATE;
    } else if (this._router.url === URL.EDIT) {
      this.mode = MODE.EDIT;
    }

    let getDashboardByUserId = await firstValueFrom(this._dashboardService.getDashboardByUserId(this.userId));
    if (getDashboardByUserId.status == 1) {
      if (this.mode === MODE.CREATE) {
        // if (getDashboardByUserId.data.length > 0) {
        //   setTimeout(() => {
        //     this.routeToHome();
        //   }, 200);
        // }
      } else if (this.mode === MODE.EDIT) {
        if (getDashboardByUserId.data.length <= 0) {
          setTimeout(() => {
            this.routeToHome();
          }, 200);
        } else {
          this.loadData(getDashboardByUserId.data[0]);
        }
      }
    } else {
      this._messageService.showErrorMessage("Thông báo", getDashboardByUserId.message);
    }
  }

  // Thực hiện khởi tạo dữ liệu cho dashboard trong trường hợp cập nhật
  loadData(data: any): void {
    this.dashboard = data;
    let lstDashboardCharts = this.dashboard.LST_CHARTS.split(';');
    let lstDashboardChartsPosition = this.dashboard.POSITION.split(';');
    for (let index = 0; index < lstDashboardChartsPosition.length; index++) {
      const element = lstDashboardChartsPosition[index];
      let tmp = this.charts.filter(e => e.chartId === lstDashboardCharts[index])[0];
      if (element === Frame.F1) {
        this.lstChartsF1.push(tmp);
      } else if (element === Frame.F2) {
        this.lstChartsF2.push(tmp);
      } else if (element === Frame.F3) {
        this.lstChartsF3.push(tmp);
      }
    }

    lstDashboardCharts.forEach(e => {
      this.charts = this.charts.filter(ee => ee.chartId != e);
    });
    this.dataSource = this.charts;
    this.selectedLayout = this.dashboard.LAYOUT;
  }

  onSearching() {
    this.charts = this.dataSource.filter(e => e.name.toUpperCase().includes(this.searchingValue.toUpperCase()));
  }

  onCancelSearch() {
    this.searching = false;
    this.searchingValue = '';
    this.charts = this.dataSource;
  }

  onShowDialog() {
    const dialogRef = this._dialog.open(LayoutDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        layoutType: this.selectedLayout
      }
    });

    dialogRef.afterClosed().subscribe((response: string) => {
      if (response != undefined && response != null && response.length > 0) {
        this.selectedLayout = response;
        // Nếu chọn layout 1 sẽ hủy hết dữ liệu đã chọn (nếu có) ở layout 2,3,4,5
        if (response == LayoutType.LT1) {
          this.lstChartsF2.forEach(e => {
            this.charts.push(e);
          });
          this.lstChartsF3.forEach(e => {
            this.charts.push(e);
          });
          this.lstChartsF2 = [];
          this.lstChartsF3 = [];
        } else if (response == LayoutType.LT2 || response == LayoutType.LT3 || response == LayoutType.LT4) {
          // Nếu chọn layout 2,3,4 sẽ hủy hết dữ liệu đã chọn ở layout 5
          this.lstChartsF3.forEach(e => {
            this.charts.push(e);
          });
          this.lstChartsF3 = [];
        }
      }
    })
  }

  selectedLayoutFunc(): boolean {
    if (this.selectedLayout == LayoutType.LT1
      || this.selectedLayout == LayoutType.LT2
      || this.selectedLayout == LayoutType.LT3
      || this.selectedLayout == LayoutType.LT4
      || this.selectedLayout == LayoutType.LT5) {
      return true;
    }
    return false;
  }

  showFrame2(): boolean {
    if (this.selectedLayout == LayoutType.LT2
      || this.selectedLayout == LayoutType.LT3
      || this.selectedLayout == LayoutType.LT4
      || this.selectedLayout == LayoutType.LT5) {
      return true;
    }
    return false;
  }

  showFrame3(): boolean {
    if (this.selectedLayout == LayoutType.LT5) {
      return true;
    }
    return false;
  }

  cancelChart(item: Chart, frame: string): void {
    if (frame == Frame.F1) {
      this.lstChartsF1 = this.lstChartsF1.filter(e => e.chartId != item.chartId);
    } else if (frame == Frame.F2) {
      this.lstChartsF2 = this.lstChartsF2.filter(e => e.chartId != item.chartId);
    } else {
      this.lstChartsF3 = this.lstChartsF3.filter(e => e.chartId != item.chartId);
    }
    this.charts.push(item);
  }

  getFrame1Width(): string {
    if (this.selectedLayout == LayoutType.LT1) {
      return 'w-full';
    } else if (this.selectedLayout == LayoutType.LT2) {
      return 'basis-1/2';
    } else if (this.selectedLayout == LayoutType.LT3) {
      return 'basis-1/3';
    } else if (this.selectedLayout == LayoutType.LT4) {
      return 'basis-2/3';
    } else if (this.selectedLayout == LayoutType.LT5) {
      return 'basis-1/3';
    }
  }

  getFrame2Width(): string {
    if (this.selectedLayout == LayoutType.LT2) {
      return 'basis-1/2';
    } else if (this.selectedLayout == LayoutType.LT3) {
      return 'basis-2/3';
    } else if (this.selectedLayout == LayoutType.LT4) {
      return 'basis-1/3';
    } else if (this.selectedLayout == LayoutType.LT5) {
      return 'basis-1/3';
    }
  }

  drop(event: CdkDragDrop<Chart[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    if (this.mode === MODE.CREATE) {
      this.dataSource = this.charts;
    }
  }

  onSaveDashboard(): void {
    this.dashboard.LAYOUT = this.selectedLayout;
    this.dashboard.USER_ID = this.userId;
   
    if (this.dashboard.LAYOUT == undefined 
      || this.dashboard.LAYOUT == null 
      || (this.dashboard.LAYOUT != LayoutType.LT1 
        && this.dashboard.LAYOUT != LayoutType.LT2
        && this.dashboard.LAYOUT != LayoutType.LT3
        && this.dashboard.LAYOUT != LayoutType.LT4
        && this.dashboard.LAYOUT != LayoutType.LT5)) {
      this._messageService.showErrorMessage("Thông báo", "Chưa chọn layout");
      return;
    }

    if (this.lstChartsF1.length <= 0 && this.lstChartsF2.length <= 0 && this.lstChartsF3.length <= 0) {
      this._messageService.showErrorMessage("Thông báo", "Dashboard không chứa biểu đồ nào");
      return;
    }

    let lstCharts = [];
    let positions = [];

    this.lstChartsF1.forEach(e => {
      lstCharts.push(e.chartId);
      positions.push(Frame.F1);
    });

    this.lstChartsF2.forEach(e => {
      lstCharts.push(e.chartId);
      positions.push(Frame.F2);
    });

    this.lstChartsF3.forEach(e => {
      lstCharts.push(e.chartId);
      positions.push(Frame.F3);
    });

    this.dashboard.LST_CHARTS = lstCharts.join(";");
    this.dashboard.POSITION = positions.join(";");

    if (this.mode == MODE.CREATE) {
      this.dashboard.USER_CR_ID = this.userId;
      // this.dashboard.NAME = this.dashboardName;

      this._dashboardService.createDashboard(this.dashboard)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          if (response.status == 1) {
            this._messageService.showSuccessMessage("Thông báo", "Tạo dashboard thành công");
            setTimeout(() => {
              this.routeToHome();
            }, 200);
          } else {
            this._messageService.showErrorMessage("Thông báo", "Đã xảy ra lỗi khi tạo dashboard");
          }
        });
    } else if (this.mode == MODE.EDIT) {
      this.dashboard.USER_MDF_ID = this.userId;

      this._dashboardService.updateDashboard(this.dashboard)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response: any) => {
          if (response.status == 1) {
            this._messageService.showSuccessMessage("Thông báo", "Cập nhật dashboard thành công");
            setTimeout(() => {
              this.routeToHome();
            }, 200);
          } else {
            this._messageService.showErrorMessage("Thông báo", "Đã xảy ra lỗi khi cập nhật Dashboard");
          }
        })
    }
  }

  onDeleteDashboard() {
    this.dashboard.USER_MDF_ID = this.userId;
    this._messageService.showConfirm("Thông báo", "Bạn chắc chắn muốn xóa dashboard?",
      (toast: SnotifyToast) => {
        this._messageService.notify().remove(toast.id);
        this._dashboardService.deleteDashboard(this.dashboard.MA_DASHBOARD, this.dashboard.USER_MDF_ID)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((response: any) => {
            switch (response.status) {
              case 1:
                this._messageService.showSuccessMessage("Thông báo", "Xóa dashboard thành công");
                this._router.navigate(['../empty'], { relativeTo: this._route });
                break;
              case 0:
                this._messageService.showErrorMessage("Thông báo", "Đã xảy ra lỗi khi xóa dashboard");
                break;
              case -1:
                this._messageService.showErrorMessage("Thông báo", "Không tìm thấy dashboard cần xóa");
                break;
            }
          })
      }
    );
  }

  routeToHome(): void {
    this._router.navigate(['dashboards/dashboard']);
  }
}
