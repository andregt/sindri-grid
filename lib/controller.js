/**
 * Created by André Timermann on 28/04/16.
 *
 * sindri-grid/lib/controller.js
 *
 * TODO: Testar self.options.columns para carregar colunas pelo cliente com suporte a plugin (ainda não disponível)
 *
 */
'use strict';

const _ = require('lodash');
const AngularDirectiveController = require('sindri-client/angularDirectiveController');

const rowTemplate = require('../templates/row.html');


/**
 * Carrega Plugins
 * Deve ficar separado da classe, pois é uma construção do WebPack, ou seja, executado em tempo de compilação
 *
 * @param requireContext
 * @returns {Array.FieldType}
 */
function requireAll(requireContext) {
    return requireContext.keys().map(requireContext);
}
/**
 * Lista de FieldType carregados através de RequireAll
 *
 * @type {Array.FieldType}
 */
let plugins = requireAll(require.context("../plugins", false, /^\.\/.*\.js$/));

/**
 * Require de Plugin (WebPack, deve ficar fora da classe)
 *
 * @param type
 * @returns {Plugin}
 */
function requirePluginDynamic(type) {
    return require('../plugins/' + type);
}


class Controller extends AngularDirectiveController {

    constructor($scope, uiGridConstants, $timeout, $http) {

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Setup
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        super($scope, $http);

        let self = this;

        self.$uiGridConstants = uiGridConstants;
        self.$timeout = $timeout;

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Configuração padrão
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        self.options = _.defaults(self.options, {

            // URL de comunicação com servidor
            url: undefined,
            // Carrega Grid automaticamente (padrão = true)
            autoload: true,

            // API de comunicação com gridApi
            gridApi: undefined,

            // Schema com configuração dos campos
            schema: {},

            // Colunas personalizadas não relacionada com o schema (colunas extras)
            columns: {},

            // Carrega Schema do servidor
            loadSchemaFromServer: false,

            /**
             * Retorna QUantidade de registros no datagrid
             *
             * @returns {*}
             */
            length: function () {

                return self.gridOptions.data.length;
            },
            /**
             * Interface Externa para Carregar grid manualmente
             *
             */
            loadGrid: function () {
                self.loadGrid();
            },

            reload: function () {
                // TODO: Permitir recarregar unico registro
                self.loadData();
            }

        });


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Configuração inicial
        // Configuração do grid deve ficar no construtor, caso contrario não funciona
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Configurações do ui-grid (deve Ficar no Construtor devido a alguma particularidade do AngularJs)
        self.gridOptions = {
            // enableMinHeightCheck: false,
             minRowsToShow: 20,
            enableColumnMenus: false,
            enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
            enableVerticalScrollbar: 2,

            enableColumnResizing: true,
            enableRowSelection: true,
            enableRowHeaderSelection: false,
            multiSelect: true,
            onRegisterApi: function (gridApi) {

                // Definimos um acesso à api do ui-grid
                // Linka Objeto de Seleção a options.selection para acesso externo
                self.options.gridApi = self.gridApi = gridApi;


            },
            rowTemplate: rowTemplate
        };

        //////////////////////////////////////////////////////
        // Carrega Grid automaticamente
        //////////////////////////////////////////////////////
        if (self.options.autoLoad) {
            self.loadGrid();
        }

        //////////////////////////////////////////////////////
        // API de PLUGINS - Carrega Atributos e Objetos dos
        // plugins para serem acessado no template
        //////////////////////////////////////////////////////

        self.plugins = {};

        _.each(plugins, function (Plugin) {

            let pluginName = _.toLower(Plugin.name);
            self.plugins[pluginName] = Plugin.getTemplateObject(self);

        });

        //////////////////////////////////////////////////////
        // Como não é possível definir um controller para cada
        // coluna necessário criar um objeto que irá armazenar
        // atributos de cada coluna
        //////////////////////////////////////////////////////
        self.column = {};


    }

