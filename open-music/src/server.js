require('dotenv').config()
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')

// Albums
const AlbumsService = require('./services/postgres/AlbumsService')
const AlbumsPlugin = require('./api/albums')
const AlbumValidator = require('./validator/albums')

// Songs
const SongsService = require('./services/postgres/SongsService')
const SongsPlugin = require('./api/songs')
const SongValidator = require('./validator/songs')

// Users
const UsersService = require('./services/postgres/UserService')
const UsersPlugin = require('./api/users')
const UsersValidator = require('./validator/users')

// Authentications
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const AuthencticationsPlugin = require('./api/authentications')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

// Playlist
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistsPlugin = require('./api/playlists')
const PlaylistValidator = require('./validator/playlists')

// Collaboration
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsPlugin = require('./api/collaborations')
const CollaborationValidator = require('./validator/collaborations')

// Cache
const CacheService = require('./services/redis/CacheService')

// Storage
const StorageService = require('./services/storage/StorageService')
const UploadsValidator = require('./validator/uploads')

// Export
const ProducerService = require('./services/rabbitmq/ProducerService')
const ExportPlugin = require('./api/export')
const ExportsValidator = require('./validator/exports')

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  // Define authentication strategy with jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id
      }
    })
  })

  const cacheService = new CacheService()
  const albumsService = new AlbumsService(cacheService)
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService({ songsService, collaborationsService, cacheService })
  const albumsStorageService = new StorageService(require('./api/albums/albumCoverPath'))

  await server.register([
    {
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        storageService: albumsStorageService,
        validator: AlbumValidator,
        uploadsValidator: UploadsValidator
      }
    },
    {
      plugin: SongsPlugin,
      options: {
        service: songsService,
        validator: SongValidator
      }
    },
    {
      plugin: UsersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: AuthencticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    {
      plugin: PlaylistsPlugin,
      options: {
        playlistsService,
        validator: PlaylistValidator
      }
    },
    {
      plugin: CollaborationsPlugin,
      options: {
        collaborationsService,
        usersService,
        playlistsService,
        validator: CollaborationValidator
      }
    },
    {
      plugin: ExportPlugin,
      options: {
        validator: ExportsValidator,
        producerService: ProducerService,
        playlistsService
      }
    }
  ])

  await server.start()
  console.log(`Server running at: ${server.info.uri}`)
}

init()
