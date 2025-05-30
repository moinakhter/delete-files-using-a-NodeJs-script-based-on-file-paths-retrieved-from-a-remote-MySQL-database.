# A Node.js script to delete submission images using remote MySQL database and create a backup of the public folder before removing.

### I am removing files from project_dir/public/images/Submission folder
# Submission Image Cleanup

A Node.js script to manage image files by deleting submissions marked as 'approved' or 'rejected' in a MySQL database and creating a ZIP backup of the public folder before deletion.

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- `zip` utility installed on the system (for creating backups)
- Write permissions for the script to create ZIP files and delete images

## Installation

1. Clone or download the repository.
2. Navigate to the project directory and run:
   ```bash
   npm install
   ```
3. Ensure the MySQL database is running and accessible with the credentials specified in the `DB_CONFIG` object in `index.js`.

## Configuration

Edit the `DB_CONFIG` object in `index.js` with your MySQL database details:

```javascript
const DB_CONFIG = {
  host: 'your-database-host',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database',
  port: 3306,
};
```

The script assumes a `public/images/Submissions` directory exists relative to the script's location for storing submission images.

## Usage

Run the script using:

```bash
node index.js
```

The script will:
1. Create a ZIP backup of the `public` folder with a timestamp.
2. Count the number of files in the `public/images/Submissions` directory.
3. Query the `user_task_submissions` table for images with `approved` or `rejected` status.
4. Delete the corresponding image files if they exist.
5. Log a summary of the process, including files processed, deleted, not found, and counts before and after deletion.

## Dependencies

- `mysql2`: For asynchronous MySQL database operations.
- Node.js built-in modules: `fs`, `path`, `child_process`.

## Notes

- Ensure the `zip` command is available on your system for backups.
- The script logs errors for failed deletions or missing files.
- The database connection is properly closed after execution.


### Result
=== Summary ===
🗂️ Total records processed: 9644
🟢 Found files: 2487
🗑️ Deleted files: 2487
🚫 Not deleted files: 0
🔍 Not found files: 7120
📁 Files before deletion: 133112


