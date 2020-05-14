/* Importa o robô text.js */
const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js')
}

/* Função para agregação das funcionalidades */
async function start(){

    robots.input()

    /* Aciona o robô text.js passando o content. O robô tem que terminar de executar para o restante do código
     * ser executado, por isso usamos "await" e a função start está como assíncrona (async), visto que o robô
     * "text" retorna funções assíncronas.
     */
    await robots.text()

    const content = robots.state.load()
    console.dir(content, {depth: null})
}

start()
