/**
 * @version       1.5

 * @author        Rodrigo German Lopez <rodris-96@live.com.mx>

 * @copyright     RodrigoGermanLopez

 * @license       This script is developed by FI UNAM.

 * @see           https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
 */
class Map extends ol.Map {

    /**
     * @constructor
     */
    constructor(id_map, center, layer) {
        super({
            target: id_map,
            layers: [layer],
            maxZoom: 16,
            minZoom: 5.5,
            view: new ol.View({
                zoom: 5.5,
                projection: 'EPSG:4326',
                center: center
            })
        });

        /**
         * Attribute to stock the type the map.
         * @type {ol.layer.Tile}
         */
        this.layer = layer

        /**
         * Attribute to stock the events of map.
         * @type {ol.interaction.Select}
         */
        this.selectClick = new ol.interaction.Select({
            condition: ol.events.condition.singleClick
        });


        /**
         * Attribute to stock the events of map.
         * @type {ol.interaction.Select}
         */
        this.selectPointerMove = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove
        });

        /**
         * Attribute to stock the vector data of map.
         * @type {ol.source.Vector}
         */
        this.vectorSource = new ol.source.Vector({
            source: new ol.source.Vector()
        });

        /**
         * Attribute to stock the vector layer data of map.
         * @type {ol.source.Vector}
         */
        this.vectorLayer = new ol.layer.Vector({
            source: this.vectorSource
        });
-0.09843
        this.addInteraction(this.selectClick);
        this.addInteraction(this.selectPointerMove);
        this.addLayer(this.vectorLayer);
    }

    /**
     * Function to set zoom in map.
     * @param {double} Zoom
     */
    setZoom(zoom) {
        this.getView().setZoom(zoom);
    }

    /**
     * Function to set type of map.
     * @param {ol.source.XYZ} source
     */
    setTypeMap(source) {
        this.layer.setSource(source);
    }

    /**
     * Function that places the center of the map into the coordinates entered.
     * @param {list} Center -> Is a list of the form [x, y], where 'x' and 'y' are coordinates.
     */
    setCenter(center) {
        this.getView().setCenter(center);
    }

    /**
     * Function that clear the selected zone of the events of selecting.
     */
    refreshTiles() {
        this.selectClick.getFeatures().clear();
    }

    /**
     * Function that refresh the points in the map.
     * @param {Zone} zoneMap  -> Represents the zone to visualize.
     * @param {double} maxVelocity -> Represents velocity maximum of set of points.
     * @param {double} minVelocity -> Represents velocity minimum of set of points.
     * @param {StylePoint} style -> Represents the style of points to visualize.
     */
    refreshPoints(zoneMap, maxVelocity, minVelocity, style, selectedPoint) {
        var limitMap = this.getView().calculateExtent(this.getSize());
        var zoom = this.getView().getZoom();
        var dataMap = zoneMap.data;
        var scale = zoneMap.getScaleZone();
        var features = [];
        var point, coordinates, potreeMap, colorPoint, typePoint;

        if (zoom <= 10)
            potreeMap = scale[0];
        else if (zoom <= 11)
            potreeMap = scale[1];
        else if (zoom <= 12)
            potreeMap = scale[2];
        else if (zoom <= 13)
            potreeMap = scale[3];
        else if (zoom <= 14)
            potreeMap = scale[4];
        else if (zoom <= 15)
            potreeMap = 5;
        else if (zoom > 15)
            potreeMap = 1;
        else
            potreeMap = scale[0];

        for (var j = 0; j < dataMap.length; j++) {
            for (var i = 0; i < (dataMap[j]['features'].length - 1) / potreeMap; i++) {
                coordinates = dataMap[j]['features'][i * potreeMap]['geometry']['coordinates'];
                if ((coordinates[0] >= limitMap[0] && coordinates[0] <= limitMap[2])) {
                    if ((coordinates[1] >= limitMap[1] && coordinates[1] <= limitMap[3])) {
                        typePoint = this.selectPoint(selectedPoint, coordinates)
                        point = new ol.Feature(new ol.geom.Point(coordinates));
                        colorPoint = style.getColorPoint(dataMap[j]['features'][i * potreeMap]['properties']['m'], minVelocity, maxVelocity);
                        point.setProperties({
                            'm': dataMap[j]['features'][i * potreeMap]['properties']['m'],
                            'p': dataMap[j]['features'][i * potreeMap]['properties']['p'],
                            'd': dataMap[j]['features'][i * potreeMap]['properties']['d'],
                            'colorPoint': colorPoint,
                            'starPoint': typePoint,
                            'name': 'Point'
                        });
                        features.push(point);
                    }
                }
            }
        }

        this.vectorSource.clear(true);
        this.vectorSource.addFeatures(features);
    }


    selectPoint(points, point) {
        var types = ['x1', 'x2', 'x3'];
        for (var i = 0; i < points.length; i++) {
            if ((points[i][0] == point[0]) && (points[i][1] == point[1])) {
                return types[i];
            }
        }
        return null;
    }

    /**
     * Function that clear the zones contained in the map.
     */
    removeTiles() {
        var listZones = this.getLayers()['array_'][2].getSource().getFeatures();
        for (var x = 0; x < listZones.length; x++) {
            this.getLayers()['array_'][2].getSource().removeFeature(listZones[x])
        }
    }

    /**
     * Function that reset values.
     */
    resetAll() {
        this.removeTiles();
        this.refreshTiles();
        this.vectorSource.clear(true);
        this.updateSize();
    }
}
