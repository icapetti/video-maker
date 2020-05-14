/* Importa o módulo Algorithmia */
const algorithmia = require('algorithmia')

/* Importa o json criado com a apikey do Algorithmia */
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey

/* Importa a biblioteca sbd (Sentence Boundary Detection): npm i sbd */
const sentenceBoundaryDetection = require('sbd')

/* Importa o json criado com a apiKey do Watson (Natural Language Understanding) */
const watsonApiKey = require('../credentials/watson_nlu.json').apikey

/* Importa módulo Watson Developer Cloud: npm i watson-developer-cloud */
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')

/* Instância para conectar na API, onde informamos a key, a versão e a url. O retorno é por call back */
var nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

/* Esta função também teve que ser implementada como assíncrona para que também aguarde a execução do código */
async function robot(content){

    /* Recebe o conteúdo da Wikipedia */
    await fetchContentFromWikipedia(content)

    /* "Limpa (sanitiza)" o conteúdo recebido da Wikipedia */
    sanitizeContent(content)

    /* Quebra em sentenças o conteúdo recebido da Wikipedia, após sanitizar */
    breakContentIntoSentences(content)

    /* Limita a quantidade de sentenças que o Watson irá analisar */
    limitMaximumSentences(content)

    /* Preenche as Keywords de cada sentença */
    await fetchKeywordsOfAllSentences(content)

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
    }

    function sanitizeContent(content){
        /* ---Função para sanitizar o conteúdo da wikipédia--- */

        /* Quebra o conteúdo em linhas e remove linhas em branco */
        const withoutBlankLines = removeBlankLines(content.sourceContentOriginal)
        
        /* Remove o Markdown (começa com =) */
        const withoutMarkdown = removeMarkdown(withoutBlankLines)
        
        /* Remove as datas entre parênteses */
        const withoutDatesInParentheses = removeDatesInParentheses(withoutMarkdown)

        /* Salva o conteúdo sanitizado na nossa estrutura de dados (propriedade "courceContentSanitized") */
        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLines(text){
            /* Função para quebrar o conteúdo em linhas e remover linhas em branco*/

            /* Quebra o conteúdo em linhas */
            const allLines = text.split('\n')

            /* Remove linhas em branco rodando um filter em todas as linhas e identificando aquelas que tem um length 0*/
            const withoutBlankLines = allLines.filter((line) => {
                if(line.trim().length === 0){
                    /* Se o tamanho da linha for 0 ele fica de fora (é excluído, filtrado) */
                    return false
                }
                /* Se o tamanho da linha for diferente de 0 então a linha é mantida */
                return true
            })
            return withoutBlankLines
        }

        function removeMarkdown(lines){
            /* Utiliza a mesma lógica da função removeBlankLines, utilizando filter e startsWith para remover o "=" 
             * que a Wikipedia utiliza como markdown.
             */
            const withoutMarkdown = lines.filter((line) => {
                if(line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withoutMarkdown
        }

        function removeDatesInParentheses(text){
            /* String() porque estava dando um erro com replace (só aceita conteúdo Strin e não estava reconhecendo text como String) */
            return String(text).replace(/\((?:\([^()]*\)|[^()])*\)/gm,'').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        
        /* Salva as sentenças na nossa estrutura de dados */

        /* Para cada sentença será feito um push no array de sentenças inserindo o objeto com as 3 propriedades */
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    /*
     * Função pega o array de sentenças "content.sentences" e usa o método slice 
     * para pegar as sentenças da posição 0 até o limite definido (maximumSentences)
     */
    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    /* Função que preenche as sentenças com as keywords retornadas pelo Watson */
    async function fetchKeywordsOfAllSentences(content){
        for(const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }

    /* 
     * Função assíncrona que recebe uma sentença e retorna as keywords.
     * É feito um map para filtrar do json de retorno apenas as keywords.
     */
    async function fetchWatsonAndReturnKeywords(sentence){
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if(error){
                    throw error
                }

                const keywords = response.keywords.map((keyword) => {
                    return keyword.text
                })

                resolve(keywords)
            })
        })
    }
}

/* "Exporta" o módulo (text.js) para ser importado no index.js (nosso "orquestrador") */
module.exports = robot