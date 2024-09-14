import z from 'zod'

const schemasMovies = z.object({
    title: z.string(),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    poster: z.string().url(),
    rate: z.number().min(0).max(10).default(5),
    genre: z.array(z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']))
})

export function validateMovie (object) {
    return schemasMovies.safeParse(object)
}

export function validatePartialMovie (object) {
    return schemasMovies.partial().safeParse(object)
}