/**
 * Created by André Timermann on 27/05/16.
 *
 *
 */
'use strict';

// TODO: Filtros são usados por inumeros locais em todo o projeto, no cliente: datagrid, form, telas, no servidor: modelo (Antes de salvar na base), UNIFICAR todos os filtros em um só lugar, talvez chamando de sindri-filter, penasr em como, por enquanto estou deixando separado

// TODO: Usar VAnilla Mask http://bankfacil.github.io/vanilla-masker/

// Require `PhoneNumberFormat`.
const PNF = require('google-libphonenumber').PhoneNumberFormat;
// Get an instance of `PhoneNumberUtil`.
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();


module.exports = angular.module("sindriFilters", [])


/**
 * Rêferencia: http://seegno.github.io/google-libphonenumber/
 *
 * Documentação do Google:
 * https://github.com/googlei18n/libphonenumber
 *
 */
    .filter("googleLibPhoneNumber", function () {


        return function (input, optional1, optional2) {


            if (input) {
                // // Parse number with country code.
                // var phoneNumber = phoneUtil.parse(input, 'BR');
                //
                // // Print number in the international format.
                // return phoneUtil.format(phoneNumber, PNF.NATIONAL);
                // // => +1 202-456-1414

                // ^(\(11\) [9][0-9]{4}-[0-9]{4})|(\(1[2-9]\) [5-9][0-9]{3}-[0-9]{4})|(\([2-9][1-9]\) [5-9][0-9]{3}-[0-9]{4})$


                return mtel(input);


            } else {
                return input;
            }


        }


    })

    .name;

function mtel(v) {
    v = v.replace(/\D/g, "");             //Remove tudo o que não é dígito
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2"); //Coloca parênteses em volta dos dois primeiros dígitos
    return v.replace(/(\d)(\d{4})$/, "$1-$2");    //Coloca hífen entre o quarto e o quinto dígitos

}