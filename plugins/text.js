/**
 * **Created on 14/06/16**
 *
 * sindri-grid/plugins/customText.js
 * @author André Timermann <andre@andregustvo.org>
 *
 */
'use strict';


const Plugin = require('../lib/plugin');
const _ = require('lodash');
const CellTemplate = require('../templates/plugins/text/cellTemplate.html');

/**
 * Plugin Padrão que exibe texto na coluna
 *
 * Rêfererencia para configuração de Template: https://github.com/angular-ui/ui-grid/wiki/Templating
 *
 */
class Text extends Plugin {


    getGrid() {

        let self = this;


        /////////////////////////////////////////////////////
        // Atributo do Grid
        /////////////////////////////////////////////////////
        return _.defaults(self.config.gridOptions || {}, {
            field: self.fieldName,
            displayName: self.createLabel(self.fieldName, self.info),
            cellTemplate: CellTemplate
        });

    }

    getColumnTemplateData() {

        let self = this;

        /////////////////////////////////////////////////////
        // Configura Valor Para esta Coluna
        // Será enviado para acesso no Template
        // Pode ser acessado no template da seguinte forma:
        //      grid.appScope.sindriGridCtrl.column[col.field].nullText
        /////////////////////////////////////////////////////
        return {
            nullText: self.config.nullText,

            getText: function (grid, row, col) {

                if (self.config.customValue) {

                    // Para função deve ser configurado no cliente
                    if (_.isFunction(self.config.customValue)) {

                        return self.config.customValue(grid, row, col);

                    } else {

                        // TODO: ANalisar se pode ser uma brecha de segurança
                        // Converte uma string simples nem Template String
                        return eval('`' + self.config.customValue.replace(/`/g, '\\`') + '`');

                    }

                } else {

                    return grid.getCellDisplayValue(row, col);

                }

            }
        };

    }

}


module.exports = Text;