import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: 'v1.0.0',
    title: 'Speautyfayye',
    description: 'API Documentation',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: '',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
};

const outputFile = './swagger_output.json';
const endpointsFiles = [
  './src/routers/image.router.ts',
  './src/routers/audio.router.ts',
  './src/routers/auth.router.ts',
  './src/routers/user.router.ts',
  './src/routers/playlist.router.ts',
  './src/routers/track.router.ts',
  './src/routers/album.router.ts',
  './src/routers/category.router.ts',
  './src/routers/artist.router.ts',
  './src/routers/search.router.ts',
];

swaggerAutogen({openapi: '3.0.0'})(outputFile, endpointsFiles, doc);
