import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { MessageService } from 'app/shared/message.services';
import { SnotifyToast } from 'ng-alt-snotify';
import { filter, Subject, takeUntil } from 'rxjs';
import { Frame, LayoutType, URL } from './dashboard-constants';
import { DashboardService } from './dashboard.service';
import { DatePipe } from '@angular/common';
import { DEFAULT_NULL_CHART } from 'app/core/constants/chart-info';
import ChartDataMapperUtil from 'app/core/utils/ChartDataMapperUtil';
import { FileSaverService } from 'app/shared/service/file-saver.service';
import { FILE_TYPE } from 'app/core/constants/file-type';
import { MatTabsModule } from '@angular/material/tabs';
import { ThemePalette } from '@angular/material/core';
// import { DashboardTabComponent } from './dashboard-tab/dashboard-tab.component';
import { FormControl } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { DashboardListComponent } from './dashboard-list/dashboard-list.component';
import { DashboardDetailComponent } from './dashboard-detail/dashboard-detail.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    providers: [DatePipe],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    user: User;

    lstFrame1Charts: any[] = [];
    lstFrame2Charts: any[] = [];
    lstFrame3Charts: any[] = [];
    // dashboard: any[] = [];
    dashboards: any = [];
    dashboardDetail: DashboardDetailComponent ;
    dashboardId: string;
    tabIndex: number ;
    layout: string;
    dashboardName: string;
    loading: boolean;
    constructor(
        private _userService: UserService,
        private _dashboardService: DashboardService,
        private _messageService: MessageService,
        public _route: ActivatedRoute,
        private _router: Router,
        private _fileSaverService: FileSaverService,
        private _matDialog: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        // public dashboardDetailComponent: DashboardDetailComponent
    ) {
        this.clearData();
        this.layout = LayoutType.LT1;
        this.tabIndex = 0;
        // this.dashboardDetail = new DashboardDetailComponent();
    }
    selectedDashboardValue(index: number): void {
        this._dashboardService.setSelectedIndex(index);
      }
    // thêm tab
    links = ['First', 'Second', 'Third'];
    activeLink = this.links[0];
    background: ThemePalette = undefined;

    addLink() {
        this.links.push(`Link ${this.links.length + 1}`);
    }
    //////////
    ngAfterViewInit(): void {
        // this.renderDashboard();

        // Bắt sự kiện khi có thay đổi url
        this._router.events
            .pipe(filter((event) => event instanceof NavigationStart))
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (response.url === URL.VIEW) {
                    // this.clearData();
                    // this.renderDashboard(); //lấy dashboard và gọi dashboard đầu tiên
                    this.getDashboard();
                    if (
                        this.dashboardId == null ||
                        this.dashboardId.length == 0
                    ) {
                        this._router.navigate(['empty'], {
                            relativeTo: this._route,
                        });
                    }
                }
            });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    showDashboard(): boolean {
        if (this._router.url === URL.VIEW) {
            return true;
        }
        return false;
    }
    getDashboard(): void {
        this._dashboardService
            .getEnableDashboardByUserId(this.user.userId)
            .subscribe((response: any) => {
                console.log('Thong bao', response);
                if (response.status == 1) {
                    if (response.data?.length == 0) {
                        this._router.navigate(['empty'], {
                            relativeTo: this._route,
                        });
                    } else {
                        this.dashboards = response.data;
                        
                            this.renderDashboard();
                         
                    }
                } else {
                    this._messageService.showErrorMessage(
                        'Thong bao',
                        response.message
                    );
                }
            });
    }
    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                this.user = user;
            });

        this._route.data.subscribe((response: any) => {
            if (response == null) {
                this._messageService.showErrorMessage(
                    'Thông báo',
                    'Không thể lấy dữ liệu dashboard của người dùng'
                );
            } else {
                let resp = response.data[0];
                if (resp.status == 1) {
                    let _data = resp.data;
                    if (
                        _data == undefined ||
                        _data == null ||
                        _data.length <= 0
                    ) {
                        this._router.navigate(['empty'], {
                            relativeTo: this._route,
                        });
                    } else {
                        this.initDashboard(_data[0]);
                    }
                } else {
                    this._messageService.showErrorMessage(
                        'Thông báo',
                        resp.message
                    );
                }
            }
        });
        // this._dashboardService
        //     .getEnableDashboardByUserId(this.user.userId)
        //     .subscribe((response: any) => {
        //         console.log('Thong bao', response);
        //         if (response.status == 1) {
        //             if (response.data.length == 0) {
        //                 this._router.navigate(['empty'], {
        //                     relativeTo: this._route,
        //                 });
        //             } else {
        //                 // this.tabs = response.data;
        //                 this.dashboards = response.data;
        //                 this.renderDashboard();
        //             }
        //         } else {
        //             this._messageService.showErrorMessage(
        //                 'Thong bao',
        //                 response.message
        //             );
        //         }
        //         // if (response == null){
        //         //   this._messageService.showErrorMessage('Thông báo',response.message);

        //         // } else {
        //         // if (response.length == 0) {
        //         //   this._router.navigate(['empty'], {relativeTo: this._route});
        //         // } else {
        //         //   this.renderDashboard();
        //         // }
        //         // }
        //     });
        //     //12/11
        // // this._dashboardService.get.subscribe((res:any) =>{
        // //     // this.tabs =res; 
        // //     this.dashboards = res;
        // // })
        this.getDashboard();
    }

    initDashboard(data: any): void {
        this.dashboardId = data.MA_DASHBOARD;
        this.layout = data.LAYOUT;

        let layouts = data.POSITION.split(';');
        layouts.forEach((e) => {
            if (e == Frame.F1) {
                this.lstFrame1Charts.push(DEFAULT_NULL_CHART);
            } else if (e == Frame.F2) {
                this.lstFrame2Charts.push(DEFAULT_NULL_CHART);
            } else {
                this.lstFrame3Charts.push(DEFAULT_NULL_CHART);
            }
        });
    }

    // Hiển thị dashboard lên màn hình
    async renderDashboard() {
        //Lấy dashboard theo userid
        // console.log(this.dashboards, this.tabIndex); 
        if (!this.dashboards || this.dashboards.length == 0) {
            return;
        } 
        if (this.tabIndex >= this.dashboards.length) {
            this.tabIndex = this.dashboards.length-1;
        } else {
           
        }

        // console.log(this.dashboards[this.tabIndex].ENABLE);
                await this._dashboardService
                .getDashboardData(this.dashboards[this.tabIndex].MA_DASHBOARD)
                .pipe(takeUntil(this._unsubscribeAll))
                .toPromise()
                .then((response: any) => {
                    if (response.status == 1) {
                        this.getChartData(response.data);
                        console.log(this.dashboards);
                        console.log(this.tabIndex);
                    } else {
                        if (response.status != 2) {
                            this._messageService.showErrorMessage(
                                'Thông báo',
                                response.message
                            );
                        }
                    } 
                });
            console.log(this.dashboardId); 
            
    }
    // async renderDashboardAdjusted() {
    //     if (!this.dashboards || this.dashboards.length == 0) {
    //         return;
    //     } 
    //     if (this.tabIndex>0) {
    //         await this._dashboardService
    //         .getDashboardData(this.dashboards[this.tabIndex-1].MA_DASHBOARD)
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .toPromise()
    //         .then((response: any) => {
    //             if (response.status == 1) {
    //                 this.getChartData(response.data);
    //                 console.log(this.dashboards);
    //                 console.log(this.tabIndex);
    //             } else {
    //                 if (response.status != 2) {
    //                     this._messageService.showErrorMessage(
    //                         'Thông báo',
    //                         response.message
    //                     );
    //                 }
    //             } 
    //         });
    //     console.log(this.dashboardId);
    //     } else {
    //         await this._dashboardService
    //         .getDashboardData(this.dashboards[this.tabIndex+1].MA_DASHBOARD)
    //         .pipe(takeUntil(this._unsubscribeAll))
    //         .toPromise()
    //         .then((response: any) => {
    //             if (response.status == 1) {
    //                 this.getChartData(response.data);
    //                 console.log(this.dashboards);
    //                 console.log(this.tabIndex);
    //             } else {
    //                 if (response.status != 2) {
    //                     this._messageService.showErrorMessage(
    //                         'Thông báo',
    //                         response.message
    //                     );
    //                 }
    //             } 
    //         });
    //     }
    // }
    // Lấy kích thước của khung thứ nhất
    getFrame1Width(): string {
        if (this.layout == LayoutType.LT1) {
            return 'w-full';
        } else if (this.layout == LayoutType.LT2) {
            return 'basis-1/2';
        } else if (
            this.layout == LayoutType.LT3 ||
            this.layout == LayoutType.LT5
        ) {
            return 'basis-1/3';
        } else if (this.layout == LayoutType.LT4) {
            return 'basis-2/3';
        }
    }

    // Lấy kích thước của khung thứ 2
    getFrame2Width(): string {
        if (this.layout == LayoutType.LT1) {
            return 'none';
        } else if (this.layout == LayoutType.LT2) {
            return 'basis-1/2';
        } else if (
            this.layout == LayoutType.LT4 ||
            this.layout == LayoutType.LT5
        ) {
            return 'basis-1/3';
        } else if (this.layout == LayoutType.LT3) {
            return 'basis-2/3';
        }
    }

    // Lấy kích thước của khung thứ 3
    getFrame3Width(): string {
        if (this.layout == LayoutType.LT5) {
            return 'basis-1/3';
        }
        return 'none';
    }

    // Lấy thông tin chi tiết của từng biểu đồ
    getChartData(data: any): void {
        this.dashboardId = data.dashboardId;
        this.layout = data.layout;
        let allChartOptions = data.dashboardChartOptionsResponses;

        this.lstFrame1Charts = ChartDataMapperUtil.getAllChartDataMapper(
            allChartOptions,
            Frame.F1
        );
        this.lstFrame2Charts = ChartDataMapperUtil.getAllChartDataMapper(
            allChartOptions,
            Frame.F2
        );
        this.lstFrame3Charts = ChartDataMapperUtil.getAllChartDataMapper(
            allChartOptions,
            Frame.F3
        );
    }

    clearData(): void {
        this.dashboardId = '';
        this.lstFrame1Charts = [];
        this.lstFrame2Charts = [];
        this.lstFrame3Charts = [];
    }
   
    onEditDashboard(dashboardId: string): void {
        this._dashboardService.setSectionVisible(true);

        // let currentTab = this.tabs[tabIndex];
        this._router.navigate(['edit', dashboardId], { relativeTo: this._route });
        // this.dashboardDetail.sectionVisible = true;

    }
   
   
    selectedTabValue(index: number) {
        // console.log('assa',$event);
        this._dashboardService.setSelectedIndex(index);

        //thay đổi db id + gọi hàm render
        // this.dashboardId = this.tabs[this.tan]
        this.renderDashboard();
     }
    
    // onTabChange(index: number): void {
    //     this.tabs.forEach(tab => tab.index = index);
    // }
    onAddDashboard(): void {
        this._dashboardService.setSectionVisible(false);

        // this._dashboardService.changeVisibility();
        this._router.navigate(['create'], {relativeTo: this._route});

        // this.dashboardDetail.sectionVisible = false;
        // if (this.dashboardDetail) {
        //     this.dashboardDetail.sectionVisible = false;
        //   }
        
    }

    // addTab(selectAfterAdding: boolean) {
    //   this.tabs.push('New');

    //   if (selectAfterAdding) {
    //     this.selected.setValue(this.tabs.length - 1);
    //   }
    // }
    popUpListDashboard(): void {
       const dialogList = this._matDialog.open(DashboardListComponent, {
            width: '994px',
            height: '502px'
        });

        dialogList.afterClosed().subscribe((response: string) => {
            // console.log(response);
            if (response != undefined && response != null) {
                this._router.navigate(['edit', response], { relativeTo: this._route });
            } else {
                this.getDashboard();
            }
          })
    }
    onDeleteDashboard() {
        this._messageService.showConfirm(
            'Thông báo',
            'Bạn chắc chắn muốn xóa dashboard?',
            (toast: SnotifyToast) => {
                this._messageService.notify().remove(toast.id);
                this._dashboardService
                    .deleteDashboard(this.dashboardId, this.user.userId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: any) => {
                        switch (response.status) {
                            case 1:
                                this._messageService.showSuccessMessage(
                                    'Thông báo',
                                    'Xóa dashboard thành công'
                                );
                                this.clearData();
                                // this._router.navigate(['empty'], {
                                //     relativeTo: this._route,
                                // });
                                this.getDashboard();
                                break;
                            case 0:
                                this._messageService.showErrorMessage(
                                    'Thông báo',
                                    'Đã xảy ra lỗi khi xóa dashboard'
                                );
                                break;
                            case -1:
                                this._messageService.showErrorMessage(
                                    'Thông báo',
                                    'Không tìm thấy dashboard cần xóa'
                                );
                                break;
                        }
                    });
            }
        );
    }

    downloadCanvas(item: any, canvasId: string): void {
        let dataUrl = (<HTMLCanvasElement>(
            document.getElementById(canvasId)
        )).toDataURL();
        dataUrl = dataUrl.replace('data:image/png;base64,', '');
        let fileName = item.chartOptions.plugins.title.text;
        if (fileName == undefined || fileName == null) {
            fileName = 'download.png';
        } else {
            fileName += '.png';
        }
        this._fileSaverService.downloadFile(dataUrl, fileName, FILE_TYPE.IMAGE);
    }

    downloadExcel(frame: string, position: number): void {
        this._dashboardService
            .getExcelDataByChartFromDashboard(this.dashboardId, frame, position)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (response.status == 1) {
                    const byteStr = response.dataExcel;
                    this._fileSaverService.downloadFile(
                        byteStr,
                        response.fileName,
                        FILE_TYPE.EXCEL
                    );
                } else {
                    this._messageService.showErrorMessage(
                        'Thông báo',
                        response.message
                    );
                }
            });
    }
    hideDashboard(dashboard: any): void {
        this._messageService.showConfirm(
            'Thông báo',
            `Bạn chắc chắn muốn ẩn dashboard ${dashboard.NAME}`,
            (toast: SnotifyToast) => {
                this._messageService.notify().remove(toast.id);
                dashboard.ENABLE = !dashboard.ENABLE;
                this._dashboardService.updateDashboard(dashboard)
                    // .deleteDashboard(this.dashboardId, this.user.userId)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((response: any) => {
                        console.log(response);
                        
                        switch (response.status) {
                            
                            case 1:
                                this._messageService.showSuccessMessage(
                                    'Thông báo',
                                    'Đã ẩn dashboard'
                                );
                                // this._router.navigate(['empty'], {
                                //     relativeTo: this._route,
                                // });
                                console.log(dashboard.ENABLE);
                                
                                this.getDashboard();
                                break;
                            case 0:
                                this._messageService.showErrorMessage(
                                    'Thông báo',
                                    'Đã xảy ra lỗi khi ẩn dashboard'
                                );
                                break;
                            case -1:
                                this._messageService.showErrorMessage(
                                    'Thông báo',
                                    'Không tìm thấy dashboard cần ẩn'
                                );
                                break;
                        }
                    });
            }
        );
    }
}
