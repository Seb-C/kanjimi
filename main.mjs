import { close } from './db'
import Lexer from './Lexer'

(async () => {
    const lexer = new Lexer()
    await lexer.tokenize('私はセバスティアンと申します。')
})().then(close)
