const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'uvap_local';

async function nuclearDelete() {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to server...');
    await client.connect();
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('studentprofiles'); // Note: Mongoose lowercases collection names + pluralizes

    // 1. Count
    const count = await collection.countDocuments({ program: { $regex: /BBA/i } });
    console.log(`Found ${count} documents matching /BBA/i`);

    if (count > 0) {
      // 2. Delete
      const result = await collection.deleteMany({ program: { $regex: /BBA/i } });
      console.log(`Deleted ${result.deletedCount} documents.`);
    }

    // 3. Verify
    const finalCount = await collection.countDocuments({ program: { $regex: /BBA/i } });
    console.log(`Remaining documents: ${finalCount}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Connection closed.');
  }
}

nuclearDelete();
