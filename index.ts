import App from "./app";

import dotenv from "dotenv";
dotenv.config();

const main = () => {
  const app = new App();
  app.start();
};

main();
