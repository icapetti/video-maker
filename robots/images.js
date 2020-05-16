/* Importa os módulos node.js do googleapis */
const google = require('googleapis').google
const customSearch = google.customsearch('v1')

/* Importa as credenciais salvas para utilizar a API do google */
const googleSearchCredentials = require('../credentials/google-search.json')

/* Importa o robô state que salva e carrega a estrutura de dados */
const state = require('./state.js')

/* Necessário instalar o módulo oficial do googleapis para node.js: npm install googleapis para utilizar a API Custom Search.
 * Necessário ativar a API Custom Search no "https://console.developers.google.com/apis". Também deve-se gerar uma apikey.
 * No Search Engine criado em "https://cse.google.com/cse/create/new" deve ativar os parâmetros: Image search e Search the entire web.
 * Os resultados aparecem na propriedade "items."
 */

async function robot(){
    /* Carrega o estado da estrutura de dados */
    const content = state.load()

    await fetchImagesOfAllSentences(content)

    state.save(content)

    async function fetchImagesOfAllSentences(content){
        for(const sentence of content.sentences){
            /* Monta a query com o termo de busca e as keywords que constam no objeto content 
             * é feita uma concatenação do termo da busca e da keyword para que a query fique sempre contextualizada
             */
            const query = `${content.searchTerm} ${sentence.keywords[0]}`

            /* Salva busca as imagens e salva na estrutura de dados */
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)

            /* Salva a query na estrutura de dados */
            sentence.googleSearchQuery = query
        }
    }

    /* Função que faz a busca de imagens no google */
    async function fetchGoogleAndReturnImagesLinks(query){

        /* Realiza a busca de acordo com os parâmetros definidos */
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apikey, // apikey
            cx: googleSearchCredentials.searchEngineId, // Contexto de busca
            q: query, //q = query
            searchType: 'image', // Define o tipo de busca
            //imgSize: 'huge', // Resolução da imagem
            num: 2 // Número de resultados desejados
        })

        /* Extrai dos resultados da busca (items) apenas a url da imagem e salva num array */
        const imagesUrl = response.data.items.map((item) => {
            return item.link
        })
        return imagesUrl
    }
}

module.exports = robot