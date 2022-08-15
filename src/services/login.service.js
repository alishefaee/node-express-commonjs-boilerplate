const httpContext = require("express-http-context");
const { Code } = require("../utils/consts.utils");
const {
  generateHash,
  generateId,
  generateToken,
} = require("../utils/encrypt.utils");
const Login = require("../models/login.model");
const { catchAsyncDB } = require("../utils/functions");

class LoginService {
  create = catchAsyncDB(async (resolve, reject, user, app) => {
    let aToken = generateToken();
    let rToken = generateToken();
    let login = {
      ...app,
      aToken: generateHash(aToken),
      rToken: generateHash(rToken),
      userId: user._id,
    };
    login = await Login.create(login);
    resolve({ ...login, aToken, rToken });
  });

  update = catchAsyncDB(async (resolve, reject, _id, oldAToken) => {
    let aToken = generateToken();
    let rToken = generateToken();
    let update = {
      aToken: generateHash(aToken),
      rToken: generateHash(rToken),
      oldAToken,
    };
    let login = await Login.findByIdAndUpdate(_id, update);
    login.aToken = aToken;
    login.rToken = rToken;
    resolve(login);
  });

  updateValidation = catchAsyncDB(async (resolve, reject, _id) => {
    await Login.findByIdAndUpdate(_id, { valid: false });
    resolve();
  });

  delete = catchAsyncDB(async (resolve, reject, userId) => {
    await Login.updateMany({ userId }, { valid: false });
    resolve();
  });

  deleteOtherSessions = catchAsyncDB(async (resolve, reject, userId, _id) => {
    await Login.updateMany({ userId, _id: { $ne: _id } }, { valid: false });
    resolve();
  });

  deleteSession = catchAsyncDB(async (resolve, reject, _id) => {
    await Login.findByIdAndDelete(_id);
    resolve();
  });

  findByAccessToken = catchAsyncDB(async (resolve, reject, aToken) => {
    let token = await Login.findOne({
      $or: [{ aToken }, { oldAToken: aToken }],
      valid: true,
    });
    myConsole("token", token)();
    resolve(token);
  });

  findByRefreshToken(token) {
    return new Promise(async (resolve, reject) => {
      try {
        let login = await Login.findOne({ rToken: token });
        resolve(login);
      } catch (e) {
        httpContext.set("status", Code.DATABASE_ERROR);
        reject(e);
      }
    });
  }
}

module.exports = new LoginService()