    /**
     * Carrega Grid
     */
    loadGrid() {

        let self = this;


        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Carrega Schema
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        Promise.resolve()

        /////////////////////////////////////////
        // 1) Requisita Schema
        /////////////////////////////////////////
            .then(function () {

                // Carrega Schema do Servidor
                if (self.options.loadSchemaFromServer) {
                    return self.loadSchema(self.options.url).then(function (response) {

                        return _.defaultsDeep(self.options.schema || {}, response.data);

                    });

                }

                // Carrega Schema enviado por options
                else {

                    return self.options.schema;

                }

            })
            /////////////////////////////////////////
            // 2) Define Schema e Requisita Dados
            /////////////////////////////////////////
            .then(function (schema) {

                self.options.schema = schema;

                self.setupGrid(schema);

                return self.loadData();

            })

    }

    /**
     * Carrega Dados para Povoar a Tabela
     *
     */
    getData() {

        let self = this;

        return self
            .http({
                method: 'GET',
                url: self.options.url
            })
            .then(function successCallback(response) {

                // console.log(response.data);
                //
                // TODO: Usar datasync (rever pq só funciona no servidor)
                if (response.data.error == false) {

                    return response.data;

                } else {

                    return new Error(response.data.msg)

                }


            })


    }

    /**
     * Configura Grid e Colunas
     *
     * @param schema
     */
    setupGrid(schema) {

        let self = this;

        ////////////////////////////////////////////////////////////////////
        // Colunas Carregadas do Schema (Servidor)
        ////////////////////////////////////////////////////////////////////
        self.gridOptions.columnDefs = [];

        _.forIn(schema, function (fieldInfo, fieldName) {

            let newColumn = self.setupColumn(fieldName, fieldInfo);

            if (newColumn) {
                self.gridOptions.columnDefs.push(newColumn)
            }

        });


        ////////////////////////////////////////////////////////////////////
        // Colunas Personalizadas (Cliente)
        ////////////////////////////////////////////////////////////////////
        _.forIn(self.options.columns, function (column) {

            // TODO: Carregar Plugins por aqui tb
            self.gridOptions.columnDefs.push(column);

        });

    }

    /**
     * Configura Coluna
     *
     * @param fieldName
     * @param fieldInfo
     * @returns {{field: *, displayName: *}}
     */
    setupColumn(fieldName, fieldInfo) {

        let self = this;

        fieldInfo.grid = _.defaults(fieldInfo.grid || {}, {
            show: true,
            available: true
        });


        // Só carrega se tiver definido para carregamento
        if (fieldInfo.grid.available && fieldInfo.grid.show && fieldInfo.select) {

            if (!fieldInfo.grid.plugin) {
                fieldInfo.grid.plugin = "text";
            }

            let Plugin = requirePluginDynamic(fieldInfo.grid.plugin);
            let plugin = new Plugin(fieldName, fieldInfo, self);


            //////////////////////////////////////////////////////
            // Carrega dados da Coluna para ser acessado no template
            // Pode ser acessado no template da seguinte forma:
            //      grid.appScope.sindriGridCtrl.column[col.field].nullText
            //////////////////////////////////////////////////////
            self.column[fieldName] = plugin.getColumnTemplateData();

            //////////////////////////////////////////////////////
            // Carrega Configurações da Coluna
            //////////////////////////////////////////////////////
            return plugin.getGrid();

        } else {

            return false;
        }

    }

    /**
     * Carrega dados no DataGrid
     *
     * @returns {Promise}
     */
    loadData() {

        let self = this;

        return self.getData().then(function (response) {

            // Atualiza template no próximo tick
            self.$timeout(function () {

                self.gridOptions.data = response.data;

                // Atualiza tabela (deveria ser automatico)
                self.gridApi.grid.refresh();

            });

        });

    }


}


module.exports = Controller;