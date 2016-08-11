/**
 * parseFromWKTtoArray
 * @param {string} wkt - string to check
 * @return {[[..number]] | Error}
 */
function parseFromWKTtoArray (wkt) {
    // check string for mathing WKT format
    let result = wkt.match(/\d+(?:\.\d*)?\s\d+(?:\.\d*)?/g);
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
    let cores = navigator.hardwareConcurrency || 4;
    let polygonLength = polygon.length;
    let chunkLength = Math.round(polygonLength / cores);
    let chunks = [];

    let leftItems = polygonLength - chunkLength * cores;
    for (let i = 0; i < cores; i++) {
        let startIndex = i * chunkLength;
        chunks.push(polygon.slice(startIndex, startIndex + chunkLength));
    }

    if (leftItems > 0) {
        let lastChunk = chunks[cores - 1];
        lastChunk.push.apply(lastChunk, polygon.slice(-leftItems));
    }

    for (let i = 0; i < cores; i++) {
        let what = chunks[i][0];
        let where = (i === 0) ? chunks[cores - 1] : chunks[i - 1];
        where.push(what);
    }

    let result = [];
    let counter = cores;
    let workers = [];

    let match = false;

    return new Promise((resolve, reject) => {
        //@todo add reject;

        for (let i = 0; i < cores; i++) {
            let worker = new Worker('worker.js');

            workers.push(worker);

            worker.postMessage({
                action: 'process',
                chunk: chunks[i],
                point: point
            });

            worker.onmessage = function(event) {
                counter--;

                let chunkResult = event.data;

                if (chunkResult === 'edge')  {
                    for (let i = 0; i < workers.lenth; i++) {
                        worker[i].postMessage({
                            action: 'terminate'
                        });
                    }
                    resolve('edge');
                }

                result.push(chunkResult);

                if (counter === 0) {
                    var value = 0;

                    for (let i = 0; i < cores; i++) {
                        value += result[i];
                    }

                    resolve(value);
                }
            }
        }

    });
}

/**
 * polygonHasPointInside
 * check string for proper WKT format
 * and determine point's position
 * otherway throw error
 * @param {string} - point in WKT format
 * @param {string} - polygon in WKT format
 * @return {boolean | error}
 */
function polygonHasPointInside (point, polygon) {
    try {
        point = parseFromWKTtoArray(point);
        polygon = parseFromWKTtoArray(polygon);

        let promise = findPointInsidePolygon(point, polygon);

        promise
            .then((result) => {
                return result;
            });
        // @add catch error
    } catch (error) {
        return error;
    }
}

module.exports = polygonHasPointInside;
