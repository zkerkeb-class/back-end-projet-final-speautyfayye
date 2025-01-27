import {Kysely} from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('file')
    .addColumn('id', 'text')
    .addColumn('fileType', 'text', col => col.notNull())
    .addColumn('entityId', 'integer')
    .addColumn('entityTypeId', 'text')
    .execute();

  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('password', 'text', col => col.notNull())
    .addColumn('email', 'text', col => col.notNull().unique())
    .addColumn('role', 'text', col => col.notNull())
    .execute();

  await db.schema
    .createTable('category')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'text')
    .execute();

  await db.schema
    .createTable('artist')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('category_id', 'integer', col =>
      col.references('category.id').onDelete('cascade')
    )
    .addColumn('bio', 'text')
    .addColumn('picture', 'text')
    .execute();

  await db.schema
    .createTable('album')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('title', 'text')
    .addColumn('releaseDate', 'timestamp')
    .addColumn('category_id', 'integer', col =>
      col.references('category.id').onDelete('cascade')
    )
    .addColumn('picture', 'text')
    .execute();

  await db.schema
    .createTable('track')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('title', 'text')
    .addColumn('duration', 'decimal')
    .addColumn('releaseDate', 'timestamp')
    .addColumn('trackNumber', 'integer')
    .addColumn('number_of_plays', 'integer')
    .addColumn('lyrics', 'text')
    .addColumn('album_id', 'integer', col =>
      col.references('album.id').onDelete('cascade')
    )
    .addColumn('category_id', 'integer', col =>
      col.references('category.id').onDelete('cascade')
    )
    .addColumn('picture', 'text')
    .addColumn('audio', 'text', col => col.notNull())
    .execute();

  await db.schema
    .createTable('playlist')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('title', 'text')
    .addColumn('user_id', 'integer', col =>
      col.references('user.id').onDelete('cascade').notNull()
    )
    .execute();

  await db.schema
    .createTable('artist_album')
    .addColumn('artist_id', 'integer', col =>
      col.references('artist.id').onDelete('cascade')
    )
    .addColumn('album_id', 'integer', col =>
      col.references('album.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('pk_artist_album', ['artist_id', 'album_id'])
    .execute();

  await db.schema
    .createTable('playlist_track')
    .addColumn('playlist_id', 'integer', col =>
      col.references('playlist.id').onDelete('cascade')
    )
    .addColumn('track_id', 'integer', col =>
      col.references('track.id').onDelete('cascade')
    )
    .addPrimaryKeyConstraint('pk_playlist_track', ['playlist_id', 'track_id'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {}
