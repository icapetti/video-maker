const readline = require('readline-sync')

/* Função para agregação das funcionalidades */
function start(){

    /* Objeto para "guardar" tudo o que acontecer, como o termo utilizado na busca, as sentençãs encontradas etc. */
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()

    function askAndReturnSearchTerm(){

        /* 
        * A função askAndReturnSearchTerm() utiliza o método question da biblioteca readline-sync para solicitar 
        * um termo de busca para o usuário. Assim, retorna uma string com o input do usuario. 
        * Esta string é inserida como valor na propriedade searchTerm do objeto content. 
        * -> Necessário instalar a biblioteca readline-sync (npm install readline-sync). 
        */

        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix(){
        /*
        * A função askAndReturnPrefix() será utilizada para captar o prefixo que posteriormente será utilizado
        * para montar o título do vídeo no YouTube.
        * Para isso é é utilizado o método keyInSelect da biblioteca readline, que é um select de opções que retorna 
        * a chave da opção selecionada pelo usuário.  
        */

        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }

    console.log(content)

}

start()
