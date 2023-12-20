import { ChartOptions } from "chart.js";

export default class ChartOptionsUtil {
    static getPieChartOptions(title: string): ChartOptions {
        return {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "right",
                    align: "center"
                },
                title: {
                    text: title,
                    display: true,
                    align: "center",
                    font: {
                        family: 'Roboto',
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#000000'
                },
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr: any[] = ctx.chart.data.datasets[0].data;
                        dataArr.map((data: number) => {
                            sum += data;
                        });
                        let percentage = (value * 100 / sum).toFixed(2) + "%";
                        return percentage;
                    },
                    color: '#fff',
                }
            }
        }
    }

    static getBarChartOptions(horizontal: boolean, title: string, xTitle: string): ChartOptions {
        return {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center'
                },
                title: {
                    text: title,
                    display: true,
                    align: "center",
                    font: {
                        family: 'Roboto',
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#000000'
                },
                datalabels: {
                    display: false
                }
            },
            indexAxis: horizontal ? "y" : "x",
            scales: {
                xTitle: {
                    title: {
                        text: xTitle,
                        align: 'center',
                        color: '#263238',
                        font: {
                            family: 'Roboto',
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    }

    static getLineChartOptions(title: string, xTitle: string): ChartOptions {
        return {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center'
                },
                title: {
                    text: title,
                    display: true,
                    align: "center",
                    font: {
                        family: 'Roboto',
                        size: 14,
                        weight: 'bold'
                    },
                    color: '#000000'
                },
                datalabels: {
                    display: false
                }
            },
            scales: {
                xTitle: {
                    title: {
                        text: xTitle,
                        align: 'center',
                        color: '#263238',
                        font: {
                            family: 'Roboto',
                            size: 14,
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    }
}