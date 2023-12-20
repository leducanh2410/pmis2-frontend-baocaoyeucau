
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { CHART_TYPE, colors, DEFAULT_BAR_CHART, DEFAULT_NULL_CHART, KIEU_DULIEU, MAX_INT_32BIT } from 'app/core/constants/chart-info';
import { FunctionService } from 'app/core/function/function.service';
import { UserService } from 'app/core/user/user.service';
import { BaseComponent } from 'app/shared/commons/base.component';
import { BaseDetailInterface } from 'app/shared/commons/BaseDetail';
import { State } from 'app/shared/commons/conmon.types';
import { MessageService } from 'app/shared/message.services';
import { Observable, Subject, Subscription, firstValueFrom, takeUntil } from 'rxjs';
import { VeBieuDoService } from '../../vebieudo.service';
import { DatePipe } from '@angular/common';
import ChartDataMapperUtil from 'app/core/utils/ChartDataMapperUtil';
import { saveAs } from 'file-saver';
import { FileSaverService } from 'app/shared/service/file-saver.service';
import { FILE_TYPE } from 'app/core/constants/file-type';
import { MAX_CHART_DATA_POINT } from 'app/core/constants/constant';

@Component({
    selector: 'component-details_bieudo',
    templateUrl: './detailsbieudo.component.html',
    styleUrls: ['./detailsbieudo.component.css'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        DatePipe,
        FileSaverService
    ]
})
export class VeBieuDoDetailsBieuDoComponent extends BaseComponent implements OnInit, OnDestroy, BaseDetailInterface {
    // đầu vào dữ liệu đồ thị
    @Input() events: Observable<any>;
    private eventsSubscription: Subscription;
    eventsSubject: Subject<any> = new Subject<any>();

    displayedColumnsInput: string[] = ['STT', 'MO_TA', 'LABEL', 'DATA', 'COLOR'];
    @ViewChild(MatSort, { static: false }) sort: MatSort;
    chartInfoMapper: any;
    rows: any;

    constructor(
        private _vebieudoService: VeBieuDoService,
        private _formBuilder: UntypedFormBuilder,
        public _activatedRoute: ActivatedRoute,
        public _router: Router,
        public _functionService: FunctionService,
        public _userService: UserService,
        public _messageService: MessageService,
        private _datePipe: DatePipe,
        private _fileSaverService: FileSaverService
    ) {
        super(_activatedRoute, _router, _functionService, _userService, _messageService);
    }

    object: any;
    public StateEnum = State;
    dialogForm: UntypedFormGroup;
    group: any;
    barChartCoord = [
        {
            key: 'x',
            value: 'Trục X',
        },
        {
            key: 'y1',
            value: 'Trục Y bên trái'
        },
        {
            key: 'y2',
            value: 'Trục Y bên phải'
        }
    ];
    columnData: any;
    tableData: any;
    lstChartByGroupId: any;

    // pie chart
    menuItems: any[] = [
        {
            key: 'selectedLabel',
            value: 'Nhãn'
        },
        {
            key: 'selectedData',
            value: 'Dữ liệu'
        }
    ];
    columnsPie: any[] = ['', ''];
    // end pie chart variable

    // bar chart variable
    columnsX: string = '';
    listColumnsY: string[] = [];
    lstChieu: any[] = [
        {
            key: 'ngang',
            value: 'Ngang'
        },
        {
            key: 'doc',
            value: 'Dọc'
        }
    ];
    // end bar chart variable

    // line chart variable
    x_coord: string = '';
    lines: string[] = [];
    // end line chart variable

    // color picker box
    colorPicked: string = '#ffffff';
    toggle: boolean = false;
    lstCotColors: any[] = [];
    lstLineColors: any[] = [];
    selectedRow: string = '';

    chartInfo: any;

    onEditObject(): void {
        throw new Error('Method not implemented.');
    }
    onSaveObject(): void {
        throw new Error('Method not implemented.');
    }
    onDeleteObject(): void {
        throw new Error('Method not implemented.');
    }
    onCreateObject(): void {
        throw new Error('Method not implemented.');
    }
    onCancelObject(): void {

    }
    get actionCancel(): Boolean {
        throw new Error('Method not implemented.');
    }

    get viewMode(): Boolean {
        throw new Error('Method not implemented.');
    }
    get inputMode(): Boolean {
        // throw new Error('Method not implemented.');
        return this.object?.SYS_ACTION == State.create || this.object?.SYS_ACTION == State.edit;
    }
    get createMode(): Boolean {
        return this.object?.SYS_ACTION == State.create;
    }
    get actionCreate(): Boolean {
        return this.authInsert;
    }
    get actionDelete(): Boolean {
        throw new Error('Method not implemented.');
    }
    get actionEdit(): Boolean {
        throw new Error('Method not implemented.');
    }
    get actionEditDetail(): Boolean {
        throw new Error('Method not implemented.');
    }
    get actionDeleteDetail(): Boolean {
        throw new Error('Method not implemented.');
    }
    get actionSave(): Boolean {
        throw new Error('Method not implemented.');
    }

