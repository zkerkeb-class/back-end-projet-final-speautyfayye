import {Kysely} from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('username', 'text', col => col.notNull())
    .addColumn('password', 'text', col => col.notNull())
    .addColumn('email', 'text', col => col.notNull().unique())
    .execute();

  await db.schema
    .createTable('Artist')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('genre', 'text', col => col.notNull())
    .addColumn('bio', 'text')
    .execute();

  await db.schema
    .createTable('Album')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('title', 'text')
    .addColumn('releaseDate', 'timestamp')
    .addColumn('genre', 'text')
    .execute();

  await db.schema
    .createTable('Track')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('title', 'text')
    .addColumn('duration', 'text')
    .addColumn('releaseDate', 'timestamp')
    .addColumn('tracKNumber', 'integer')
    .addColumn('album_id', 'integer', col => 
      col.references('Album.id').onDelete('cascade')
    )
    .execute();

  await db.schema
    .createTable('Playlist')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('title', 'text')
    .addColumn('user_id', 'integer', col => 
      col.references('users.id').onDelete('cascade').notNull()
    )
    .execute();

  await db.schema
    .createTable('Artist_Album')
    .addColumn('artist_id', 'integer', col => 
      col.references('Artist.id').onDelete('cascade')
    )
    .addColumn('album_id', 'integer', col => 
      col.references('Album.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('pk_artist_album', ['artist_id', 'album_id'])
    .execute();
    

  await db.schema
    .createTable('Playlist_Track')
    .addColumn('playlist_id', 'integer', col => 
      col.references('Playlist.id').onDelete('cascade')
    )
    .addColumn('track_id', 'integer', col => 
      col.references('Track.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('pk_playlist_track', ['playlist_id', 'track_id'])
    .execute();

}

export async function down(db: Kysely<any>): Promise<void> {}
