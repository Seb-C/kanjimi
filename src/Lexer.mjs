import { query } from './db'

// TODO tests
export default class Lexer {
    isHiragana(char) {
        const code = char.charCodeAt(0)
        return code >= 0x3041 && code <= 0x3096
    }
    isKatakana(char) {
        const code = char.charCodeAt(0)
        return code >= 0x30A1 && code <= 0x30FA
    }
    isKanji(char) {
        const code = char.charCodeAt(0)
        return code >= 0x4E00 && code <= 0x9FAF // TODO is it reliable?
    }
    async tokenize (text) {
        for (let i = 0; i < text.length; i++) {
            const char = text[i]

            // TODO
        }
    }
}
