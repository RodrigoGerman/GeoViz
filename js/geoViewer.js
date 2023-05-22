/**
 * @version       1.5

 * @author        Rodrigo German Lopez <rodris-96@live.com.mx>

 * @copyright     RodrigoGermanLopez

 * @license       This script is developed by FI UNAM.

 * @see           https://openlayers.org/en/latest/apidoc/
*/

/* Variables*/
document.getElementById("idMap").style.cursor = "move";
var mexMap = new Map('idMap', [-99.1269, 19.4978], new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'http://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 16
    })
}));
var zoneMap = new Zone([], []);
var style = new StylePoint();
var charts = new ChartsTime(document.getElementById('pointChart').getContext('2d'), [], []);
var setTypeMaps = document.getElementById("typeMaps");
var reset = document.getElementById("reset");
var about = document.getElementById("about");
var manual = document.getElementById("manual");
var velocityMax = document.getElementById("velocityMax");
var velocityMin = document.getElementById("velocityMin");
var timeChartMin = document.getElementById("timeMin");
var timeChartMax = document.getElementById("timeMax");
var setChartTime = document.getElementById("setTime");
var resetChartTime = document.getElementById("resetTime");
var cancelChartTime = document.getElementById("cancelTime");
var resetCharts = document.getElementById("resetCharts");
var regressionCharts = document.getElementById("regressionCharts");
var timeCharts = document.getElementById("timeCharts");
var closeCharts = document.getElementById("closeCharts");
var buttonLine0 = document.getElementById("buttonLine0");
var buttonLine1 = document.getElementById("buttonLine1");
var buttonLine2 = document.getElementById("buttonLine2");
var selectDates = document.getElementById('selectdates');
var selectDates2 = document.getElementById('selectdates2');
var selectDatasets = document.getElementById("datasets");
var timeSeriesChartsOld = [];
var selectedPoint = [];

/*Functions*/
function resetAll() {
    zoneMap.resetAll();
    charts.resetAll();
    style.resetAll();
    mexMap.resetAll();
}

/**
 * Function that load layer that contains all zones the map.
 * @param {String} nameFile  -> Represent the name File that contains the information the zones.
 * @param {map} map -> Represents the map.
 */
function loadZones(nameFile, map) {
    var data = [];

    $.ajax({
        dataType: "json",
        url: nameFile,
        data: data,
        success: function(data) {
            var polygon = [];
            var tiles = data["features"];
            for (var tile = 0; tile < tiles.length; tile++) {
                var coordinates = tiles[tile]['geometry']
                polygon.push(new ol.Feature({
                    geometry: new ol.geom.Polygon([coordinates]),
                    name: tiles[tile]['name']
                }));
                selectDatasets.options[selectDatasets.options.length] = new Option(tiles[tile]['name'], tiles[tile]['name']);
            }
            var zone = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: polygon
                })
            });

            map.addLayer(zone);
        },
        error: function(XMLHttpRequest, status, error) {
            if (confirm("Error in Connection. \nRefresh the page.")) {
                document.location.reload(true);
            } else {
                document.location.reload(true);
            }
        }
    });
}

/**
 * Function that load the data general of zone selected.
 * @param {String} nameFile -> Represent the name File that contains the information the zone.
 * @param {map} map -> Represents the map.
 * @param {zone} zoneMap -> Represents the object of type zone to stock the data of the zone.
 */
function loadZone(map, nameTile, zoneMap) {
    var data = [];

    $.ajax({
        dataType: "json",
        url: "datasets/" + nameTile + "/info.json",
        data: data,
        success: function(data, status) {
            document.getElementById('processBar').style.display = "block";
            document.getElementById('colorBar').style.display = "block";

            map.removeTiles();
            map.refreshTiles();
            map.setZoom(10);

            zoneMap.setDates(data['Date']);
            zoneMap.setNumJson(data['Num_Json']);
            zoneMap.setValuesM(data['M_min'], data['M_max']);
            map.setCenter(data['Center']);
            document.getElementById('velocityMax').value = (zoneMap.velocityMax * 1000).toFixed(2);
            document.getElementById('velocityMin').value = (zoneMap.velocityMin * 1000).toFixed(2);
            loadDataZone(nameTile, zoneMap);
        },
        error: function(XMLHttpRequest, status, error) {
            if (confirm("Zone not available. \nRefresh the page.")) {
                document.location.reload(true);
            } else {
                document.location.reload(true);
            }
        }
    });
}

