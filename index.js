/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';

const angular = require('angular');

require('./node_modules/angular-ui-grid/ui-grid');

//require('./node_modules/angular-ui-grid/ui-grid.css');
require('./css/customGrid.css');

require('./lib/filter');

module.exports = angular.module("sindriGrid", ["ui.grid", "ui.grid.autoResize",  "ui.grid.resizeColumns", "ui.grid.selection", "sindriFilters"])

    // CONFIGURAÇÃO DA DIRETIVA
    .directive('sindriGrid', require('./lib/directive'))

    .name;
