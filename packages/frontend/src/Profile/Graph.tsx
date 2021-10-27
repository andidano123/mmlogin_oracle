import React, { Component } from 'react';
import Chart from "react-apexcharts";
import { PriceItem } from '../types';
interface Props {
	chartdata: PriceItem[]
}
export const Graph = ({ chartdata }: Props): JSX.Element => {
    
    const data = [];
    let rebate = 0.5;
    rebate = Number(rebate.toFixed(2));
    
    for(let i = 0; i < chartdata.length; i+=1) {                            
        // data.push([chartdata[i].ts, chartdata[i].price]);
        data.push([i, chartdata[i].price]);
    }
    const state = {
        options: {
            chart: {
                // type: 'area',
                height: 288,
                toolbar: {
                    show: false,
                },
                zoom: {
                    enabled: false
                },                    
            },
            // legend: {                    
            //     position: 'top',
            //     horizontalAlign: 'right',
            //     show: true,
            // },
            colors: ['#6435c9'],
            dataLabels: {
                enabled: false
            },
            markers: {
                size: 0,
                style: 'hollow',
            },
            // xaxis: {
            //     type: "datetime",
            //     min:0,
            //     labels: {
            //         formatter: function (value: number) {
            //             return value;
            //         }
            //     }
            // },
            // // tooltip: {
            // //     custom: function({series, seriesIndex, dataPointIndex, w}) {
            // //         return '<div class="arrow_box">' +
            // //         '<div>' + 'Day' + ":" + dataPointIndex  + '</div>' +
            // //         '<div>' + "+" + series[seriesIndex][dataPointIndex] + "   GDP" + "(+" + (series[seriesIndex][dataPointIndex] / 10).toFixed(1) + "%)" + '</div>' +
            // //         '</div>'
            // //     }
            // // },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.9,
                    stops: [0, 100]
                }
            },
            // stroke: {
            //     show: true,
            //     curve: 'straight',
            //     width: 1,
            // },
            grid: {
                borderColor: '#111',
                strokeDashArray: 7,
                stroke: 1,
                yaxis: {                            
                    lines: {
                        show: true,
                    }
                },
            },
        },
        series: [{
            name: 'ETHUSDT',
            data: data
        }
        ],
    };

    return (
        <div>
            <Chart
                options={state.options}
                series={state.series}
                type="area"
                height="300px"
            />
        </div>
    );    
}
