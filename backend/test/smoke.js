/**
 * End-to-end smoke test.
 *
 * Spins up a throwaway in-memory MongoDB, boots the real Express app against
 * it, and exercises all eight endpoints (plus a few error cases) using fetch.
 * No external database or manual setup required:  `npm test`.
 */
const { MongoMemoryServer } = require("mongodb-memory-server");

let passed = 0;
let failed = 0;

// Tiny assertion helper so a failure prints a clear message but keeps going.
const check = (label, condition) => {
  if (condition) {
    passed += 1;
    console.log(`  ok  - ${label}`);
  } else {
    failed += 1;
    console.error(`  FAIL - ${label}`);
  }
};

// Wait until the server responds to the health check (i.e. DB connected + listening).
const waitForServer = async (base, attempts = 50) => {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(`${base}/api/health`);
      if (res.ok) return;
    } catch (_) {
      /* server not up yet */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Server did not become healthy in time");
};

const run = async () => {
  const mongo = await MongoMemoryServer.create();

  // Point the app at the in-memory DB and a test port before requiring it.
  process.env.MONGODB_URI = mongo.getUri();
  process.env.PORT = "5099";
  process.env.CLIENT_ORIGIN = "http://localhost:3000";

  require("../server"); // server.js connects + starts listening on import.

  const base = "http://localhost:5099";
  await waitForServer(base);

  const json = (res) => res.json();

  // 1. Create a collection (POST /api/collections)
  let res = await fetch(`${base}/api/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Vacation", description: "Beach photos" }),
  });
  let body = await json(res);
  check("POST /collections returns 201", res.status === 201);
  check("created collection has name", body.data.name === "Vacation");
  check("new collection imageCount is 0", body.data.imageCount === 0);
  const collectionId = body.data._id;

  // 1b. Validation: missing name -> 400
  res = await fetch(`${base}/api/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description: "no name" }),
  });
  check("POST /collections without name returns 400", res.status === 400);

  // 2. List collections (GET /api/collections)
  res = await fetch(`${base}/api/collections`);
  body = await json(res);
  check("GET /collections returns 200", res.status === 200);
  check("GET /collections returns an array", Array.isArray(body.data));
  check("list contains the new collection", body.data.length === 1);

  // 3. Add an image (POST /api/collections/:id/images)
  res = await fetch(`${base}/api/collections/${collectionId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://cdn.pixabay.com/photo/beach.jpg",
      title: "Sunset beach",
      source: "pixabay",
      width: 1920,
      height: 1080,
    }),
  });
  body = await json(res);
  check("POST image returns 201", res.status === 201);
  check("image has title", body.data.title === "Sunset beach");
  const imageId = body.data._id;

  // 3b. Validation: bad URL -> 400
  res = await fetch(`${base}/api/collections/${collectionId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "not-a-url", title: "x" }),
  });
  check("POST image with invalid url returns 400", res.status === 400);

  // 3c. Confirm image count went up and images are populated.
  res = await fetch(`${base}/api/collections`);
  body = await json(res);
  check("collection now reports imageCount 1", body.data[0].imageCount === 1);
  check(
    "images are populated with full documents",
    body.data[0].images[0].title === "Sunset beach"
  );

  // 4. Toggle public (PATCH /api/collections/:id/toggle-public)
  res = await fetch(
    `${base}/api/collections/${collectionId}/toggle-public`,
    { method: "PATCH" }
  );
  body = await json(res);
  check("PATCH toggle-public returns 200", res.status === 200);
  check("collection is now public", body.data.isPublic === true);

  // 5. Share (POST /api/collections/:id/share)
  res = await fetch(`${base}/api/collections/${collectionId}/share`, {
    method: "POST",
  });
  body = await json(res);
  check("POST share returns 200", res.status === 200);
  check(
    "share code is 8 alphanumeric chars",
    /^[a-zA-Z0-9]{8}$/.test(body.data.shareCode)
  );
  check("share url contains the code", body.data.url.includes(body.data.shareCode));
  const shareCode = body.data.shareCode;

  // 5b. Re-sharing returns the same code (idempotent).
  res = await fetch(`${base}/api/collections/${collectionId}/share`, {
    method: "POST",
  });
  body = await json(res);
  check("re-share returns the same code", body.data.shareCode === shareCode);

  // 6. View shared collection (GET /api/share/:code)
  res = await fetch(`${base}/api/share/${shareCode}`);
  body = await json(res);
  check("GET /share/:code returns 200", res.status === 200);
  check("shared collection includes images", body.data.images.length === 1);

  // 6b. Unknown share code -> 404
  res = await fetch(`${base}/api/share/zzzzzzzz`);
  check("GET /share with unknown code returns 404", res.status === 404);

  // 6c. Private collection via share code -> 403
  await fetch(`${base}/api/collections/${collectionId}/toggle-public`, {
    method: "PATCH",
  }); // toggle back to private
  res = await fetch(`${base}/api/share/${shareCode}`);
  check("GET /share of private collection returns 403", res.status === 403);

  // 7. Remove image (DELETE /api/collections/:id/images/:imageId)
  res = await fetch(
    `${base}/api/collections/${collectionId}/images/${imageId}`,
    { method: "DELETE" }
  );
  body = await json(res);
  check("DELETE image returns 200", res.status === 200);
  res = await fetch(`${base}/api/collections`);
  body = await json(res);
  check("collection imageCount back to 0", body.data[0].imageCount === 0);

  // 8. Delete collection (DELETE /api/collections/:id)
  res = await fetch(`${base}/api/collections/${collectionId}`, {
    method: "DELETE",
  });
  check("DELETE collection returns 200", res.status === 200);

  // 8b. Deleting again -> 404
  res = await fetch(`${base}/api/collections/${collectionId}`, {
    method: "DELETE",
  });
  check("DELETE missing collection returns 404", res.status === 404);

  // Unknown route -> JSON 404
  res = await fetch(`${base}/api/does-not-exist`);
  body = await json(res);
  check("unknown route returns JSON 404", res.status === 404 && body.success === false);

  // ----- Summary -----
  console.log(`\n${passed} passed, ${failed} failed`);
  await mongo.stop();
  process.exit(failed === 0 ? 0 : 1);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
