const logger = require("../utils/logger.utils.js");
const { response: res } = require("../utils/functions.js");

module.exports = class Controller {
  constructor() {
    this.response = res;
  }

  log(req, res, next) {
    logger.info({ req });
    next();
  }
};
