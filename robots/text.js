/* Importa o módulo Algorithmia */
const algorithmia = require('algorithmia')

/* Importa o json criado com a apikey do Algorithmia */
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey

/* Esta função também teve que ser implementada como assíncrona para que também aguarde a execução do código */
async function robot(content){

    /* Recebe o conteúdo da Wikipedia */
    await fetchContentFromWikipedia(content)

    /* "Limpa (sanitiza)" o conteúdo recebido da Wikipedia */
    //sanitizeContent(content)

    /* Quebra em sentenças o conteúdo recebido da Wikipedia, após sanitizar */
    //breakContentIntoSentences(content)

    async function fetchContentFromWikipedia(content){
        /* 
        * Como esta função irá utilizar um algoritmo da Algorithmia, é necessário instalar o módulo oficial deles:  
        * npm i algorithmia
        * Além disso, foi necessário criar a função como assincrona (async), pois o método .pipe da API dp algorithmia retorna uma promisse (then)
        */

        /* 
         * Recebe uma instância autenticada do Algorithmia, que será utilizada para chegar no algoritmo que está no portal 
         * e que implementaremos aqui. Para a apikey que está salva no arquivo json como parâmetro
         */
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)

        /*
         * Utiliza a instância "algorithmiaAuthenticated" e o método ".algo" para acessar o algoritmo "Wikipedia Parser" por meio do link 
         * que consta na página do algoritmo: https://algorithmia.com/algorithms/web/WikipediaParser
         */
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')

        /*
         * ".algo" retorna uma instância e então utilizamos o método ".pipe" e passamos como parâmetro o termo de busca na wikipedia 
         * e responde com uma promisse. Como é retornada uma promisse, sinalizamos para o javascript com await
         */
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)

        /*
         * Para captar o conteúdo do que foi retornado na busca utiliza-se o método ".get"
         */
        const wikipediaContent = wikipediaResponde.get()

        /* Salva o conteúdo da Wikipedia na nossa estrutura de dados "content" */
        content.sourceContentOriginal = wikipediaContent.content

        console.log(wikipediaContent)

    }
    
}

/* "Exporta" o módulo (text.js) para ser importado no index.js (nosso "orquestrador") */
module.exports = robot