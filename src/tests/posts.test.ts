import app from "../index";
import {} from "jest";

describe("Example", () => {
  test("GET /posts", async () => {
    const res = await app.request("http://localhost/posts");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Many posts");
  });
});