/**
 * Function that load the data of zone selected.
 * @param {String} nameFile  -> Represent the name File that contains the information the zone.
 * @param {zone} zoneMap -> Represents the object of type zone to stock the data of the zone.
 */
function loadDataZone(nameTile, zoneMap) {
    var data = [];
    var width = 1;
    var numJson = zoneMap.numJson + 1;
    for (var x = 1; x < numJson; x++) {
        $.ajax({
            dataType: "json",
            url: "datasets/" + nameTile + "/data" + x + ".json",
            data: data,
            success: function(data, status) {
                zoneMap.addData(data);
                width++;
                if (width == numJson || numJson == 0) {
                    document.getElementById('processBar').style.display = "none";
                    document.getElementById('datasets').style.display = "none";
                    var max = (velocityMax.value / 1000).toFixed(3);
                    var min = (velocityMin.value / 1000).toFixed(3);
                    zoneMap.calculateScaleZone();
                    mexMap.refreshPoints(zoneMap, max, min, style, selectedPoint);
                }
            },
            error: function(XMLHttpRequest, status, error) {
                if (confirm("Error in Connection with the Server. \nRefresh the page.")) {
                    document.location.reload(true);
                }
            }
        });
    }
}

/**
 * Function that makes an element drageable.
 * @param elmnt  -> Represent the edocument.getElementById('processBar').style.display = "none";lement.
 */
function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/* Load Data Zones México*/
loadZones("mexZones.json", mexMap);

/* Actions */
setTypeMaps.onchange = function() {
    var source = new ol.source.XYZ({
        url: 'http://server.arcgisonline.com/arcgis/rest/services/' + setTypeMaps.value + '/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 16
    })
    mexMap.setTypeMap(source);
}

selectDatasets.onchange = function() {
    loadZone(mexMap, selectDatasets.value, zoneMap);
    mexMap.vectorLayer.setStyle(style.getStyle);
}

mexMap.selectClick.on('select', function(e) {
    var selectedFeatures = e.target.getFeatures().getArray();
    var featureName, featureName2 = "";

    if (!!selectedFeatures && selectedFeatures.length > 0)
        featureName = selectedFeatures[0].get('name');

    if (featureName != null) {
        if (featureName != "Point") {
            loadZone(mexMap, featureName, zoneMap);
            mexMap.vectorLayer.setStyle(style.getStyle);
            buttonLine0.checked = true;
            buttonLine1.checked = true;
            buttonLine2.checked = true;

        } else if (featureName == "Point") {

            if (!regressionCharts.checked) {
                var numCharts = charts.getNumCharts();
                charts.destroy();
                charts.updateDates(zoneMap.dates);

                if (!buttonLine0.checked) {
                    charts.changeLine(selectedFeatures[0].get('d'), 'Series 1', 0);
                    selectedPoint.splice(0, 1, selectedFeatures[0]['values_']['geometry']['flatCoordinates']);
                    buttonLine0.checked = true;
                } else if (!buttonLine1.checked) {
                    charts.changeLine(selectedFeatures[0].get('d'), 'Series 2', 1);
                    selectedPoint.splice(1, 1, selectedFeatures[0]['values_']['geometry']['flatCoordinates']);
                    buttonLine1.checked = true;
                } else if (!buttonLine2.checked) {
                    charts.changeLine(selectedFeatures[0].get('d'), 'Series 3', 2);
                    selectedPoint.splice(2, 1, selectedFeatures[0]['values_']['geometry']['flatCoordinates']);
                    buttonLine2.checked = true;
                } else if (numCharts < 3) {
                    charts.addLine(selectedFeatures[0].get('d'), 'Series ' + ((numCharts) + 1).toString());
                    selectedPoint.push(selectedFeatures[0]['values_']['geometry']['flatCoordinates']);
                    document.getElementById('divButtonLine' + (numCharts).toString()).style.display = "flex";
                }
                charts.refreshChart();
                if (numCharts == 0) {
                    document.getElementById('chartPoints').style.display = "flex";
                    document.getElementById('divButtonRegression').style.display = "flex";
                    document.getElementById('divButtonTime').style.display = "flex";

                    var option, option2 = '';
                    for (var i = 0; i < zoneMap.dates.length; i++) {
                        option = document.createElement('option');
                        option2 = document.createElement('option');
                        var date = zoneMap.dates[i].substring(6, 8) + '/' + zoneMap.dates[i].substring(4, 6) + '/' + zoneMap.dates[i].substring(0, 4);
                        option.value = zoneMap.dates[i];
                        option2.value = zoneMap.dates[i];
                        option.text = date;
                        option2.text = date;
                        selectDates.add(option);
                        selectDates2.add(option2);
                    }

                }
                var max = (velocityMax.value / 1000).toFixed(3);
                var min = (velocityMin.value / 1000).toFixed(3);
                mexMap.refreshPoints(zoneMap, max, min, style, selectedPoint);
            }
        }
    }
});

