import { Chart } from './core';
import { isUndefined } from './util';

Chart.prototype.stepHorizontal = function (stepHorizontal) {
    var $$ = this.internal, config = $$.config;
    if (isUndefined(stepHorizontal)) { return config.data_stepHorizontal; }
    config.data_stepHorizontal = stepHorizontal;
    $$.redraw();
    return config.data_stepHorizontal;
};
