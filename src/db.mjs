import pgPromise from 'pg-promise'

const db = pgPromise()({
    host: 'localhost',
    port: 5432,
    database: 'test',
    user: 'test',
    password: 'test',
})

export const query = async (query, params = {}) => {
    return db.any(query, params)
}

export const close = async () => {
    return db.$pool.end();
}
