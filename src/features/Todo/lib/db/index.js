/* import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

// Add error handling for database connection
let db: ReturnType<typeof drizzle>

try {
    if ( !process.env.DATABASE_URL ) {
        console.warn( "DATABASE_URL is not set. Using mock data." )
        // Create a dummy db object that will be replaced with mock functionality
        db = {} as ReturnType<typeof drizzle>
    } else {
        const sql = neon( process.env.DATABASE_URL )
        db = drizzle( sql, { schema } )

        // Add a simple execute method for raw SQL if it doesn't exist
        if ( !( "execute" in db ) ) {
            ; ( db as any ).execute = async ( query: any ) => {
                return await sql( query.text, ...query.values )
            }
        }
    }
} catch ( error ) {
    console.error( "Failed to initialize database connection:", error )
    // Create a dummy db object that will be replaced with mock functionality
    db = {} as ReturnType<typeof drizzle>
}

export { db }
 */

export const db;