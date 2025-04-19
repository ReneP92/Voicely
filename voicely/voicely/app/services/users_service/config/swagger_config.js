
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Users API',
            description: 'Users API Information',
            contact: {
                name: 'Rene Persau'
            },
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],
    },
    apis: ['./users.js']
}

export default swaggerOptions;