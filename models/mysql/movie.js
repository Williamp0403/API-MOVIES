import mysql from 'mysql2/promise'

const config = {
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: '',
    database: 'moviesdb'
}

const connection = await mysql.createConnection(config)

export class MovieModel {
    static async getAll ({ genre }) {
        if (genre) {
            const toLowerCase = [genre.toLowerCase()]           
            const [genres] = await connection.query (
                'SELECT id, name FROM genre WHERE lower(name) = ?;', [toLowerCase]
            )

            if (genres == 0) return {message: 'El genero no existe'}

            const [{id}] = genres
            const [filteredMovies] = await connection.query (
                `SELECT m.title, BIN_TO_UUID(m.id) id FROM movie m JOIN movie_genres mg ON m.id = mg.movie_id
                WHERE mg.genre_id = ?;`, [id]
            )
            return filteredMovies
        }

        const [movies] = await connection.query (
            'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie'
        )
        return movies
    }

    static async getById ({ id }) {
        const [movie] = await connection.query(
            `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie 
            WHERE BIN_TO_UUID(id) = ?`, [id]
        )

        if (movie == 0) return false
        return movie[0]
    }

    static async create ({ input }) {
        const { title, year, director, duration, poster, rate, } = input
        const [resUUID] = await connection.query(`SELECT UUID() uuid`)
        const [{ uuid }] = resUUID

        try {
            await connection.query (
                `INSERT INTO movie (id, title, year, director, duration, poster, rate) 
                VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?);`,
                [title, year, director, duration, poster, rate]
            )
        } catch (e) {
            throw new Error('Error creating movie')
        }

        const [movie] = await connection.query (
            `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie 
            WHERE id = UUID_TO_BIN(?);`, [uuid]
        )
        return movie[0]
    }

    static async delete ( identificador ) {
        const [result] = await connection.query (
            `SELECT id FROM movie WHERE BIN_TO_UUID(id) = ?`, [identificador.id]
        )

        if (result.length == 0) return false

        const [{id}] = result

        await connection.query (
            `DELETE FROM movie WHERE id = ?`, [id]
        )      
    }

    static async update ({ id, input }) {
        const [result] = await connection.query (
            `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie 
            WHERE BIN_TO_UUID(id) = ?`, [id]
        )

        if (result.length == 0) return {message: 'Movie no found'}

        const updateMovie = {
            ...result[0],
            ...input
        }
        const { title, year, director, duration, poster, rate } = updateMovie

        await connection.query (
            `UPDATE movie SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ? 
            WHERE BIN_TO_UUID(id) = ?`, [title, year, director, duration, poster, rate, id]
        )
        return updateMovie
    }
}