const express = require("express");
const cors = require("cors");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");
const certificatesRouter = require("./routes/certificates");
require("./database/connect");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Successfully connected to server.");
});

app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/certificates", certificatesRouter);

app.listen(3000, () => console.log("Server running on port 3000"));
