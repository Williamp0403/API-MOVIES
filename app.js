import express, { json } from 'express'
import { createMovieRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'
import { MovieModel } from './models/mysql/movie.js'


    const app = express()
    const PORT = process.env.PORT ?? 3000
    
    app.use(json())
    app.use(corsMiddleware())
    app.disable('x-powered-by')
    
    app.use('/movies', createMovieRouter({ movieModel: MovieModel }))
    
    app.listen(PORT, ()=> {
        console.log(`server listening on port http://localhost:${PORT}`)
    })


