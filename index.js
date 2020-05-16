/* Importa os robôs */
const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/images.js')
}

/* Função para agregação das funcionalidades */
async function start(){

    //robots.input()

    /* Aciona o robô text.js passando o content. O robô tem que terminar de executar para o restante do código
     * ser executado, por isso usamos "await" e a função start está como assíncrona (async), visto que o robô
     * "text" retorna funções assíncronas.
     */
    //await robots.text()
    await robots.image()

    const content = robots.state.load()
    console.dir(content, {depth: null})
}

start()
