/* import { db } from "./index"
import { sql } from "drizzle-orm"

export async function initDatabase () {
    try {
        console.log( "Initializing database..." )

        // First check if the status enum type already exists
        const checkEnumTypeResult = await db.execute( sql`
      SELECT EXISTS (
        SELECT 1 FROM pg_type 
        WHERE typname = 'status'
      ) as "exists";
    `)

        const enumExists = checkEnumTypeResult.rows[ 0 ]?.exists === true

        // Only create the enum if it doesn't exist
        if ( !enumExists ) {
            try {
                await db.execute( sql`CREATE TYPE status AS ENUM ('todo', 'in_progress', 'done');` )
                console.log( "Created status enum type" )
            } catch ( enumError ) {
                // If there's an error but it's not because the type already exists, rethrow
                if ( !( enumError instanceof Error && enumError.message.includes( "already exists" ) ) ) {
                    throw enumError
                }
                console.log( "Status enum type already exists" )
            }
        } else {
            console.log( "Status enum type already exists" )
        }

        // Create users table if it doesn't exist
        await db.execute( sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

        // Create columns table if it doesn't exist
        await db.execute( sql`
      CREATE TABLE IF NOT EXISTS columns (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

        // Create tasks table if it doesn't exist
        await db.execute( sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status status NOT NULL DEFAULT 'todo',
        due_date TIMESTAMP,
        user_id INTEGER REFERENCES users(id),
        column_id INTEGER REFERENCES columns(id),
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

        // Create tags table if it doesn't exist
        await db.execute( sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `)

        // Create tasks_tags table if it doesn't exist
        await db.execute( sql`
      CREATE TABLE IF NOT EXISTS tasks_tags (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) NOT NULL,
        tag_id INTEGER REFERENCES tags(id) NOT NULL
      );
    `)

        console.log( "Database initialized successfully" )
        return true
    } catch ( error ) {
        console.error( "Error initializing database:", error )
        return false
    }
}
 */