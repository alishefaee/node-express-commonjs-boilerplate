const { Code } = require("./consts.utils");
const httpContext = require("express-http-context");

exports.catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      myConsole(err)();
      let code = httpContext.get("status");
      console.log("codee", code);
      setCodeResponse(Code.UNAUTHORIZED);
      response(res, {}, `${err} ${err?.stack}`);
    });
  };
};

exports.catchAsyncDB = (fn) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(resolve, reject, ...args).catch((err) => {
        console.log("DDDDDDD");
        console.log(err);
        setCodeResponse(Code.DATABASE_ERROR);
        myConsole(err)();
        reject(err);
      });
    });
  };
};

exports.response = (res, data = {}, info = {}) => {
  let code = httpContext.get("status");
  console.log("code");
  console.log(code);

  let response = { code: code ? code.num : Code.OK.num };
  if (process.env.NODE_ENV === "dev") {
    response.message = code ? code.mes : Code.OK.mes;
    response.devMessage = code ? code.devMes : Code.OK.devMes;
    response.info = info;
  }
  response.data = data;
  return res
    .status(code && code.status ? code.status : Code.OK.status)
    .json(response);
};

exports.CustomConsole =
  (...args) =>
  (type = "") => {
    if (process.env.NODE_ENV === "dev") {
      switch (type) {
        case "error": {
          console.error(...args);
          throw new Error("EERROORR");
        }
        default:
          console.log(...args);
      }
    }
  };

exports.setCodeResponse = (code) => {
  let previousCode = httpContext.get("status");
  if (!previousCode) httpContext.set("status", code);
};
