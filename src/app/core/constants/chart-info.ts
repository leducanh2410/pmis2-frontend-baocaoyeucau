export const CHART_TYPE = {
    BAR: 'BAR',
    LINE: 'LINE',
    PIE: 'PIE',
}

export const MAX_INT_32BIT = 2147483647;

export const CHART_ICON = {
    BAR_CHART: 'mat_outline:bar_chart',
    PIE_CHART: 'mat_outline:pie_chart',
    LINE_CHART: 'mat_outline:stacked_line_chart'
}

export const colors = [
    '#008FFB','#00E396','#FEB019','#FF4560','#775DD0',
    '#3F51B5','#03A9F4','#4CAF50','#F9CE1D','#FF9800',
    '#33B2DF','#546E7A','#D4526E','#13D8AA','#A5978B',
    '#4ECDC4','#C7F464','#81D4FA','#546E7A','#FD6A6A',
    '#2B908F','#F9A3A4','#90EE7E','#FA4443','#69D2E7',
    '#449DD1','#F86624','#EA3546','#662E9B','#C5D86D',
    '#D7263D','#1B998B','#2E294E','#F46036','#E2C044',
    '#662E9B','#F86624','#F9C80E','#EA3546','#43BCCD',
    '#5C4742','#A5978B','#8D5B4C','#5A2A27','#C4BBAF',
    '#A300D6','#7D02EB','#5653FE','#2983FF','#00B1F2'
];

export class ChartInfo {
    series: any[] = [];
    colors: string[] = [];
    categories: any[] = [];
    x_title: string = '';
    y_axis: any[] = [];
    title: string = '';
    stroke_width: number[] = [];
    legend_w: number[] = [];
    legend_h: number[] = [];
    type: string = 'line';
    labels: any[] = [];
    dataLabels: any = {
        enabled: false
    };
}

export const DEFAULT_BAR_CHART = {
    series: [
        {
            name: "Inflation",
            data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2]
        }, {
            name: "1T",
            data: [4.3, 1.1, 2.0, 12.1, 4.0, 3.6, 3.2, 2.3, 4.4, 5.8, 1.5, 6.2]
        }
    ],
    chart: {
        type: "bar",
        width: '100%'
    },
    plotOptions: {
        bar: {
            dataLabels: {
                position: "top" // top, center, bottom
            },
            columnWidth: "55%",
        }
    },
    dataLabels: {
        enabled: false,
        formatter: function (val) {
            return val + "%";
        },
        offsetY: -20,
        style: {
            fontSize: "12px",
            colors: ["#304758"]
        }
    },
    xaxis: {
        categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ],
        position: "top",
        labels: {
            offsetY: -18
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        },
        tooltip: {
            enabled: true,
        }
    },
    yaxis: {
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: true
        },
        labels: {
            show: true,
            formatter: function (val) {
                return val + "%";
            }
        }
    },
}

export const DEFAULT_LINE_CHART = {
    series: [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    }],
    chart: {
        height: 350,
        type: 'line',
        zoom: {
            enabled: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'straight'
    },
    title: {
        text: 'Product Trends by Month',
        align: 'left'
    },
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
        },
    },
    xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    }
}

export const DEFAULT_PIE_CHART = {
    series: [44, 55, 13, 43, 22],
    chart: {
        width: 380,
        type: 'pie',
    },
    labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }]
}

export const DEFAULT_NULL_CHART = {
    chart: {
        type: "line",
        width: "100%",
        animations: {
            enabled: false
        }
    },
    series: [],
    xAxis: {
        categories: []
    },
    title: {
        text: ''
    }
}

export const KIEU_DULIEU = {
    SO: "KDL-2",
    CHUOI: "KDL-1",
    NGAY: "KDL-3",
    NGAY_GIO: "KDL-4"
}

export class BCTM_BIEUDO_CHITIET {
    MA_BIEUDO: string = '';
    CHIEU: string = '';
    TEN_COT: string = '';
    HIEN: string = '';
    TRUC: string = '';
    DON_VI: string = '';
    MAU_SAC: string = '';
    STT_COT: string = '';
    USER_CR_ID: string;
    USER_CR_DTIME: Date;
    USER_MDF_ID: string;
    USER_MDF_DTIME: Date;
}