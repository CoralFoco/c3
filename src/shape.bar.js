import CLASS from './class';
import { ChartInternal } from './core';
import { isValue } from './util';

ChartInternal.prototype.initBar = function () {
    var $$ = this;
    $$.main.select('.' + CLASS.chart).append("g")
        .attr("class", CLASS.chartBars);
};
ChartInternal.prototype.updateTargetsForBar = function (targets) {
    var $$ = this, config = $$.config,
        mainBars, mainBarEnter,
        classChartBar = $$.classChartBar.bind($$),
        classBars = $$.classBars.bind($$),
        classFocus = $$.classFocus.bind($$);
    mainBars = $$.main.select('.' + CLASS.chartBars).selectAll('.' + CLASS.chartBar)
        .data(targets)
        .attr('class', function (d) { return classChartBar(d) + classFocus(d); });
    mainBarEnter = mainBars.enter().append('g')
        .attr('class', classChartBar)
        .style("pointer-events", "none");
    // Bars for each data
    mainBarEnter.append('g')
        .attr("class", classBars)
        .style("cursor", function (d) { return config.data_selection_isselectable(d) ? "pointer" : null; });

};
ChartInternal.prototype.updateBar = function (durationForExit) {
    var $$ = this,
        barData = $$.barData.bind($$),
        classBar = $$.classBar.bind($$),
        initialOpacity = $$.initialOpacity.bind($$),
        color = function (d) { return $$.color(d.id); };
    var mainBar = $$.main.selectAll('.' + CLASS.bars).selectAll('.' + CLASS.bar)
        .data(barData);
    var mainBarEnter = mainBar.enter().append('path')
        .attr("class", classBar)
        .style("stroke", color)
        .style("fill", color);
    $$.mainBar = mainBarEnter.merge(mainBar)
        .style("opacity", initialOpacity);
    mainBar.exit().transition().duration(durationForExit)
        .style("opacity", 0);
};
ChartInternal.prototype.redrawBar = function (drawBar, withTransition, transition) {
    return [
        (withTransition ? this.mainBar.transition(transition) : this.mainBar)
            .attr('d', drawBar)
            .style("stroke", this.color)
            .style("fill", this.color)
            .style("opacity", 1)
    ];
};
ChartInternal.prototype.getBarW = function (axis, barTargetsNum, d) {
    var $$ = this, config = $$.config;
    var ratioWidth = typeof config.bar_width_ratio === 'number' ? config.bar_width_ratio : config.bar_width_ratio(d);
    var ratio = barTargetsNum ? (axis.tickInterval() * ratioWidth) / barTargetsNum : 0;
    var w = typeof config.bar_width === 'number' ? config.bar_width : ratio;
    return config.bar_width_max && w > config.bar_width_max ? config.bar_width_max : w;
};
ChartInternal.prototype.getBars = function (i, id) {
    var $$ = this;
    return (id ? $$.main.selectAll('.' + CLASS.bars + $$.getTargetSelectorSuffix(id)) : $$.main).selectAll('.' + CLASS.bar + (isValue(i) ? '-' + i : ''));
};
ChartInternal.prototype.expandBars = function (i, id, reset) {
    var $$ = this;
    if (reset) { $$.unexpandBars(); }
    $$.getBars(i, id).classed(CLASS.EXPANDED, true);
};
ChartInternal.prototype.unexpandBars = function (i) {
    var $$ = this;
    $$.getBars(i).classed(CLASS.EXPANDED, false);
};
ChartInternal.prototype.generateDrawBar = function (barIndices, isSub) {
    var $$ = this, config = $$.config,
        getPoints = $$.generateGetBarPoints(barIndices, isSub);
    return function (d, i) {
        // 4 points that make a bar
        var points = getPoints(d, i);

        // switch points if axis is rotated, not applicable for sub chart
        var indexX = config.axis_rotated ? 1 : 0;
        var indexY = config.axis_rotated ? 0 : 1;

        var path = 'M ' + points[0][indexX] + ',' + points[0][indexY] + ' ' +
                'L' + points[1][indexX] + ',' + points[1][indexY] + ' ' +
                'L' + points[2][indexX] + ',' + points[2][indexY] + ' ' +
                'L' + points[3][indexX] + ',' + points[3][indexY] + ' ' +
                'z';

        return path;
    };
};
ChartInternal.prototype.generateGetBarPoints = function (barIndices, isSub) {
    var $$ = this,
        overlap = this.config.data_overlap,
        axis = isSub ? $$.subXAxis : $$.xAxis,
        barTargetsNum = barIndices.__max__ + 1,
        barY = $$.getShapeY(!!isSub),
        barOffset = $$.getShapeOffset($$.isBarType, barIndices, !!isSub),
        yScale = isSub ? $$.getSubYScale : $$.getYScale;

    var mapWidth = {};

    return function (d, i) {
        var y0 = yScale.call($$, d.id)(0),
            barW = $$.getBarW(axis, barTargetsNum, d),
            barX = $$.getShapeX(barW, barTargetsNum, barIndices, !!isSub),
            barSpaceOffset = barW * ($$.config.bar_space / 2),
            offset = barOffset(d, i) || y0, // offset is for stacked bar chart
            posX = barX(d), posY = barY(d);

        if (!mapWidth[barIndices[d.id]]) {
            mapWidth[barIndices[d.id]] = [barW];
        } else {
            if (mapWidth[barIndices[d.id]][mapWidth[barIndices[d.id]].length - 1] !== barW) {
                mapWidth[barIndices[d.id]].push(barW);
            }
        }

        // fix posY not to overflow opposite quadrant
        if ($$.config.axis_rotated) {
            if ((0 < d.value && posY < y0) || (d.value < 0 && y0 < posY)) { posY = y0; }
        }
        
        if (overlap && overlap.length > 0 && overlap && overlap.indexOf(barIndices[d.id]) >= 0) {
            offset = y0;
        }

        console.log(mapWidth[barIndices[d.id]]);

        var startOffset = 0;
        var finalOffset = 0;

        if (mapWidth[barIndices[d.id]].length > 1) {
            var offsetX = (mapWidth[barIndices[d.id]][0] - mapWidth[barIndices[d.id]][1]) / 2;
            startOffset -= offsetX;
        }

        // 4 points that make a bar
        var points = [
            [posX + barSpaceOffset + startOffset, offset],
            [posX + barSpaceOffset + startOffset, posY - (y0 - offset)],
            [posX + barW - barSpaceOffset - finalOffset, posY - (y0 - offset)],
            [posX + barW - barSpaceOffset - finalOffset, offset]
        ];

        return points;
    };
};
ChartInternal.prototype.isWithinBar = function (mouse, that) {
    var box = that.getBoundingClientRect(),
        seg0 = that.pathSegList.getItem(0), seg1 = that.pathSegList.getItem(1),
        x = Math.min(seg0.x, seg1.x), y = Math.min(seg0.y, seg1.y),
        w = box.width, h = box.height, offset = 2,
        sx = x - offset, ex = x + w + offset, sy = y + h + offset, ey = y - offset;
    return sx < mouse[0] && mouse[0] < ex && ey < mouse[1] && mouse[1] < sy;
};
