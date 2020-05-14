/* 
 * ESTE ROBÔ SALVA A ESTRUTURA DE DADOS PARA QUE TODOS OS ROBÔS POSSAM ACESSAR O CONTENT SEM NECESSIDADE
 * DE ARMAZENAMENTO EM BANCO DE DADOS
 */

const fs = require('fs')
const contentFilePath = './content.json'

/* Método para salvar a estrutura de dados */
function save(content){
    /* Recebe o objeto content e transforma em uma string com .stringify */
    const contentString = JSON.stringify(content)

    /* Salva de forma síncrona no "contentFilePath": salva em disco, na raíz do projeto */
    return fs.writeFileSync(contentFilePath, contentString)
}

/* Método para carregar a estrutura de dados */
function load(){
    /* Lê o arquivo "contentFilePath" e retorna um buffer*/
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    
    /* Transforma o buffer novamente em um objeto javascript */
    const contentJson = JSON.parse(fileBuffer)

    return contentJson
}

module.exports = {
    save,
    load
}