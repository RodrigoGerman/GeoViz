/**
 * @version       1.5

 * @author        Rodrigo German Lopez <rodris-96@live.com.mx>

 * @copyright     RodrigoGermanLopez

 * @license       This script is developed by FI UNAM.
 */

class ChartsTime {

    //One line chart.
    constructor(element, dates, lineTime1) {
        this.element = element;
        this.dates = dates;
        this.numCharts = 0
        this.colorLine = ['rgba(4, 2, 0, 1.0)', 'rgba(255, 24, 0, 1.0)', 'rgba(1, 34, 210, 1.0)'];
        this.datasets = [];
        if (dates.length >= 1) {
            this.dateMin = dates[0]
            this.dateMax = dates[dates.length - 1]
        }
    }

    updateDates(dates) {
        this.dates = dates;
        if (dates.length >= 1) {
            this.dateMin = dates[0]
            this.dateMax = dates[dates.length - 1]
        }
    }

    addRegression(data, degre, name, pos) {
        degre = degre || 2;
        let dataRegression = [];
        data.forEach((element, index) => dataRegression.push([index + 1, element*1000]));
        var equation = regression('linear', dataRegression).equation;

        var lineTimeAux = [{
                x: this.dates[0],
                y: (equation[1]).toFixed(3)
            },
            {
                x: this.dates[this.dates.length - 1],
                y: ((this.dates.length * equation[0] + equation[1])).toFixed(3)
            }
        ]

        if (lineTimeAux.length != 0) {
            this.datasets.push({
                label: name,
                data: lineTimeAux,
                value: ((equation[0]).toFixed(3)).toString(),
                fill: false,
                showLine: true,
                borderWidth: 2,
                pointHitRadius: 2,
                pointRadius: 0.0,
                pointStyle: 'line',
                backgroundColor: this.colorLine[pos],
                borderColor: this.colorLine[pos]
            });
        }
    }

    changeRegression(data, degre, name, pos, pos2) {
        degre = degre || 2;
        let dataRegression = [];

        data.forEach((element, index) => dataRegression.push([index + 1, element*1000]));
        var equation = regression('linear', dataRegression).equation;

        var lineTimeAux = [{
                x: this.dates[0],
                y: (equation[1]).toFixed(3)
            },
            {
                x: this.dates[this.dates.length - 1],
                y: ((this.dates.length * equation[0] + equation[1])).toFixed(3)
            }
        ]


        if (lineTimeAux.length != 0) {
            this.datasets[pos2] = {
                label: name,
                data: lineTimeAux,
                value: ((equation[0]).toFixed(3)).toString(),
                fill: false,
                showLine: true,
                borderWidth: 2,
                pointHitRadius: 2,
                pointRadius: 0.0,
                pointStyle: 'line',
                backgroundColor: this.colorLine[pos],
                borderColor: this.colorLine[pos]
            }
        }
    }

    refreshChart() {
        this.chart = new Chart(this.element, {
            type: 'line',
            data: {
                labels: this.dates,
                datasets: this.datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                   labels: {
                      usePointStyle: true
                   }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: 'rgba(0, 0, 0, 1.0)',
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            fontColor: 'rgba(0, 0, 0, 1.0)',
                            labelString: 'Displacement [mm]'
                        }
                    }],
                    xAxes: [{
                        type: 'time',
                        time: {
                            format: "YYYYMMDD",
                            unit: 'month',
                            displayFormats: {
                                'millisecond': 'MM/YY',
                                'second': 'MM/YY',
                                'minute': 'MM/YY',
                                'hour': 'MM/YY',
                                'day': 'MM/YY',
                                'week': 'MM/YY',
                                'month': 'MM/YY',
                                'quarter': 'MM/YY',
                                'year': 'MM/YY'
                            },
                            min: this.dateMin,
                            max: this.dateMax
                        },
                        ticks: {
                            fontColor: 'rgba(0, 0, 0, 1.0)',
                            maxTicksLimit: 6
                        },
                        scaleLabel: {
                            display: true,
                            fontColor: 'rgba(0, 0, 0, 1.0)',
                            labelString: 'Date [MM/YY]'
                        }
                    }]
                },
                tooltips: {
                    enabled: true,
                    intersect: false,
                    mode: 'nearest',
                    callbacks: {
                        title: function (tooltipItem, data) {
                          var date = tooltipItem[0]["xLabel"]
                          return date.substring(6,8) + "/" + date.substring(4,6) + "/" + date.substring(0,4);
                        },
                        label: function(tooltipItem, data) {
                          return  'Displacement: ' + tooltipItem["yLabel"] + " [mm]";
                        },
                        footer: function(tooltipItem, data) {

                          var aux = tooltipItem[0]['datasetIndex'];

                          if (data['datasets'].length == 2){
                            if (aux == 1 || aux == 0){
                              var aux2 = data['datasets'][1]['value']
                              if(aux2 != null)
                                return "Velocity: " + data['datasets'][1]['value'] + " [mm/year]";
                              }
                          }

                          if (data['datasets'].length == 4){
                            if (aux == 2 || aux == 0)
                              return "Velocity: " + data['datasets'][2]['value'] + " [mm/year]";

                            if (aux == 3 || aux == 1)
                              return "Velocity: " + data['datasets'][3]['value'] + " [mm/year]";
                          }

                          if (data['datasets'].length == 6){
                            if (aux == 3 || aux == 0)
                              return "Velocity: " + data['datasets'][3]['value'] + " [mm/year]";

                            if (aux == 4 || aux == 1)
                              return "Velocity: " + data['datasets'][4]['value'] + " [mm/year]";

                            if (aux == 5 || aux == 2)
                              return "Velocity: " + data['datasets'][5]['value'] + " [mm/year]";
                          }
                        }
                    }
                }
            }
        });
    }

    changeLine(lineTime, name, pos) {
        var lineTimeAux = [];
        for (var i = 0; i < lineTime.length; i++) {
            lineTimeAux.push((lineTime[i] * 1000).toFixed(3));
        }

        if (lineTimeAux.length != 0) {
            this.datasets[pos] = {
                label: name,
                data: lineTimeAux,
                fill: false,
                showLine: false,
                backgroundColor: this.colorLine[pos],
                borderColor: this.colorLine[pos]
            };
        }
    }

    addLine(lineTime, name) {
        var lineTimeAux = [];
        for (var i = 0; i < lineTime.length; i++) {
            lineTimeAux.push((lineTime[i] * 1000).toFixed(3));
        }

        if (lineTimeAux.length != 0 && this.numCharts < 3) {
            this.datasets.push({
                label: name,
                data: lineTimeAux,
                fill: false,
                showLine: false,
                backgroundColor: this.colorLine[this.numCharts],
                borderColor: this.colorLine[this.numCharts]
            });

            this.numCharts += 1;
        }
    }

    reset() {
        this.datasets = [];
        this.numCharts = 0;
    }

    resetAll() {
        this.element = null;
        this.dates = [];
        this.numCharts = 0;
        this.datasets = [];
        this.dateMin = 0;
        this.dateMax = 0;
    }


    setTimeInterval(max, min) {
        this.dateMin = min;
        this.dateMax = max;
    }

    getDatesMinMax() {
        return this.dateMin;
    }

    getNumCharts() {
        return this.numCharts;
    }

    getChart() {
        return this.chart;
    }

    destroy() {
        if (this.chart != null)
            this.chart.destroy();
    }
}
