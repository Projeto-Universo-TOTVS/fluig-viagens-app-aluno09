/**
 * Dataset customizado: ds-viagens-paises-aluno09
 *
 * Lista fixa de paises usada pelo app de viagens.
 *
 * Colunas (nesta ordem):
 *   codigo -> codigo ISO-3166-1 alpha-3
 *   nome   -> nome do pais em portugues
 *   sigla  -> codigo ISO-3166-1 alpha-2
 *
 * Server-side no motor Rhino (base ES5): apenas var/function, sem arrow
 * functions, template literals, let/const ou outros recursos ES6+.
 */

var COLUNAS = ["codigo", "nome", "sigla"];

/**
 * Linhas no formato [codigo ISO-3, nome em portugues, sigla ISO-2].
 */
var PAISES = [
    ["BRA", "Brasil", "BR"],
    ["ARG", "Argentina", "AR"],
    ["URY", "Uruguai", "UY"],
    ["PRY", "Paraguai", "PY"],
    ["CHL", "Chile", "CL"],
    ["BOL", "Bolívia", "BO"],
    ["PER", "Peru", "PE"],
    ["COL", "Colômbia", "CO"],
    ["MEX", "México", "MX"],
    ["USA", "Estados Unidos", "US"],
    ["CAN", "Canadá", "CA"],
    ["PRT", "Portugal", "PT"],
    ["ESP", "Espanha", "ES"],
    ["FRA", "França", "FR"],
    ["ITA", "Itália", "IT"],
    ["DEU", "Alemanha", "DE"],
    ["GBR", "Reino Unido", "GB"],
    ["JPN", "Japão", "JP"],
    ["CHN", "China", "CN"],
    ["AUS", "Austrália", "AU"]
];

/**
 * Ponto de entrada invocado pela plataforma para resolver o dataset.
 *
 * @param {Array} fields campos solicitados pelo consumidor
 * @param {Array} constraints filtros informados pelo consumidor
 * @param {Array} sortFields campos de ordenacao informados pelo consumidor
 * @returns {Object} dataset construido via DatasetBuilder
 */
function createDataset(fields, constraints, sortFields) {
    try {
        var dataset = DatasetBuilder.newDataset();

        dataset.addColumn("codigo");
        dataset.addColumn("nome");
        dataset.addColumn("sigla");

        var linhas = filtrarLinhas(PAISES, constraints);
        linhas = ordenarLinhas(linhas, sortFields);

        for (var i = 0; i < linhas.length; i++) {
            dataset.addRow(linhas[i]);
        }

        return dataset;
    } catch (e) {
        return datasetDeErro(e);
    }
}

/**
 * Aplica os filtros recebidos do consumidor sobre as linhas locais.
 * Le cada filtro via getFieldName()/getInitialValue() (metodos, nao propriedades).
 */
function filtrarLinhas(linhas, constraints) {
    if (constraints == null || constraints.length === 0) {
        return linhas;
    }

    var resultado = [];

    for (var i = 0; i < linhas.length; i++) {
        if (linhaAtendeFiltros(linhas[i], constraints)) {
            resultado.push(linhas[i]);
        }
    }

    return resultado;
}

function linhaAtendeFiltros(linha, constraints) {
    for (var i = 0; i < constraints.length; i++) {
        var campo = String(constraints[i].getFieldName());
        var indice = indiceDaColuna(campo);

        if (indice < 0) {
            continue;
        }

        var valorLinha = String(linha[indice]).toUpperCase();
        var valorFiltro = String(constraints[i].getInitialValue()).toUpperCase();

        if (valorLinha !== valorFiltro) {
            return false;
        }
    }

    return true;
}

/**
 * Ordena pelo primeiro campo de ordenacao valido; sem sortFields mantem a
 * ordem original (Brasil na primeira linha).
 */
function ordenarLinhas(linhas, sortFields) {
    if (sortFields == null || sortFields.length === 0) {
        return linhas;
    }

    var campo = String(sortFields[0]);
    var indice = indiceDaColuna(campo);

    if (indice < 0) {
        return linhas;
    }

    var copia = linhas.slice(0);

    copia.sort(function (a, b) {
        var valorA = String(a[indice]);
        var valorB = String(b[indice]);

        if (valorA === valorB) {
            return 0;
        }

        return valorA < valorB ? -1 : 1;
    });

    return copia;
}

function indiceDaColuna(campo) {
    for (var i = 0; i < COLUNAS.length; i++) {
        if (COLUNAS[i] === campo) {
            return i;
        }
    }

    return -1;
}

/**
 * Erro retornado como dado, nunca como excecao solta.
 */
function datasetDeErro(erro) {
    var dataset = DatasetBuilder.newDataset();

    dataset.addColumn("ERROR");
    dataset.addRow([
        "Falha ao montar o dataset ds-viagens-paises-aluno09: " + erro
    ]);

    return dataset;
}
