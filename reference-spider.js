d3.csv('data/generic_foods.csv', function (err, csv) {

    let allFoods = csv.map(function (entry) {
        return {
            starch: entry.starch,
            sugars: entry.sugars,
            fibres: entry['dietary fibres'],
            fat: entry["fat, total"],
            protein: entry.protein,
            water: entry.water,
        };
    });

    var axesNames = d3.keys(allFoods[0]);
    var dTheta = 2 * Math.PI / axesNames.length;
    var axesAngles = axesNames.map((key, idx) => idx * dTheta);

    let margin = { top: 30, right: 30, bottom: 30, left: 30 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var R = d3.min([width, height]) / 2;
    var r = 30;
    var center = [width / 2, height / 2];
    var radialScaleMax = 100; // Make 100g the max for the radial scales.
    // var radialScaleMax = d3.max(foods, function(food) { return food[axis]; });

    let coordSystem = svg.append("g")
        .attr('class', "coord-system")
        .attr("transform", "translate(" + center[0] + "," + center[1] + ")");

    let nrOfGuidingLines = 6;
    let guidingLines = createGuidingLines(axesAngles, nrOfGuidingLines, [r, R]);
    guidingLines.forEach(function (guidingLine, idx) {
        coordSystem.append('g')
            .append('path')
            .attr('class', 'guiding-line')
            .attr('d', guidingLine);
    });

    var radialScale = d3.scaleLinear()
        .domain([0, radialScaleMax])
        .range([r, R]);

    var axes = createAxes(axesNames, radialScale);
    var adaptedAxesAngles = adaptAxesAnglesToSvg(axesAngles);
    axes.forEach(function (axis, idx) {
        var axisSelection = coordSystem.append('g')
            .attr('class', 'axis')
            .attr('transform', 'rotate(' + adaptedAxesAngles[idx] + ')')
            .call(axis);

        // Set attributes for the tick lables only
        axisSelection.selectAll("text")
            .attr("transform", "rotate(180)")
            .attr('class', 'tick-label');

        axisSelection.append('text')
            .attr('class', 'axis-text')
            .attr('y', R + 15)
            .attr('transform', 'rotate(' + -adaptedAxesAngles[idx] + ',0,' + (R + 15) + ')')
            .attr('text-anchor', getTextAnchor(adaptedAxesAngles[idx]))
            .text(axesNames[idx]);
    });

    function getTextAnchor(axisAngle) {
        let eps = 1;
        if (180 - eps < axisAngle && axisAngle < 180 + eps ||
            0 - eps < axisAngle && axisAngle < 0 + eps) {
            return 'middle';
        }
        if (axisAngle < 180) {
            return 'end';
        } else {
            return 'start';
        }
    }

    function adaptAxesAnglesToSvg(axesAngles) {
        return axesAngles.map(function (axisAngle) {
            return svgHasADifferentZeroAngle(axisAngle * 180 / Math.PI);
        });
    }

    function svgHasADifferentZeroAngle(angle) {
        if (angle >= 180) {
            return angle - 180;
        } else {
            return angle + 180;
        }
    }

    function createGuidingLines(axesAngles, nrOfGuidingLines, minMaxRadius) {
        function zip(radius) {
            return axesAngles.map(axisAngle => [axisAngle, radius]);
        }
        var radialIncrement = (minMaxRadius[1] - minMaxRadius[0]) / (nrOfGuidingLines - 1);
        var zipped = [];
        for (var i = 0; i < nrOfGuidingLines; i++) {
            let radius = minMaxRadius[0] + i * radialIncrement;
            zipped[i] = zip(radius);
            // Add the first element to the back of the line in order to close it.
            zipped[i].push(zipped[i][0]);
        }
        var radialLine = d3.radialLine()
            .angle(function (d) { return d[0]; })
            .radius(function (d) { return d[1]; });
        return zipped.map(line => radialLine(line));
    }

    function createAxes(axesNames, radialScale) {
        return axesNames.map(function (axis, idx) {
            if (idx === 0) {
                return d3.axisLeft(radialScale)
                    .ticks(5)
                    .tickSize(0);
            } else {
                return d3.axisLeft(radialScale)
                    .ticks(0)
                    .tickSize(0);
            }
        });
    }
});