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

async function getAiRecommendations(selectedIds) {
  await initialize();

  const database = client.db("TMBD_Movies");
  const collection = database.collection("movies");

  // Force-cast selected IDs to numbers
  selectedIds = selectedIds.map(id => Number(id));

  // 1. Fetch the selected movies
  const selectedMovies = await collection
    .find({ tmdb_id: { $in: selectedIds } })
    .toArray();

  if (selectedMovies.length === 0) return [];

  const scoreMap = {};

  // 2. Merge similarity scores
  for (const movie of selectedMovies) {
    if (!movie.similar) continue;

    for (const sim of movie.similar) {
      const id = Number(sim.tmdb_id);     // fixed
      const score = Number(sim.score);    // fucking FIXED

      if (selectedIds.includes(id)) continue;

      if (!scoreMap[id]) scoreMap[id] = 0;
      scoreMap[id] += score;
    }
  }

  // 3. Sort by highest score
  const sorted = Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => Number(id));

  // 4. Fetch movies for those IDs
  const recommendations = await collection
    .find({ tmdb_id: { $in: sorted } })
    .toArray();

  return recommendations;
}

async function getMovieById(id) {
  await initialize();

  const database = client.db("TMBD_Movies");
  const collection = database.collection("movies");

  const movie = await collection.findOne({ tmdb_id: id });
  return movie;
}


module.exports = {
  getRandomItems,
  getAiRecommendations,
  getMovieById
};