mexMap.selectPointerMove.on('select', function(e) {
    var selectedFeatures = e.target.getFeatures().getArray();
    if (selectedFeatures.length > 0) {
        var featureName = selectedFeatures[0].get('name');
        if (featureName.substring(0, 4) == "Zona") {
            selectedFeatures[0].setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'black'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.5)'
                })
            }));
        }
        document.getElementById("idMap").style.cursor = "pointer";
    } else {
        document.getElementById("idMap").style.cursor = "move";
    }

});

mexMap.on('moveend', function(e) {
    var max = (velocityMax.value / 1000).toFixed(3);
    var min = (velocityMin.value / 1000).toFixed(3);
    mexMap.refreshPoints(zoneMap, max, min, style, selectedPoint);
});

velocityMax.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        var max = (velocityMax.value / 1000).toFixed(3);
        var min = (velocityMin.value / 1000).toFixed(3);
        mexMap.refreshPoints(zoneMap, max, min, style, selectedPoint);
    }
});

velocityMin.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        var max = (velocityMax.value / 1000).toFixed(3);
        var min = (velocityMin.value / 1000).toFixed(3);
        mexMap.refreshPoints(zoneMap, max, min, style, selectedPoint);
    }
});

resetChartTime.addEventListener("click", function(event) {
    selectDates.value = zoneMap.dates[0];
    selectDates2.value = zoneMap.dates[zoneMap.dates.length - 1];
});

cancelChartTime.addEventListener("click", function(event) {
    document.getElementById('chartTime').style.display = "none";
    timeCharts.checked = false;
});

setChartTime.addEventListener("click", function(event) {
    charts.destroy();
    var aux = zoneMap.dates.indexOf(selectDates.value);
    var aux2 = zoneMap.dates.indexOf(selectDates2.value);
    charts.updateDates(zoneMap.dates.slice(aux, aux2));
    charts.setTimeInterval(selectDates2.value, selectDates.value);

    if (regressionCharts.checked) {
        var numCharts = charts.getNumCharts();
        if (numCharts == 1) {
            charts.changeRegression(timeSeriesChartsOld[0].slice(aux,aux2), 4, 'Regression 1', 0, 1);
        } else if (numCharts == 2) {
            charts.changeRegression(timeSeriesChartsOld[0].slice(aux,aux2), 4, 'Regression 1', 0, 2);
            charts.changeRegression(timeSeriesChartsOld[1].slice(aux,aux2), 4, 'Regression 2', 1, 3);
        } else if (numCharts == 3) {
            charts.changeRegression(timeSeriesChartsOld[0].slice(aux,aux2), 4, 'Regression 1', 0, 3);
            charts.changeRegression(timeSeriesChartsOld[1].slice(aux,aux2), 4, 'Regression 2', 1, 4);
            charts.changeRegression(timeSeriesChartsOld[2].slice(aux,aux2), 4, 'Regression 3', 2, 5);
        }
    }

    charts.refreshChart();
});

resetCharts.addEventListener("click", function(event) {
    charts.destroy();
    charts.reset();
    charts.refreshChart();
    regressionCharts.checked = false;
    buttonLine0.checked = true;
    buttonLine1.checked = true;
    buttonLine2.checked = true;
    buttonLine0.disabled = false;
    buttonLine1.disabled = false;
    buttonLine2.disabled = false;
    document.getElementById('divButtonLine0').style.display = "none";
    document.getElementById('divButtonLine1').style.display = "none";
    document.getElementById('divButtonLine2').style.display = "none";
    selectedPoint = [];
    var max = (velocityMax.value / 1000).toFixed(3);
    var min = (velocityMin.value / 1000).toFixed(3);
    mexMap.refreshPoints(zoneMap, max, min, style, selectedPoint);
});

