/**
 * parseFromWKTtoArray
 * @param {string} wkt - string to check
 * @return {[[..number]] / Error}
 */
function parseFromWKTtoArray (wkt) {
    // check string for mathing WKT format
    let result = wkt.match(/\d+\s\d+/g);
    // if it match - keep going
    if (result && result.length) {
        // at this step we have array of items like ['20 10']
        for (let i = 0; i < result.length; i ++) {
            // split item into 2 coordinates
            result[i] = result[i].split(' ');
            // explicit coercion to Number for each coordinate
            result[i][0] = Number(result[i][0]);
            result[i][1] = Number(result[i][1]);
        }

        // in case of POINT - return direct coordinates [x, y];
        if (result.length === 1) {
            return result[0];
        }

        return result;
    }
    // throw error if it doesnt match
    throw new Error(`Accepted string "${wkt}" has wrong format`);
}

/**
 * findingPointInsidePolygon
 * @see https://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 * @param {[..number]} - point coodinates
 * @param {[[..number]]} - polygon coordinates
 * @return {boolean} - result of search
 */
function findPointInsidePolygon(point, polygon) {
    let x = point[0];
    let y = point[1];
    // result (counter)
    // since we need to determine if it has to be even or odd number
    // we can use it as boolean flag
    let result = false;

    // the idea is to run ray from point horizontally (raise X, fix Y)
    // and check every edge of polygon for crossing it (once)
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        // coordinates x,y for edge's starting point
        let xi = polygon[i][0]
        let yi = polygon[i][1];
        // coordinates x,y for edge's ending point
        let xj = polygon[j][0]
        let yj = polygon[j][1];

        // ray will cross edge if his Y coordinate is within edge's Y coordinates:
        // Y
        //
        //                    \ y1
        // y - point ----> ray \ edge
        //                      \ y2
        // ----------------------------> X
        //
        let checkA = ((yi > y) != (yj > y));
        // Is the point in the half-plane to the left of the extended edge ?
        let checkB = (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        // if value of crosses is even number - point is outside of polygon
        //  is its odd number- its inside
        if (checkA && checkB) {
            result = !result;
        }
    }

    return result;
}

/**
 * polygonHasPointInside
 * check string for proper WKT format
 * and determine point's position
 * otherway throw error
 * @param {string} - point in WKT format
 * @param {string} - polygon in WKT format
 * @return {boolean / error}
 */
function polygonHasPointInside (point, polygon) {
    try {
        point = parseFromWKTtoArray(point);
        polygon = parseFromWKTtoArray(polygon);

        return findPointInsidePolygon(point, polygon);
    } catch (error) {
        return error;
    }
}

module.exports = polygonHasPointInside;
