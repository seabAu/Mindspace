/* import { pgTable, serial, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const statusEnum = pgEnum( "status", [ "todo", "in_progress", "done" ] )

export const users = pgTable( "users", {
    id: serial( "id" ).primaryKey(),
    name: text( "name" ).notNull(),
    email: text( "email" ).notNull().unique(),
    avatarUrl: text( "avatar_url" ),
    createdAt: timestamp( "created_at" ).defaultNow().notNull(),
} )

export const columns = pgTable( "columns", {
    id: serial( "id" ).primaryKey(),
    title: text( "title" ).notNull(),
    order: integer( "order" ).notNull(),
    createdAt: timestamp( "created_at" ).defaultNow().notNull(),
} )

export const tasks = pgTable( "tasks", {
    id: serial( "id" ).primaryKey(),
    title: text( "title" ).notNull(),
    description: text( "description" ),
    status: statusEnum( "status" ).notNull().default( "todo" ),
    dueDate: timestamp( "due_date" ),
    userId: integer( "user_id" ).references( () => users.id ),
    columnId: integer( "column_id" ).references( () => columns.id ),
    order: integer( "order" ).notNull(),
    priority: text( "priority" ).default( "medium" ),
    progress: integer( "progress" ).default( 0 ),
    createdAt: timestamp( "created_at" ).defaultNow().notNull(),
} )

export const tags = pgTable( "tags", {
    id: serial( "id" ).primaryKey(),
    name: text( "name" ).notNull().unique(),
    color: text( "color" ).notNull(),
    createdAt: timestamp( "created_at" ).defaultNow().notNull(),
} )

export const tasksTags = pgTable( "tasks_tags", {
    id: serial( "id" ).primaryKey(),
    taskId: integer( "task_id" )
        .references( () => tasks.id )
        .notNull(),
    tagId: integer( "tag_id" )
        .references( () => tags.id )
        .notNull(),
} )

// Relations
export const usersRelations = relations( users, ( { many } ) => ( {
    tasks: many( tasks ),
} ) )

export const columnsRelations = relations( columns, ( { many } ) => ( {
    tasks: many( tasks ),
} ) )

export const tasksRelations = relations( tasks, ( { one, many } ) => ( {
    user: one( users, {
        fields: [ tasks.userId ],
        references: [ users.id ],
    } ),
    column: one( columns, {
        fields: [ tasks.columnId ],
        references: [ columns.id ],
    } ),
    tags: many( tasksTags ),
} ) )

export const tagsRelations = relations( tags, ( { many } ) => ( {
    tasks: many( tasksTags ),
} ) )

export const tasksTagsRelations = relations( tasksTags, ( { one } ) => ( {
    task: one( tasks, {
        fields: [ tasksTags.taskId ],
        references: [ tasks.id ],
    } ),
    tag: one( tags, {
        fields: [ tasksTags.tagId ],
        references: [ tags.id ],
    } ),
} ) )
 */