import CLASS from './class';
import { ChartInternal } from './core';
import { isValue } from './util';

ChartInternal.prototype.initRegion = function () {
    var $$ = this;
    $$.region = $$.main.append('g')
        .attr("clip-path", $$.clipPath)
        .attr("class", CLASS.regions);
};
ChartInternal.prototype.updateRegion = function (duration) {
    var $$ = this, config = $$.config;

    // hide if arc type
    $$.region.style('visibility', $$.hasArcType() ? 'hidden' : 'visible');

    var mainRegion = $$.main.select('.' + CLASS.regions).selectAll('.' + CLASS.region)
        .data(config.regions);
    var mainRegionEnter = mainRegion.enter().append('rect')
        .attr("x", $$.regionX.bind($$))
        .attr("y", $$.regionY.bind($$))
        .attr("width", $$.regionWidth.bind($$))
        .attr("height", $$.regionHeight.bind($$))
        .style("fill-opacity", 0);
    $$.mainRegion = mainRegionEnter.merge(mainRegion)
        .attr('class', $$.classRegion.bind($$));
    mainRegion.exit().transition().duration(duration)
        .style("opacity", 0)
        .remove();
};
ChartInternal.prototype.redrawRegion = function (withTransition, transition) {
    var $$ = this, regions = $$.mainRegion;
    return [(withTransition ? regions.transition(transition) : regions)
            .attr("x", $$.regionX.bind($$))
            .attr("y", $$.regionY.bind($$))
            .attr("width", $$.regionWidth.bind($$))
            .attr("height", $$.regionHeight.bind($$))
            .style("fill-opacity", function (d) { return isValue(d.opacity) ? d.opacity : 0.1; })
    ];
};
ChartInternal.prototype.regionX = function (d) {
    var $$ = this, config = $$.config,
        xPos, yScale = d.axis === 'y' ? $$.y : $$.y2,
        xYesterdayPos;
    if (d.axis === 'y' || d.axis === 'y2') {
        xPos = config.axis_rotated ? ('start' in d ? yScale(d.start) : 0) : 0;
    } else {
        var date = $$.parseDate(d.start);

        if (config.axis_rotated) {
            xPos = 0;
        } else {
            xPos = 'start' in d ? $$.x($$.isTimeSeries() ? date : d.start) : 0;

            if (d.type) {
                // Subtract one day
                var yesterday = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
                if (d.type === 'day') {
                    yesterday.setDate(yesterday.getDate() - 1);
                } else if (d.type === 'hour') {
                    yesterday.setHours(yesterday.getHours() - 1);
                }

                xYesterdayPos = 'start' in d ? $$.x($$.isTimeSeries() ? yesterday : d.start) : 0;

                if (xYesterdayPos !== 0) {
                    xPos = xYesterdayPos + (xPos - xYesterdayPos) / 2;
                }
            }
        }
    }

    return xPos;
};
ChartInternal.prototype.regionY = function (d) {
    var $$ = this, config = $$.config,
        yPos, yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        yPos = config.axis_rotated ? 0 : ('end' in d ? yScale(d.end) : 0);
    } else {
        yPos = config.axis_rotated ? ('start' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.start) : d.start) : 0) : 0;
    }
    return yPos;
};
ChartInternal.prototype.regionWidth = function (d) {
    var $$ = this, config = $$.config,
        start = $$.regionX(d), end, yScale = d.axis === 'y' ? $$.y : $$.y2,
        xTomorrowPos;
    if (d.axis === 'y' || d.axis === 'y2') {
        end = config.axis_rotated ? ('end' in d ? yScale(d.end) : $$.width) : $$.width;
    } else {
        var date = $$.parseDate(d.end);

        end = config.axis_rotated ? $$.width : ('end' in d ? $$.x($$.isTimeSeries() ? date : d.end) : $$.width);

        if (d.type) {
            // Add one day
            var tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
            if (d.type === 'day') {
                tomorrow.setDate(tomorrow.getDate() - 1);
            } else if (d.type === 'hour') {
                tomorrow.setHours(tomorrow.getHours() - 1);
            }
            xTomorrowPos = 'end' in d ? $$.x($$.isTimeSeries() ? tomorrow : d.end) : 0;

            if (xTomorrowPos !== 0) {
                end = end + (end - xTomorrowPos) / 2;
            }
        }
    }
    return end < start ? 0 : end - start;
};
ChartInternal.prototype.regionHeight = function (d) {
    var $$ = this, config = $$.config,
        start = this.regionY(d), end, yScale = d.axis === 'y' ? $$.y : $$.y2;
    if (d.axis === 'y' || d.axis === 'y2') {
        end = config.axis_rotated ? $$.height : ('start' in d ? yScale(d.start) : $$.height);
    } else {
        end = config.axis_rotated ? ('end' in d ? $$.x($$.isTimeSeries() ? $$.parseDate(d.end) : d.end) : $$.height) : $$.height;
    }
    return end < start ? 0 : end - start;
};
ChartInternal.prototype.isRegionOnX = function (d) {
    return !d.axis || d.axis === 'x';
};
