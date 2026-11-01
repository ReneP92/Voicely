
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Organisations API',
            description: 'Organisations API Information',
            contact: {
                name: 'Rene Persau'
            },
        },
        servers: [
            {
                url: "http://localhost:3001"
            }
        ],
    },
    apis: ['./organisations.js']
}

export default swaggerOptions;