import { Chart } from './core';
import { isUndefined } from './util';

Chart.prototype.overlap = function (overlap) {
    var $$ = this.internal, config = $$.config;
    if (isUndefined(overlap)) { return config.data_overlap; }
    config.data_overlap = overlap;
    $$.redraw();
    return config.data_overlap;
};
