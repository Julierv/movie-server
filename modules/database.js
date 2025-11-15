const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
  "mongodb+srv://Julierv:Dragonite12@moviedatacluster.f7owxau.mongodb.net/?retryWrites=true&w=majority&appName=MovieDataCluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect ONCE and reuse the connection
async function initialize() {
  if (!client.topology) {
    await client.connect();
    console.log("✅ MongoDB connected");
  }
}

async function getRandomItems() {
  await initialize();

  const database = client.db("TMBD_Movies");
  const collection = database.collection("movies");

  // Return 20 random movies for the selection page
  return await collection.aggregate([{ $sample: { size: 20 } }]).toArray();
}

// ----------------------
// AI-BASED RECOMMENDATIONS
// ----------------------

async function getAiRecommendations(selectedIds) {
  await initialize();

  const database = client.db("TMBD_Movies");
  const collection = database.collection("movies");

  // 1. Get the selected movies from DB
  const selectedMovies = await collection
    .find({ tmdb_id: { $in: selectedIds } })
    .toArray();

  if (selectedMovies.length === 0) return [];

  // 2. Merge similarity scores
  const scoreMap = {}; // { tmdb_id: combinedScore }

  for (const movie of selectedMovies) {
    if (!movie.similar) continue;

    for (const sim of movie.similar) {
      const id = sim.tmdb_id;
      const score = sim.score;

      // Skip movies that were selected
      if (selectedIds.includes(id)) continue;

      if (!scoreMap[id]) scoreMap[id] = 0;
      scoreMap[id] += score;
    }
  }

  // 3. Sort movies by combined similarity score DESC
  const sorted = Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1]) // sort by score
    .slice(0, 3) // take top 3
    .map((entry) => Number(entry[0])); // extract tmdb_id

  // 4. Fetch full movie objects for the 3 recommendations
  const recommendations = await collection
    .find({ tmdb_id: { $in: sorted } })
    .toArray();

  return recommendations;
}

module.exports = {
  getRandomItems,
  getAiRecommendations,
};
