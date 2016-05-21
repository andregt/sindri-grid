/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';

const angular = require('angular');

require('./node_modules/angular-ui-grid/ui-grid');
require('./node_modules/angular-ui-grid/ui-grid.css');

module.exports = angular.module("sindriGrid", ["ui.grid", "ui.grid.autoResize"])

    // CONFIGURAÇÃO DA DIRETIVA
    .directive('sindriGrid', require('./lib/directive'))

    .name;
