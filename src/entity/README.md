## Entity Name Standard
### Entity for all database
**Name Standard**: `*.common.ts`
### Entity for SQL or NoSQL Style Database
**Name Standard**: `*.sql.ts` or `*.nosql.ts`
### Entity for Specific Database 
**Name Standard**: `*.mongo.ts`, `*.sqlite.ts`

Based on above standard, if current Database is `SQLite` so the `entiy` field will look like: `[path.join(__dirname, "./entity/*.common.js"), path.join(__dirname, "./entity/*.sql.js"), path.join(__dirname, "./entity/*.sqlite.js")]`