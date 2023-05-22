/**
 * @version       1.5

 * @author        Rodrigo German Lopez <rodris-96@live.com.mx>

 * @copyright     RodrigoGermanLopez

 * @license       This script is developed by FI UNAM.
 */

class StylePoint {

    /**
     * @constructor
     */
    constructor(max, min) {
        /**
         * Attribute to stock the velocity minimum of the zone.
         * @type {double}
         */
        this.velocityMin = min;
        /**
         * Attribute to stock the velocity maximum of the zone.
         * @type {double}
         */
        this.velocityMax = max;
    }

    /**
     * Function that calculate the color of the point depending of its velocity.
     * @param {double} m -> Represents velocity of the point.
     * @param {double} min -> Represents velocity minimum and maximum of the zone.
     * @param {double} max -> Represents velocity maximum and maximum of the zone.
     * @return {String} color
     */
    getColorPoint(m, min, max) {
        var r = 0,
            g = 0,
            b = 0;
        var perc = m;
        var base = Math.abs(max - min);

        if (base == 0) {
            perc = 100;
        } else {
            perc = ((perc - min) / base) * 100;
        }

        if (perc < 25) {
            b = 255;
            g = Math.round(10.2 * perc);
            r = 0;
        } else if (perc >= 25 && perc < 50) {
            b = Math.round(510 - 10.2 * perc);
            g = 255;
            r = 0;
        } else if (perc >= 50 && perc < 75) {
            r = Math.round(-510 + 10.2 * perc);
            g = 255;
            b = 0;
        } else if (perc >= 75 && perc <= 100) {
            g = Math.round(1020 - 10.2 * perc);
            r = 255;
            b = 0;
        } else {
            g = 0;
            r = 255;
            b = 0;
        }
        var color = "rgba(" + r + "," + g + "," + b + ",1)";
        return color;
    }

    /**
     * Function that calculate the color of the point depending of its velocity.
     * @param {ol.Feature} m -> Represents the point in the map.
     * @return {ol.style.Style} style
     */
    getStyle(feature) {
        var color = feature['values_']['colorPoint'];
        var star = feature['values_']['starPoint'];
        var color2 = "";

        if (star == null) {
            var style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5.5,
                    fill: new ol.style.Fill({
                        color: color
                    })
                })
            });
        } else {

            if (star == 'x1') {
                color2 = 'black'
            } else if (star == 'x2') {
                color2 = 'rgba(255, 24, 0, 1.0)'
            } else if (star == 'x3') {
                color2 = 'rgba(1, 34, 210, 1.0)'
            }

            var style = new ol.style.Style({
                image: new ol.style.RegularShape({
                    fill: new ol.style.Fill({
                        color: color2
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'white',
                        width: 2
                    }),
                    points: 4,
                    radius: 13,
                    angle: Math.PI / 4
                }),
                zIndex: Infinity
            });
        }
        return style;
    }

    /**
     * Function that reset values of the zone.
     */
    resetAll() {
        this.velocityMin = 0;
        this.velocityMax = 0;
    }
}
