const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DB_CONFIG = {
  host: 'host_ip or localhost',
  user: 'your_db_user',
  password: 'db_pass',
  database: 'db_name',
  port: 3306,
};

const SUBMISSIONS_DIR = path.join(__dirname, 'public', 'images', 'Submissions');

// 🧮 Count all files in submissions folder
function countFilesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);
    return files.filter(file => fs.lstatSync(path.join(folderPath, file)).isFile()).length;
  } catch (err) {
    console.error('❌ Failed to count files:', err.message);
    return 0;
  }
}

// 📦 Create a ZIP backup of the public folder
function backupPublicFolder() {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const zipName = `backup_public_${timestamp}.zip`;
  try {
    execSync(`zip -r ${zipName} public`);
    console.log(`📦 Backup created: ${zipName}`);
  } catch (err) {
    console.error('❌ Failed to create ZIP backup:', err.message);
  }
}

async function deleteSubmissionImages() {
  let connection;
  let deletedCount = 0;
  let notDeletedCount = 0;
  let foundCount = 0;
  let notFoundCount = 0;

  console.log('🔄 Starting process...');

  // 📦 Backup first
  backupPublicFolder();

  // 📊 Count before
  const filesBefore = countFilesInFolder(SUBMISSIONS_DIR);
  console.log(`📁 Files before deletion: ${filesBefore}`);

  try {
    connection = await mysql.createConnection(DB_CONFIG);

    const [rows] = await connection.execute(`
      SELECT submission_image FROM user_task_submissions
      WHERE status IN ('approved', 'rejected')
    `);

    for (const row of rows) {
      if (!row.submission_image) continue;

      const relativePath = row.submission_image.replace(/^\/+/, '');
      const fullPath = path.join(__dirname, 'public', relativePath);

      if (fs.existsSync(fullPath)) {
        foundCount++;
        try {
          fs.unlinkSync(fullPath);
          deletedCount++;
          console.log(`✅ Deleted: ${fullPath}`);
        } catch (err) {
          notDeletedCount++;
          console.error(`❌ Failed to delete: ${fullPath} - ${err.message}`);
        }
      } else {
        notFoundCount++;
        console.warn(`⚠️ File not found: ${fullPath}`);
      }
    }

    // 📊 Count after
    const filesAfter = countFilesInFolder(SUBMISSIONS_DIR);
    console.log(`📁 Files after deletion: ${filesAfter}`);

    // 📋 Final Summary
    console.log('\n=== Summary ===');
    console.log(`🗂️ Total records processed: ${rows.length}`);
    console.log(`🟢 Found files: ${foundCount}`);
    console.log(`🗑️ Deleted files: ${deletedCount}`);
    console.log(`🚫 Not deleted files: ${notDeletedCount}`);
    console.log(`🔍 Not found files: ${notFoundCount}`);
    console.log(`📁 Files before deletion: ${filesBefore}`);
    console.log(`📁 Files after deletion: ${filesAfter}`);

  } catch (error) {
    console.error('❌ Database Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

deleteSubmissionImages();
