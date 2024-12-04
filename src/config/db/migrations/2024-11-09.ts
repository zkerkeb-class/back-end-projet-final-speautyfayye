import {Kysely} from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  /* 
  await db.schema
    .createTable('user')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('email', 'text', col => col.notNull().unique())
    .addColumn('password', 'text', col => col.notNull())
    .addColumn('phoneNumber', 'text', col => col.notNull())
    .addColumn('firstname', 'text', col => col.notNull())
    .addColumn('lastname', 'text', col => col.notNull())
    .addColumn('locale', sql`locale`, col => col.defaultTo('en').notNull())
    .addColumn('createdAt', 'timestamp', col =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updatedAt', 'timestamp')
    .addColumn('deletedAt', 'timestamp')
    .execute();

  await db.schema
    .createTable('park')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('address', 'text', col => col.notNull())
    .addColumn('city', 'text', col => col.notNull())
    .addColumn('zipCode', 'text', col => col.notNull())
    .addColumn('country', 'text', col => col.notNull())
    .addColumn('createdById', 'integer', col =>
      col.references('user.id').onDelete('cascade').notNull()
    )
    .addColumn('isActive', 'boolean', col => col.defaultTo(true).notNull())
    .addColumn('plan', sql`plan`, col => col.defaultTo('FREETIER').notNull())
    .addColumn('createdAt', 'timestamp', col =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updatedAt', 'timestamp')
    .addForeignKeyConstraint('FK_park_createdById', ['createdById'], 'user', [
      'id',
    ])
    .execute();
    */
}

export async function down(db: Kysely<any>): Promise<void> {}
