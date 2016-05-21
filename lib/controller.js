/**
 * Created by André Timermann on 28/04/16.
 *
 * sindri-grid/lib/controller.js
 *
 */
'use strict';

const _ = require('lodash');
const AngularDirectiveController = require('sindri-client/angularDirectiveController');

class Controller extends AngularDirectiveController {

    constructor($scope, uiGridConstants, $timeout, $http) {


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Setup
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        super($scope, $http);

        let self = this;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Configuração inicial
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Carrega Grid automaticamente (padrão = true)
        if (self.options.autoLoad === undefined) {
            self.options.autoLoad = true
        }

        // Configurações do ui-grid
        self.gridOptions = {
            // enableMinHeightCheck: false,
            minRowsToShow: 20,
            enableColumnMenus: false,
            enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
            //enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER.
            onRegisterApi: function (gridApi) {

                // Definimos um acesso à api do ui-grid
                self.gridApi = gridApi;
            }
        };


        // Interface Externa para Carregar grid manualmente
        self.options.loadGrid = function () {
            self.loadGrid();
        };

        // Carrega Grid automaticamente
        if (self.options.autoLoad) {
            self.loadGrid();
        }


    }

    /**
     * Carrega Grid
     */
    loadGrid() {

        let self = this;


        if (!self.options.schema && !self.options.api) {
            throw new Error("schema or api must be defined in sindri-grid")
        }


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Carrega Schema
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        Promise.resolve()

            /////////////////////////////////////////
            // 1) Requisita Schema
            /////////////////////////////////////////
            .then(function () {

                if (self.options.schema) {
                    return self.options.schema;
                } else {
                    return self.loadSchema(self.options.api);
                }

            })
            /////////////////////////////////////////
            // 2) Define Schema e Requisita Dados
            /////////////////////////////////////////
            .then(function (response) {

                // console.log('schema carregado:');
                // console.log(response.data)

                return self.getData(self.options.api);


            })
            /////////////////////////////////////////
            // 3) Carrega Dados
            /////////////////////////////////////////
            .then(function (response) {

                let rows = response.data;

                self.gridOptions.data = rows;

                // Atualiza tabela (deveria ser automatico)
                self.gridApi.grid.refresh();



                _.each(rows, function (row) {

                });


            });


    }

    /**
     * Carrega Dados para Povoar a Tabela
     *
     * @param url
     */
    getData(url) {


        return this
            .http({
                method: 'GET',
                url: url
            })
            .then(function successCallback(response) {

                // TODO: Usar datasync (rever pq só funciona no servidor)
                if (response.data.error == false) {

                    return response.data;

                } else {

                    return new Error(response.data.msg)

                }


            })


    }

}


module.exports = Controller;