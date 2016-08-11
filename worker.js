function pointIsOnSegment(point, segmentPoint1, segmentPoint2) {
    let [pX, pY] = point;
    let sX1;
    let sY1;
    let sX2;
    let sY2;
    // to apply this method we have to be sure that sX1 < sX2
    // so we can check lately
    if (segmentPoint1[0] > segmentPoint2[0]) {
        [sX1, sY1] = segmentPoint2;
        [sX2, sY2] = segmentPoint1;
    } else {
        [sX1, sY1] = segmentPoint1;
        [sX2, sY2] = segmentPoint2;
    }
    // First of all - check if the point is on the Line, described by 2 segment points
    // delta for point ---> segment point 1
    let dx1 = pX - sX1;
    let dy1 = pY - sY1;
    // delta for segment point 1 --> segment point 2
    let dx2 = sX2 - sX1;
    let dy2 = sY2 - sY1;

    let cross = dx1 * dy2 - dy1 * dx2;
    // since we are using floating numbers, we have to use tolerance
    const tolerance = 1e-6;

    // check for point is between segment points
    let isBetweenTwoPoints = pX >= sX1 && pX <= sX2;

    return Math.abs(cross) < tolerance && isBetweenTwoPoints;
}

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
        let xi = polygon[i][0];
        let yi = polygon[i][1];
        // coordinates x,y for edge's ending point
        let xj = polygon[j][0];
        let yj = polygon[j][1];

        // check if point is on the edge
        // function pointIsOnSegment([pX, pY], [segmentPoint1, segmentPoint2]) {
        if (pointIsOnSegment(point, polygon[i], polygon[j])) {
            result = 'edge';
            break;
        }

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

onmessage = function (e) {
    let {action} = e.data;

    switch(action) {
        case 'process':
            let {point, chunk} = e.data;
            let result = findPointInsidePolygon(point, chunk);
            postMessage(result);
            break;
        case 'terminate':
            close();
    }
};