timeCharts.addEventListener("click", function(event) {
    if (timeCharts.checked) {
        selectDates.value = charts.dates[0];
        selectDates2.value = charts.dates[charts.dates.length - 1];
        document.getElementById('chartTime').style.display = "block";
    } else {
        document.getElementById('chartTime').style.display = "none";
    }
});

regressionCharts.addEventListener("click", function(event) {

    if (regressionCharts.checked) {

        document.getElementById('divButtonLine0').style.display = "none";
        document.getElementById('divButtonLine1').style.display = "none";
        document.getElementById('divButtonLine2').style.display = "none";

        var numCharts = charts.getNumCharts();

        if (numCharts == 1)
            buttonLine0.checked = false;
        else if (numCharts == 2) {
            buttonLine0.checked = false;
            buttonLine1.checked = false;
        } else if (numCharts == 3) {
            buttonLine0.checked = false;
            buttonLine1.checked = false;
            buttonLine2.checked = false;
        }

        var timeSeries = charts['datasets'];
        var timeSeriesData = [];
        for (var i = 0; i < timeSeries.length; i++) {
            var data = [];
            timeSeries[i]["data"].forEach((element) =>
                data.push(parseFloat(element / 1000))
            );
            timeSeriesChartsOld.push(data)
        }

        charts.destroy();
        charts.updateDates(charts.dates);

        if (!buttonLine0.checked) {
            charts.addRegression(timeSeriesChartsOld[0], 4, 'Regression 1', 0);
        }

        if (!buttonLine1.checked) {
            charts.addRegression(timeSeriesChartsOld[1], 4, 'Regression 2', 1);
        }

        if (!buttonLine2.checked) {
            charts.addRegression(timeSeriesChartsOld[2], 4, 'Regression 3', 2);
        }

        charts.refreshChart()


    } else {

        charts.datasets = [];
        charts.numCharts = 0;

        charts.destroy();
        charts.updateDates(charts.dates);

        if (!buttonLine0.checked) {
            charts.addLine(timeSeriesChartsOld[0], 'Series 1');
            document.getElementById('divButtonLine0').style.display = "flex";
            buttonLine0.checked = true;
        }

        if (!buttonLine1.checked) {
            charts.addLine(timeSeriesChartsOld[1], 'Series 2');
            document.getElementById('divButtonLine1').style.display = "flex";
            buttonLine1.checked = true;
        }

        if (!buttonLine2.checked) {
            charts.addLine(timeSeriesChartsOld[2], 'Series 3');
            document.getElementById('divButtonLine2').style.display = "flex";
            buttonLine2.checked = true;
        }

        charts.refreshChart()
        timeSeriesChartsOld = [];
    }

});

closeCharts.addEventListener("click", function(event) {
    charts.destroy();
    charts.reset();
    charts.refreshChart()
    regressionCharts.checked = false;
    timeCharts.checked = false;
    buttonLine0.checked = true;
    buttonLine1.checked = true;
    buttonLine2.checked = true;
    buttonLine0.disabled = false;
    buttonLine1.disabled = false;
    buttonLine2.disabled = false;
    document.getElementById('divButtonLine0').style.display = "none";
    document.getElementById('divButtonLine1').style.display = "none";
    document.getElementById('divButtonLine2').style.display = "none";
    document.getElementById('chartPoints').style.display = "none";
    document.getElementById('chartTime').style.display = "none";
    selectedPoint = [];
    var max = (velocityMax.value / 1000).toFixed(3);
    var min = (velocityMin.value / 1000).toFixed(3);
    mexMap.refreshPoints(zoneMap, max, min, style, selectedPoint);
});

about.addEventListener("click", function(event) {
    window.location='./index.html';
});

manual.addEventListener("click", function(event) {
    window.location='./styled/index.html';
});

reset.addEventListener("click", function(event) {
    document.location.reload(true);
});

dragElement(document.getElementById("chartPoints"));
