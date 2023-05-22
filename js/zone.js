/**
 * @version       1.5

 * @author        Rodrigo German Lopez <rodris-96@live.com.mx>

 * @copyright     RodrigoGermanLopez

 * @license       This script is developed by FI UNAM.
 */

class Zone {

    /**
     * @constructor
     */
    constructor(dates, numJson) {
        /**
         * Attribute to stock the dates of the zone.
         * @type {list}
         */
        this.dates = dates;
        /**
         * Attribute to stock the number of files json of the zone.
         * @type {Int}
         */
        this.numJson = numJson;
        /**
         * Attribute to stock the velocity minimum of the zone.
         * @type {double}
         */
        this.velocityMin = 0;
        /**
         * Attribute to stock the velocity maximum of the zone.
         * @type {double}
         */
        this.velocityMax = 0;
        /**
         * Attribute to stock the data of the zone.
         * @type {list}
         */
        this.data = [];


        this.scale = [];
    }

    /**
     * Function to stock the dates of the zone.
     * @param {list} dates
     */
    setDates(dates) {
        this.dates = dates;
    }

    /**
     * Function to stock the number of files json of the zone.
     * @param {Int} numJson
     */
    setNumJson(numJson) {
        this.numJson = numJson;
    }

    /**
     * Function to stock the velocity minimum and maximum of the zone.
     * @param {double} min
     * @param {double} max
     */
    setValuesM(min, max) {
        this.velocityMin = min;
        this.velocityMax = max;
    }

    /**
     * Function to stock the data of the zone.
     * @param {list} data
     */
    addData(data) {
        this.data.push(data);
    }


    calculateScaleZone() {
        var scale = [80, 40, 20, 10, 5, 1, 1]
        var numPoints = []
        var aux = zoneMap.data.length * 20000
        var numFile = zoneMap.data.length;
        var points = [400, 600, 900, 1200, 3000, 35000, aux]

        for (var x = 0; x < 5; x++) {
            numPoints.push(Math.ceil(aux/(scale[x]*numFile)))
        }

        for (var x = 0; x < 5; x++) {
            this.scale.push(Math.ceil(aux/(numPoints[x])))
        }
    }

    getScaleZone() {
        return this.scale
    }


    /**
     * Function that reset values of the zone.
     */
    resetAll() {
        this.data = []
        this.dates = []
        this.velocityMin = 0;
        this.velocityMax = 0;
        this.numJson = 0;
    }
}
