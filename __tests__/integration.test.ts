import * as firebase from "@firebase/testing";

const projectId = "conversations-example";
const app = firebase.initializeTestApp({
  projectId,
  auth: { uid: "alice", email: "alice@example.com" },
});
const db = app.firestore();

// you need to have firebase emulator runnning for this tests
// firebase ext:dev:emulators:start --test-params=./test-params.env --project=conversations-example
describe.skip("firestore-messagebird-send-msg integration test", () => {
  beforeEach(async () => {
    // Clean database before each test
    await firebase.clearFirestoreData({ projectId });
  });

  afterAll(async () => {
    await Promise.all(firebase.apps().map((app) => app.delete()));
  });

  it("add to msg collection triggers processQueue function", async () => {
    // add new message to collection
    await db.collection("msg").add({
      channelId: "6730dba0444b46d7976d44b57a8bb9e3",
      type: "text",
      content: {
        text: "test message content",
      },
      to: "479056999",
    });

    // wait for extension to trigger
    await new Promise((r) => setTimeout(r, 2000));

    // should update delivery with state
    let allMsgs = await db.collection("msg").get();
    for (const doc of allMsgs.docs) {
      const data = doc.data();
      expect(data).toHaveProperty("delivery");
      expect(data.delivery).toHaveProperty("state");
      expect(data.delivery.state).toEqual("SUCCESS");
    }
  });
});
