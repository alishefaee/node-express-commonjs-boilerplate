const express = require("express");
const Controller = require("../controllers/controller");
const userRouter = require("./user.router");
const cors = require("cors");
const { response, setCodeResponse } = require("../utils/functions");
const { Code } = require("../utils/consts.utils");
const router = express.Router();

router.use(cors());
router.use(new Controller().log);

router.use("/users", userRouter);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/*", function (req, res, next) {
  setCodeResponse(Code.ROUTE_NOT_FOUND);
  return response(res, {}, {});
});

module.exports = router;
