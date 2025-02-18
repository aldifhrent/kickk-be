import request from "supertest";
import { describe, it, expect } from "@jest/globals";
import App from "../app";

const app = new App();
const data = [
  {
    name: "john",
    email: "johndoe@gmail.com",
    password: "passwordjohn",
    refferalCode: "7S5UF7",
  },
];

describe("POST /api/v1/auth/", () => {
  it("should create new data user", async () => {
    const response = await request(app.getApp()).post("/api/v1/auth/new").send({
      name: "john",
      email: "johndoe@gmail.com",
      password: "passwordjohn",
      referralCode: "7S5UF7",
    });

    // Log response body untuk melihat pesan error
    console.log(response.body);

    expect(response.status).toBe(201); // Status yang diharapkan adalah 200
  });
});