    ngOnInit(): void {
        super.ngOnInit();
        this.chartInfo = {
            series: [],
            chart: {
                type: 'bar'
            }
        };
        // sẽ chạy vào trong lần khởi chạy đầu tiên
        this._vebieudoService.group$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                this.group = response;
                // this.getTableInfoAndRenderChart(null);
            });

        this._vebieudoService.rows$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                this.rows = response;
            });

        this._vebieudoService.duLieuDaKhaiThac$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (response != null) {
                    this.tableData = response;
                }
            });

        // sẽ chạy vào mỗi khi Object co thay doi
        this._vebieudoService.Object$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((sobject: any) => {
                this.object = sobject;
                // Kiểm tra loại biểu đồ lúc mới vào
                if (this.object?.MA_LOAI_BIEUDO == CHART_TYPE.BAR || this.object?.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
                    this.displayedColumnsInput = ['STT', 'MO_TA', 'LABEL', 'DATA', 'COLOR'];
                } else {
                    this.displayedColumnsInput = ['STT', 'MO_TA', 'LABEL', 'DATA'];
                }
                if (this.inputMode) {
                    this.dialogForm = this._formBuilder.group({
                        MA_LOAI_BIEUDO: [sobject?.MA_LOAI_BIEUDO, [Validators.required]],
                        MO_TA: [sobject?.MO_TA, [Validators.required, Validators.maxLength(250)]],
                        TRUC: [sobject?.TRUC,],
                        TEN_COT: [sobject?.TEN_COT,],
                        STT_COT: [sobject?.STT_COT,],
                        MAU_SAC: [sobject?.MAU_SAC,],
                        HIEN: [sobject?.HIEN,],
                        DON_VI: [sobject?.DON_VI,],
                        CHIEU: [sobject?.CHIEU,]
                    });

                    this.dialogForm.get("MA_LOAI_BIEUDO").valueChanges.subscribe(value => {
                        sobject.MA_LOAI_BIEUDO = value;
                    })

                    this.dialogForm.get("MO_TA").valueChanges.subscribe(value => {
                        sobject.MO_TA = value;
                    })

                    this.dialogForm.get("CHIEU").valueChanges.subscribe(value => {
                        sobject.CHIEU = value;
                    })

                    this.dialogForm.get("DON_VI").valueChanges.subscribe(value => {
                        sobject.DON_VI = value;
                    })

                    this.dialogForm.get("HIEN").valueChanges.subscribe(value => {
                        sobject.HIEN = value;
                    })

                    this.dialogForm.get("MAU_SAC").valueChanges.subscribe(value => {
                        sobject.MAU_SAC = value;
                    })

                    this.dialogForm.get("STT_COT").valueChanges.subscribe(value => {
                        sobject.STT_COT = value;
                    })

                    this.dialogForm.get("TEN_COT").valueChanges.subscribe(value => {
                        sobject.TEN_COT = value;
                    })

                    this.dialogForm.get("TRUC").valueChanges.subscribe(value => {
                        sobject.MO_TA = value;
                    })
                }
                this.renderChart(sobject, this.tableData);
            });

        // Bắt sự kiện thay đổi loại biểu đồ (sửa / tạo mới)
        this.eventsSubscription = this.events.subscribe((value: any) => {
            if (this.inputMode) {
                if (value == CHART_TYPE.BAR) {
                    this.displayedColumnsInput = ['STT', 'MO_TA', 'LABEL', 'DATA', 'COLOR'];
                    this.updateAndPreviewBarChart();
                } else if (value == CHART_TYPE.LINE) {
                    this.displayedColumnsInput = ['STT', 'MO_TA', 'LABEL', 'DATA', 'COLOR'];
                    this.updateAndPreviewLineChart();
                } else if (value == CHART_TYPE.PIE) {
                    this.displayedColumnsInput = ['STT', 'MO_TA', 'LABEL', 'DATA'];
                    this.updateAndPreviewPieChart();
                }
            }
        });

        this.object.VALID_CHART_DATA = true;
    }

    // Trường nào được chọn làm dữ liệu sẽ chỉ có thể là kiểu số
    validKieuDuLieu(element: any) {
        if (element.MA_KIEU_DLIEU == KIEU_DULIEU.SO) {
            return true;
        }
        return false;
    }

    // Kiểm tra có phải kiểu dữ liệu chữ hay không
    isStringDataType(element: any): boolean {
        return element.MA_KIEU_DLIEU == KIEU_DULIEU.CHUOI;
    }

    // Kiểm tra đã tồn tại trường đó trong danh sách các trường dữ liệu hay chưa
    _data_include(element: any) {
        if (this.listColumnsY.includes(element.TEN_COT) && this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
            return true;
        }
        if (this.lines.includes(element.TEN_COT) && this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            return true;
        }
        return false;
    }

    // Kiểm tra xem trường đó có trong danh sách trường tính tổng hay chưa
    // _sum_col_include(element: any): boolean {
    //     if (this.lstSumCols == undefined || this.lstSumCols == null) {
    //         return false;
    //     }
    //     if (this.lstSumCols.includes(element.TEN_COT) && (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR || this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE)) {
    //         return true;
    //     }
    //     return false;
    // }

    // Khi chọn các check box
    // changeSelect($event, element: any, type: string) {
    //     if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.PIE) {
    //         if (type == 'label') {
    //             if (this.columnsPie[1] == element.TEN_COT) {
    //                 $event.preventDefault();
    //                 return;
    //             }
    //             this.columnsPie[0] = element.TEN_COT;
    //         } else {
    //             if (this.columnsPie[0] == element.TEN_COT) {
    //                 $event.preventDefault();
    //                 return;
    //             }
    //             this.columnsPie[1] = element.TEN_COT;
    //         }
    //         this.updatePieChartDetail();
    //         if (this.columnsPie[0].length > 0 && this.columnsPie[1].length > 0) {
    //             this.previewPieChart(this.tableData);
    //         } else {
    //             // this.eventsSubject.next(DEFAULT_NULL_CHART);
    //             this.chartInfo = DEFAULT_NULL_CHART;
    //         }
    //     } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
    //         if (type == 'label') {
    //             if (this.listColumnsY.includes(element.TEN_COT) || this.selectedColumnToSplit == element.TEN_COT) {
    //                 $event.preventDefault();
    //                 return;
    //             }
    //             if (this.columnsX == element.TEN_COT) {
    //                 this.columnsX = '';
    //             } else {
    //                 this.columnsX = element.TEN_COT;
    //             }
    //         } else if (type == 'split') {
    //             if (this.columnsX == element.TEN_COT || this.listColumnsY.includes(element.TEN_COT)) {
    //                 $event.preventDefault();
    //                 return;
    //             }
    //             if (this.selectedColumnToSplit == element.TEN_COT) {
    //                 this.selectedColumnToSplit = '';
    //             } else {
    //                 this.selectedColumnToSplit = element.TEN_COT;
    //             }
    //         } else {
    //             if (this.columnsX == element.TEN_COT) {
    //                 $event.preventDefault();
    //                 return;
    //             }
    //             if (this.listColumnsY.includes(element.TEN_COT)) {
    //                 const index = this.listColumnsY.indexOf(element.TEN_COT);
    //                 if (index > -1) {
    //                     this.listColumnsY.splice(index, 1);
    //                     this.lstCotColors.splice(index, 1);
    //                 }
    //                 // resend and rerender
    //                 this.updateBarChartDetail();
    //                 if (this.listColumnsY.length > 0) {
    //                     this.previewBarChart(this.tableData);
    //                 } else {
    //                     // this.eventsSubject.next(DEFAULT_NULL_CHART);
    //                     this.chartInfo = DEFAULT_NULL_CHART;
    //                 }
    //                 return;
    //             }
    //             this.listColumnsY.push(element.TEN_COT);
    //             this.lstCotColors.push({ key: element.TEN_COT, value: colors[this.randomNumber(0, colors.length)] });
    //         }
    //         this.updateBarChartDetail();
    //         if (this.listColumnsY.length > 0) {
    //             this.previewBarChart(this.tableData);
    //         } else {
    //             // this.eventsSubject.next(DEFAULT_NULL_CHART);
    //             this.chartInfo = DEFAULT_NULL_CHART;
    //         }
    //     } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
    //         if (type == 'label') {
    //             if (this.lines.includes(element.TEN_COT)) {
    //                 $event.preventDefault();
    //                 return;
    //             }
    //             this.x_coord = element.TEN_COT;
    //         } else {
    //             if (this.x_coord == element.TEN_COT) {
    //                 $event.preventDefault();
    //                 return;
    //             }
    //             if (this.lines.includes(element.TEN_COT)) {
    //                 const index = this.lines.indexOf(element.TEN_COT);
    //                 if (index > -1) {
    //                     this.lines.splice(index, 1);
    //                     this.lstLineColors.splice(index, 1);
    //                 }
    //                 // resend and rerender
    //                 this.updateLineChartDetail();
    //                 if (this.x_coord.length > 0 && this.lines.length > 0) {
    //                     this.previewLineChart(this.tableData);
    //                 } else {
    //                     // this.eventsSubject.next(DEFAULT_NULL_CHART);
    //                     this.chartInfo = DEFAULT_NULL_CHART;
    //                 }
    //                 return;
    //             }
    //             this.lines.push(element.TEN_COT);
    //             this.lstLineColors.push({ key: element.TEN_COT, value: colors[this.randomNumber(0, colors.length)] });
    //         }
    //         this.updateLineChartDetail();
    //         if (this.x_coord.length > 0 && this.lines.length > 0) {
    //             this.previewLineChart(this.tableData);
    //         } else {
    //             // this.eventsSubject.next(DEFAULT_NULL_CHART);
    //             this.chartInfo = DEFAULT_NULL_CHART;
    //         }
    //     }
    // }

    // Thay đổi lựa chọn nhãn
    changeLabelSelect($event, element: any): void {
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.PIE) {
            if (this.columnsPie[1] == element.TEN_COT) {
                $event.preventDefault();
                return;
            }
            this.columnsPie[0] = element.TEN_COT;
            this.updateAndPreviewPieChart();
        } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
            if (this.listColumnsY.includes(element.TEN_COT)) {
                $event.preventDefault();
                return;
            }
            if (this.columnsX == element.TEN_COT) {
                this.columnsX = '';
            } else {
                this.columnsX = element.TEN_COT;
            }
            this.updateAndPreviewBarChart();
        } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            if (this.lines.includes(element.TEN_COT)) {
                $event.preventDefault();
                return;
            }
            this.x_coord = element.TEN_COT;
            this.updateAndPreviewLineChart();
        }
    }

    // Thay đổi lựa chọn check box dữ liệu
    changeDataSelect($event, element: any): void {
        if (!this.validKieuDuLieu(element)) {
            $event.preventDefault();
            return;
        }
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.PIE) {
            if (this.columnsPie[0] == element.TEN_COT) {
                $event.preventDefault();
                return;
            }
            this.columnsPie[1] = element.TEN_COT;
            this.updateAndPreviewPieChart();
        } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
            if (this.columnsX == element.TEN_COT) {
                $event.preventDefault();
                return;
            }
            if (this.listColumnsY.includes(element.TEN_COT)) {
                const index = this.listColumnsY.indexOf(element.TEN_COT);
                if (index > -1) {
                    this.listColumnsY.splice(index, 1);
                    this.lstCotColors.splice(index, 1);
                }
            } else {
                this.listColumnsY.push(element.TEN_COT);
                this.lstCotColors.push({ key: element.TEN_COT, value: colors[this.randomNumber(0, colors.length)] });
            }
            this.updateAndPreviewBarChart();
        } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            if (this.x_coord == element.TEN_COT) {
                $event.preventDefault();
                return;
            }
            if (this.lines.includes(element.TEN_COT)) {
                const index = this.lines.indexOf(element.TEN_COT);
                if (index > -1) {
                    this.lines.splice(index, 1);
                    this.lstLineColors.splice(index, 1);
                }
            } else {
                this.lines.push(element.TEN_COT);
                this.lstLineColors.push({ key: element.TEN_COT, value: colors[this.randomNumber(0, colors.length)] });
            }
            this.updateAndPreviewLineChart();
        }
    }

    // Khi chọn các check box tách đường
    // changeSplitSelect($event, element: any) {
    //     if (!this.isStringDataType(element)) {
    //         $event.preventDefault();
    //         return;
    //     }
    //     if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
    //         if (this.columnsX == element.TEN_COT || this.listColumnsY.includes(element.TEN_COT)) {
    //             $event.preventDefault();
    //             return;
    //         }
    //         if (this.selectedColumnToSplit == element.TEN_COT) {
    //             this.selectedColumnToSplit = '';
    //         } else {
    //             this.selectedColumnToSplit = element.TEN_COT;
    //         }
    //         this.updateAndPreviewBarChart();
    //     } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
    //         if (this.x_coord == element.TEN_COT || this.lines.includes(element.TEN_COT)) {
    //             $event.preventDefault();
    //             return;
    //         }
    //         if (this.selectedColumnToSplit == element.TEN_COT) {
    //             this.selectedColumnToSplit = '';
    //         } else {
    //             this.selectedColumnToSplit = element.TEN_COT;
    //         }
    //         this.updateAndPreviewLineChart();
    //     }
    // }

    // changeSumColSelect($event, element: any) {
    //     if (!this.validKieuDuLieu(element)) {
    //         $event.preventDefault();
    //         return;
    //     }
    //     if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
    //         if (this.columnsX == element.TEN_COT) {
    //             $event.preventDefault();
    //             return;
    //         }
    //     } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
    //         if (this.x_coord == element.TEN_COT) {
    //             $event.preventDefault();
    //             return;
    //         }
    //     }
    //     if (this.lstSumCols.includes(element.TEN_COT)) {
    //         const index = this.lstSumCols.indexOf(element.TEN_COT);
    //         if (index > -1) {
    //             this.lstSumCols.splice(index, 1);
    //             this.lstLineColors.splice(index, 1);
    //         }
    //     } else {
    //         this.lstSumCols.push(element.TEN_COT);
    //         this.lstLineColors.push({ key: element.TEN_COT, value: colors[this.randomNumber(0, colors.length)] });
    //     }
    //     if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
    //         this.updateAndPreviewBarChart();
    //     } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
    //         this.updateAndPreviewLineChart();
    //     }
    // }

    // Cập nhật dữ liệu biểu đồ chi tiết và vẽ lại biểu đồ
    updateAndPreviewPieChart(): void {
        this.updatePieChartDetail();
        if (this.columnsPie[0].length > 0 && this.columnsPie[1].length > 0) {
            this.previewPieChart(this.tableData);
        } else {
            // this.eventsSubject.next(DEFAULT_NULL_CHART);
            this.chartInfo = DEFAULT_NULL_CHART;
        }
    }

    updateAndPreviewBarChart(): void {
        this.updateBarChartDetail();
        if (this.listColumnsY.length > 0) {
            this.previewBarChart(this.tableData);
        } else {
            // this.eventsSubject.next(DEFAULT_NULL_CHART);
            this.chartInfo = DEFAULT_NULL_CHART;
        }
    }

    updateAndPreviewLineChart(): void {
        this.updateLineChartDetail();
        if (this.x_coord.length > 0 && this.lines.length > 0) {
            this.previewLineChart(this.tableData);
        } else {
            // this.eventsSubject.next(DEFAULT_NULL_CHART);
            this.chartInfo = DEFAULT_NULL_CHART;
        }
    }
    // 

    randomNumber(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    // Được gọi khi chọn một biểu đồ đã được vẽ trước đó
    renderChart(value: any, tableDataParam: any) {
        // this.loadingChart = true;
        if (tableDataParam == undefined || tableDataParam == null) {
            // this.eventsSubject.next(DEFAULT_NULL_CHART);
            this.chartInfo = DEFAULT_NULL_CHART;
            // this.loadingChart = false;
            return;
        }
        if (value == null || value?.MA_LOAI_BIEUDO == null) {
            this.chartInfo = DEFAULT_NULL_CHART;
            // this.eventsSubject.next(DEFAULT_BAR_CHART);
            return;
        }
        // reset pie chart data
        this.columnsPie[0] = '';
        this.columnsPie[1] = '';

        // reset bar chart data
        this.columnsX = '';
        this.listColumnsY = [];
        this.lstCotColors = [];

        // reset line chart data
        this.x_coord = '';
        this.lines = [];
        this.lstLineColors = [];

        // column tmp
        let columnsTmp = [];
        if (value.TEN_COT && value.TEN_COT != null) {
            columnsTmp = value.TEN_COT.split(';');
        }
        let _length = columnsTmp.length;

        // color tmp
        let colorsTmp = [];
        if (value.MAU_SAC && value.MAU_SAC != null) {
            colorsTmp = value.MAU_SAC.split(';');
        }

        if (value.MA_LOAI_BIEUDO == CHART_TYPE.PIE) {
            if (_length > 0) {
                this.columnsPie[0] = columnsTmp[0];
            }
            if (_length > 1) {
                this.columnsPie[1] = columnsTmp[1];
            }

            if (this.columnsPie[0].length <= 0 || this.columnsPie[1].length <= 0) {
                this.chartInfo = DEFAULT_NULL_CHART;
                // this.eventsSubject.next(DEFAULT_NULL_CHART);
                return;
            }
            this.previewPieChart(tableDataParam);

        } else if (value.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
            if (_length > 0) {
                this.columnsX = columnsTmp[0];
            }
            if (_length > 1) {
                this.listColumnsY = columnsTmp.slice(1, _length);
                for (let index = 0; index < this.listColumnsY.length; index++) {
                    const element = this.listColumnsY[index];
                    this.lstCotColors.push({ key: element, value: colorsTmp[index] });
                }
            }

            if (this.listColumnsY.length <= 0) {
                this.chartInfo = DEFAULT_NULL_CHART;
                // this.eventsSubject.next(DEFAULT_NULL_CHART);
                return;
            }
            this.previewBarChart(tableDataParam);
        } else if (value.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            if (_length > 0) {
                this.x_coord = columnsTmp[0];
            }
            if (_length > 1) {
                this.lines = columnsTmp.slice(1, _length);
                for (let index = 0; index < this.lines.length; index++) {
                    const element = this.lines[index];
                    this.lstLineColors.push({ key: element, value: colorsTmp[index] });
                }
            }

            if (this.x_coord.length <= 0 || this.lines.length <= 0) {
                this.chartInfo = DEFAULT_NULL_CHART;
                // this.eventsSubject.next(DEFAULT_NULL_CHART);
                return;
            }
            this.previewLineChart(tableDataParam);
        } else {
            this.chartInfo = DEFAULT_NULL_CHART;
            // this.eventsSubject.next(DEFAULT_NULL_CHART);
        }
    }

    // Hiển thị biểu đồ pie
    previewPieChart(data: any) {
        let labelSet = new Set();
        let dataArray = [];
        data.forEach(e => {
            labelSet.add(e[this.columnsPie[0]]);
        });

        if (labelSet.size >= MAX_CHART_DATA_POINT) {
            this._messageService.showWarningMessage('Thông báo', 'Số lượng điểm dữ liệu quá lớn làm biểu đồ có quá nhiều mảnh');
            this.object.VALID_CHART_DATA = false;
            this.chartInfo = DEFAULT_NULL_CHART;
            this.chartInfoMapper = ChartDataMapperUtil.getChartDataMapper(this.chartInfo);
            return;
        } else {
            this.object.VALID_CHART_DATA = true;
        }

        labelSet.forEach(e => {
            let sum = 0;
            data.forEach(ee => {
                if (e == ee[this.columnsPie[0]]) {
                    sum += ee[this.columnsPie[1]];
                }
            });
            dataArray.push(Number.parseFloat(sum.toFixed(2)));
        });

        this.chartInfo = {
            series: dataArray,
            chart: {
                width: '80%',
                type: 'pie'
            },
            labels: Array.from(labelSet).map(e => this.getXAxisValue(e, this.columnsPie[0])),
            title: !this.inputMode ? {
                text: this.object.MO_TA,
                align: 'center',
                margin: 10,
                offsetX: 0,
                offsetY: 15,
                floating: false,
                style: {
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    fontFamily: 'Roboto',
                    color: '#000000'
                },
            } : {}
        };
        this.updatePieChartDetail();
        // this.loadingChart = false;
        this.chartInfoMapper = ChartDataMapperUtil.getChartDataMapper(this.chartInfo);
    }

    // bắt sự kiện click vào một hàng
    onRowClick(element: any) {
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
            if (this.listColumnsY.includes(element.TEN_COT)) {
                this.selectedRow = element.TEN_COT;
                for (let index = 0; index < this.listColumnsY.length; index++) {
                    const element = this.listColumnsY[index];
                    if (element == this.selectedRow) {
                        this.colorPicked = this.lstCotColors[index].value;
                        continue;
                    }
                }
                this.toggle = !this.toggle;
            } else {
                return;
            }
        } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            if (this.lines.includes(element.TEN_COT)) {
                this.selectedRow = element.TEN_COT;
                for (let index = 0; index < this.lines.length; index++) {
                    const element = this.lines[index];
                    if (element == this.selectedRow) {
                        this.colorPicked = this.lstLineColors[index].value;
                        continue;
                    }
                }
                this.toggle = !this.toggle;
            } else {
                return;
            }
        }
    }

    // Kiểm tra xem cột chọn màu có được hiển thị hay không
    colorColumnShow(): boolean {
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR || this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            return true;
        }
        return false;
    }

    // Kiểm tra xem ô chọn màu có được hiển thị hay không
    colorShow(element: any): boolean {
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR && this.listColumnsY.includes(element.TEN_COT)) {
            return true;
        }
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE && this.lines.includes(element.TEN_COT)) {
            return true;
        }
        return false;
    }

    // Trả về background color của một ô
    getBgrColor(element: any): string {
        let res = 'FFFFFF';
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
            this.lstCotColors.forEach(e => {
                if (e.key == element.TEN_COT) res = e.value;
            });
        }
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            this.lstLineColors.forEach(e => {
                if (e.key == element.TEN_COT) res = e.value;
            });
        }
        return res;
    }

    // bắt sự kiện chọn màu 
    onColorPickerSelect(value: any) {
        // console.log(value);
        if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.BAR) {
            for (let index = 0; index < this.listColumnsY.length; index++) {
                const element = this.listColumnsY[index];
                if (element == this.selectedRow) {
                    this.lstCotColors[index].value = value;
                    continue;
                }
            }
            this.updateAndPreviewBarChart();
        } else if (this.object.MA_LOAI_BIEUDO == CHART_TYPE.LINE) {
            for (let index = 0; index < this.lines.length; index++) {
                const element = this.lines[index];
                if (element == this.selectedRow) {
                    this.lstLineColors[index].value = value;
                    continue;
                }
            }
            this.updateAndPreviewLineChart();
        }
    }

    // Sắp xếp các cột/đường theo thứ tự khi khai thác
    _sortFunc(a: string, b: string) {
        return this.rows.find(e => e.TEN_COT == a).STT - this.rows.find(e => e.TEN_COT == b).STT;
    }

    // Tùy biến kiểu dữ liệu của nhóm
    getXAxisValue(value: any, TEN_COT: string) {
        let kieuDL = "";
        this.rows.forEach(e => {
            if (e.TEN_COT == TEN_COT) {
                kieuDL = e.MA_KIEU_DLIEU;
            }
        });
        if (kieuDL.length == 0 || kieuDL == KIEU_DULIEU.SO || kieuDL == KIEU_DULIEU.CHUOI) {
            return value;
        } else if (kieuDL == KIEU_DULIEU.NGAY) {
            return this._datePipe.transform(value, "dd/MM/yyyy")
        } else {
            return this._datePipe.transform(value, "dd/MM/yy HH:mm");
        }
    }

    // Hiển thị biểu đồ bar
    async previewBarChart(data: any) {
        if (this.columnsX.length > 0) { // Nếu có nhóm dữ liệu
            // get X categories
            let categories = new Set();
            data.forEach(e => {
                categories.add(e[this.columnsX]);
            });

            if (categories.size >= MAX_CHART_DATA_POINT) {
                this._messageService.showWarningMessage('Thông báo', 'Số lượng điểm dữ liệu quá lớn khiến hệ thống mất nhiều thời gian để vẽ biểu đồ');
                this.object.VALID_CHART_DATA = false;
                this.chartInfo = DEFAULT_NULL_CHART;
                this.chartInfoMapper = ChartDataMapperUtil.getChartDataMapper(this.chartInfo);
                return;
            } else {
                this.object.VALID_CHART_DATA = true;
            }

            let colors = [];
            this.lstCotColors.forEach(e => {
                colors.push(e.value);
            });

            this.chartInfo = {
                chart: {
                    type: 'bar',
                    width: '100%'
                },
                xAxis: {
                    categories: Array.from(categories),
                    type: 'category',
                    title: this.object.CHIEU != 'ngang' ? {
                        text: this.rows.find(e => e.TEN_COT == this.columnsX)?.MO_TA,
                        position: 'bottom',
                        offsetX: -10,
                        style: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#263238'
                        }
                    } : {},
                },
                series: [],
                yAxis: {
                    title: this.object.CHIEU == 'ngang' ? {
                        text: this.rows.find(e => e.TEN_COT == this.columnsX)?.MO_TA,
                        position: 'bottom',
                        offsetY: -10,
                        style: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#263238'
                        }
                    } : {},
                    // labels: this.object.CHIEU == 'ngang' ? {
                    //     formatter: (value) => value.toFixed(0)
                    // } : {}
                },
                colors: colors,
                plotOptions: {
                    bar: {
                        horizontal: this.object.CHIEU == 'ngang',
                        dataLabels: {
                            position: 'top',
                        }
                    },
                },
                title: !this.inputMode ? {
                    text: this.object.MO_TA,
                    align: 'center',
                    margin: 10,
                    offsetX: 0,
                    offsetY: 15,
                    floating: false,
                    style: {
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        fontFamily: 'Roboto',
                        color: '#000000'
                    },
                } : {},
                dataLabels: {
                    enabled: false
                }
            };
        } else {
            let colors = [];
            this.lstCotColors.forEach(e => {
                colors.push(e.value);
            });

            this.chartInfo = {
                chart: {
                    type: 'bar',
                    width: '100%'
                },
                series: [],
                xAxis: {
                    categories: [' ']
                },
                colors: colors,
                plotOptions: {
                    bar: {
                        horizontal: this.object.CHIEU == 'ngang',
                        dataLabels: {
                            position: 'top',
                        }
                    },
                },
                title: !this.inputMode ? {
                    text: this.object.MO_TA,
                    align: 'center',
                    margin: 10,
                    offsetX: 0,
                    offsetY: 15,
                    floating: false,
                    style: {
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        fontFamily: 'Roboto',
                        color: '#000000'
                    },
                } : {},
                dataLabels: {
                    enabled: false
                }
            };
        }
        await firstValueFrom(this._vebieudoService.getBarChartSeries(this.columnsX, this.listColumnsY, this.chartInfo.xAxis.categories, this.group.MA_DULIEU))
            .then((response: any) => {
                if (response.status == 1) {
                    this.chartInfo.series = response.data;
                } else {
                    this._messageService.showErrorMessage('Thông báo', response.message);
                }
            })
            .catch(err => console.log(err));
        if (this.columnsX.length > 0) {
            this.chartInfo.xAxis.categories = this.chartInfo.xAxis.categories.map(e => this.getXAxisValue(e, this.columnsX));
        }
        this.chartInfoMapper = ChartDataMapperUtil.getChartDataMapper(this.chartInfo);
    }

    // Hiển thị biểu đồ line
    async previewLineChart(data: any) {
        // get X categories
        let categories = new Set();
        data.forEach(e => {
            categories.add(e[this.x_coord]);
        });

        if (categories.size >= MAX_CHART_DATA_POINT) {
            this._messageService.showWarningMessage('Thông báo', 'Số lượng điểm dữ liệu quá lớn khiến hệ thống mất nhiều thời gian để vẽ biểu đồ');
            this.object.VALID_CHART_DATA = false;
            this.chartInfo = DEFAULT_NULL_CHART;
            this.chartInfoMapper = ChartDataMapperUtil.getChartDataMapper(this.chartInfo);
            return;
        } else {
            this.object.VALID_CHART_DATA = true;
        }

        let _series = [];
        await firstValueFrom(this._vebieudoService.getSeries(this.lines, this.x_coord, Array.from(categories), this.group.MA_DULIEU).pipe(takeUntil(this._unsubscribeAll)))
            .then((e: any) => {
                if (e.status == 1) {
                    _series = e.data;
                } else {
                    this._messageService.showErrorMessage('Thông báo', 'Thông tin biểu đồ không hợp lệ');
                }
            })
            .catch(err => console.log(err));;

        let _categories = Array.from(categories).map(e => this.getXAxisValue(e, this.x_coord));

        let colors = [];
        this.lstLineColors.forEach(e => colors.push(e.value));

        this.chartInfo = {
            chart: {
                type: 'line',
                width: '100%'
            },
            xAxis: {
                categories: _categories,
                type: 'category',
                title: {
                    text: this.rows.find(e => e.TEN_COT == this.x_coord)?.MO_TA,
                    position: 'bottom',
                    offsetY: -10,
                    style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#263238'
                    }
                }
            },
            series: _series,
            colors: colors,
            title: !this.inputMode ? {
                text: this.object.MO_TA,
                align: 'center',
                margin: 10,
                offsetX: 0,
                offsetY: 15,
                floating: false,
                style: {
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    fontFamily: 'Roboto',
                    color: '#000000'
                },
            } : {}
        };
        this.chartInfoMapper = ChartDataMapperUtil.getChartDataMapper(this.chartInfo);
    }

    // Khi thay đổi chiều (ngang - dọc) của biểu đồ bar
    changeChieu(event: any) {
        this.object.CHIEU = event.value;
        this.updateBarChartDetail();
        if (this.listColumnsY.length > 0) {
            this.previewBarChart(this.tableData);
        } else {
            // this.eventsSubject.next(DEFAULT_NULL_CHART);
            this.chartInfo = DEFAULT_NULL_CHART;
        }
    }

    // Cập nhật các thuộc tính chi tiết của biểu đồ pie
    updatePieChartDetail() {
        let tenCot = this.columnsPie[0] + ';' + this.columnsPie[1];
        this.object.TEN_COT = tenCot;
    }

    // Cập nhật các thuộc tính chi tiết của biểu đồ bar
    updateBarChartDetail() {
        let tenCot = this.columnsX;
        let truc = 'x';
        let colors = [];

        if (this.listColumnsY.length > 1) {
            this.listColumnsY.sort((a, b) => this._sortFunc(a, b));
            this.lstCotColors.sort((a, b) => this._sortFunc(a.key, b.key));
        }
        this.listColumnsY.forEach(e => {
            tenCot += ';' + e;
            truc += ';' + 'y';
        });
        this.lstCotColors.forEach(e => colors.push(e.value));

        this.object.TEN_COT = tenCot;
        this.object.TRUC = truc;
        this.object.MAU_SAC = colors.join(';');
    }

    // Cập nhật các thuộc tính chi tiết của biểu đồ line
    updateLineChartDetail() {
        let tenCot = this.x_coord;
        let truc = 'x';
        let colors = [];

        if (this.lines.length > 1) {
            this.lines.sort((a, b) => this._sortFunc(a, b));
            this.lstLineColors.sort((a, b) => this._sortFunc(a.key, b.key));
        }
        this.lines.forEach(e => {
            tenCot += ';' + e;
            truc += ';' + 'y';
        });
        this.lstLineColors.forEach(e => colors.push(e.value));

        this.object.TEN_COT = tenCot;
        this.object.TRUC = truc;
        this.object.MAU_SAC = colors.join(';');
    }

    downloadCanvas(): void {
        let dataUrl = (<HTMLCanvasElement> document.getElementById('chartCanvas')).toDataURL();
        dataUrl = dataUrl.replace('data:image/png;base64,', '');
        let fileName = this.chartInfo?.title?.text;
        if (fileName == null) {
            fileName = 'download.png';
        } else {
            fileName += '.png';
        }
        this._fileSaverService.downloadFile(dataUrl, fileName, FILE_TYPE.IMAGE);
    }

    downloadExcel(): void {
        this._vebieudoService.getExcelData(this.object.MA_DULIEU)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                if (response.status == 1) {
                    const byteStr = response.dataExcel;
                    this._fileSaverService.downloadFile(byteStr, response.fileName, FILE_TYPE.EXCEL);
                } else {
                    this._messageService.showErrorMessage('Thông báo', response.message);
                }
            })
    }

    ngOnDestroy(): void {
        this.eventsSubscription.unsubscribe();
        this.eventsSubject.complete();
        this.eventsSubject.unsubscribe();
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}