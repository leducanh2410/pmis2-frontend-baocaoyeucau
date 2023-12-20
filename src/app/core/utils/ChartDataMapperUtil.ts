import { CHART_TYPE } from "../constants/chart-info";
import ChartOptionsUtil from "./ChartOptionsUtil";

export default class ChartDataMapperUtil {
    static getAllChartDataMapper(allChartData: any, layout: string): any {
        return allChartData
            .filter(e => e.layout == layout)
            .map(e => e = e.chartOptions)
            .map(e => e = ChartDataMapperUtil.getChartDataMapper(e));
    }

    static getChartDataMapper(chartInfo: any): any {
        return {
            type: chartInfo.chart.type,
            data: {
                labels: chartInfo.chart.type == 'pie' ? chartInfo.labels : chartInfo.xAxis.categories,
                datasets: chartInfo.chart.type == 'pie' ?
                    [{
                        data: chartInfo.series
                    }] :
                    chartInfo.series.map((ee, index) => ee = {
                        data: ee.data,
                        label: ee.name,
                        backgroundColor: (chartInfo.colors != undefined && chartInfo.colors != null) ? chartInfo.colors[index] : [],
                        borderColor: (chartInfo.colors != undefined && chartInfo.colors != null) ? chartInfo.colors[index] : [],
                        pointBackgroundColor: (chartInfo.colors != undefined && chartInfo.colors != null) ? chartInfo.colors[index] : [],
                        pointBorderColor: (chartInfo.colors != undefined && chartInfo.colors != null) ? chartInfo.colors[index] : [],
                        pointHoverBackgroundColor: (chartInfo.colors != undefined && chartInfo.colors != null) ? chartInfo.colors[index] : [],
                        pointHoverBorderColor: (chartInfo.colors != undefined && chartInfo.colors != null) ? chartInfo.colors[index] : [],
                        pointRadius: 1,
                        pointHoverRadius: 1
                    })
            },
            chartOptions: ChartDataMapperUtil.getChartOptions(chartInfo.chart.type.toUpperCase(), chartInfo.title.text, chartInfo?.plotOptions?.bar?.horizontal, chartInfo?.xAxis?.title?.text)
        }
    }

    static getChartOptions(type: string, title: string, horizontal?: boolean, xAxisTitle?: string): any {
        if (type == CHART_TYPE.PIE) {
            return ChartOptionsUtil.getPieChartOptions(title);
        } else if (type == CHART_TYPE.BAR) {
            return ChartOptionsUtil.getBarChartOptions(horizontal, title, xAxisTitle);
        } else if (type == CHART_TYPE.LINE) {
            return ChartOptionsUtil.getLineChartOptions(title, xAxisTitle);
        }
        return null;
    }
}