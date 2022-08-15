const httpContext = require("express-http-context");
const UserModel = require("../models/user.model.js");
const { Code } = require("../utils/consts.utils.js");
const { passwordVerify } = require("../utils/encrypt.utils.js");
const { catchAsyncDB } = require("../utils/functions.js");

class User {
  create = catchAsyncDB(async (resolve, reject, data) => {
    let user = await UserModel.create(data);
    resolve(user);
  });

  find = catchAsyncDB(async (resolve, reject, data) => {
    let user = await UserModel.findOne({ email: data.email });
    if (!user) {
      httpContext.set("status", Code.INPUT_DATA_INVALID);
      reject();
    }
    await passwordVerify(data.password, user.password);
    resolve(user);
  });

  findByEmail = catchAsyncDB(async (resolve, reject, email) => {
    let user = await UserModel.findOne({ email });
    resolve(user);
  });

  findById = catchAsyncDB(async (resolve, reject, _id) => {
    let user = await UserModel.findById(_id);
    resolve(user);
  });
  update = catchAsyncDB(async (resolve, reject, _id, password) => {
    let user = await UserModel.findOneAndUpdate(
      { _id },
      { $set: { password } }
    );
    resolve(user);
  });
  updateEmailPass = catchAsyncDB(
    async (resolve, reject, _id, password, email) => {
      let user = await UserModel.findOneAndUpdate(
        { _id },
        { $set: { password, email } }
      );
      resolve(user);
    }
  );

  findByResetLink(resetHash) {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await UserModel.findOne({ resetHash });
        resolve(user);
      } catch (e) {
        httpContext.set("status", Code.DATABASE_ERROR);
        reject(e);
      }
    });
  }
}

module.exports = new User();
