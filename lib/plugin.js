/**
 * **Created on 14/06/16**
 *
 * sindri-grid/lib/plugin.js
 * @author André Timermann <andre@andregustvo.org>
 * @module SindriGrid/GridPlugins
 */
'use strict';

/**
 * Classe Base para Criação de Plugins no Grid
 *
 * **Atenção:** O nome da classe será o nome acessado no template convertido para tudo minusculo, não será usado o nome do arquivo
 *
 * @abstract
 */
class Plugin {


    /**
     *
     * @param {string} fieldName
     * @param {object} info
     * @param {object} grid
     */
    constructor(fieldName, info, grid) {

        this.fieldName = fieldName;
        this.info = info;
        this.grid = grid;
        this.config = info.grid;


    }


    /**
     * Retorna Objeto de Configuração da Coluna que será enviado para o uiGrid
     *
     *
     */
    getGrid() {

        throw new Error("Não implementado");

    }


    /**
     * Gera Label para a Coluna
     *
     * @returns {String}
     */
    createLabel(fieldName, fieldInfo) {

        let self = this;

        if (fieldInfo.label !== undefined) {
            return fieldInfo.label;

        } else {
            return _.upperFirst(fieldName);
        }

    }

    /**
     * Aqui definimos atributos da COLUNA que serão acessiveis pelo Template CellTemplate
     * Podemos acessar os valores aqui definidos da seguinte forma:
     *      grid.appScope.sindriGridCtrl.column[col.field].nullText
     *
     * @returns {object}
     */
    getColumnTemplateData() {

        let self = this;

        return {};

    }

    /**
     * Retorna Atributos e Funções (normalmente funções) do plugin para ser acesso pelo template
     *  grid.appScope.sindriGridCtrl.plugins.text.parseResult(grid.getValue(col, row))
     *
     *  Semelhante com a função getColumntTemplateData porém com a seguinte diferença:
     *      - getColumnTemplateData() são atributos e metodos da COLUNA (ex: coluna status)
     *
     *      - getTemplateObject() são atributos e métodos do PLUGIN (ex: plugin text)
     *
     *  As duas podem ser acessadas pelo mesmo template:
     *      grid.appScope.sindriGridCtrl.column[col.field] onde col.field é o nome da coluna (ex: status)
     *  e
     *      grid.appScope.sindriGridCtrl.plugins.text onde text é o nome do plugin
     *
     *  É possível utilizar qualquer uma das metodologias para criar a mesma tarefa, porém pode ser mais trabalhoso utilizar um ou outro método
     *  por isso, está disponivel os dois caminhos.
     *
     *  Plugin você precisa-rá passar mais atributos pelo template, porém ocupa menos memoria no caso de muitas colunas
     *
     * @param grid
     * @returns {object}
     */
    static getTemplateObject(grid) {

        let self = this;

        return {};

    }

}


module.exports = Plugin;