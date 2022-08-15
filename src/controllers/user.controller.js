const { catchAsync, setCodeResponse } = require("../utils/functions");
const {
  validateApp,
  validateEditUser,
  validateUserByPass,
} = require("./validators/user.validator");
const { Code, RegisterType, UserType } = require("../utils/consts.utils");
const { generateHash } = require("../utils/encrypt.utils");
const Controller = require("./controller");
const httpContext = require("express-http-context");
const UserService = require("../services/user.service");
const LoginService = require("../services/login.service");

class User extends Controller {
  signup = catchAsync(async (req, res) => {
    //validation
    let appDataValidationPromise = validateApp(req.body);
    let userValidationPromise = validateUserByPass(req.body);
    let [appDataValidation, userValidation] = await Promise.all([
      appDataValidationPromise,
      userValidationPromise,
    ]);
    if (appDataValidation !== true || userValidation !== true) {
      setCodeResponse(Code.DATA_NOT_FOUND);
      return this.self.response(
          res,
          {},
          { ...appDataValidation, ...userValidation }
      );
    }

    let user = await UserService.create({
      ...req.body.user,
      role: UserType.USER,
      type: RegisterType.BUILTIN,
    });
    myConsole(user)();
    let login = await LoginService.create(user, req.body.app);

    const cleanedData = {
      login: {
        id: login._id,
        createdDate: login.createdAt,
        aToken: login.aToken,
        rToken: login.rToken,
      },
      user: {
        id: user._id,
        email: user.email,
        createdDate: user.createdAt,
      },
    };

    this.response(res, cleanedData, {});
  });
  loginOrRegister = catchAsync(async (req, res) => {
    //validation
    if (!req.body.user.type) {
      httpContext.set("status", Code.INPUT_DATA_INVALID);
      return this.response(res, { type: "فیلد تایپ تعریف نشده است" });
    }

    let userValidationPromise;
    if (req.body.user.type === 1) {
      userValidationPromise = validateUserByPass(req.body);
    }
    if (req.body.user.type === 2) {
      userValidationPromise = validateUserByGoogle(req.body);
    }
    let appDataValidationPromise = validateApp(req.body);
    let [appDataValidation, userValidation] = await Promise.all([
      appDataValidationPromise,
      userValidationPromise,
    ]);
    if (appDataValidation !== true || userValidation !== true) {
      httpContext.set("status", Code.DATA_NOT_FOUND);
      return this.self.response(
          res,
          {},
          { ...appDataValidation, ...userValidation }
      );
    }

    let user = await UserService.find(req.body.user);
    myConsole("after create")();
    myConsole(user)();
    let login = await LoginService.create(user, req.body.app);

    const cleanedData = {
      login: {
        id: login._id,
        createdDate: login.createdAt,
        aToken: login.aToken,
        rToken: login.rToken,
      },
      user: {
        id: user._id,
        email: user.email,
        createdDate: user.createdAt,
      },
    };
    return this.response(res, cleanedData, {});
  }).bind(Object.constructor(User));
  edit = catchAsync(async (req, res) => {
    let bodyValidation = await validateEditUser(req.body);
    if (bodyValidation !== true) {
      setCodeResponse(Code.DATA_NOT_FOUND);
      return this.response(res, {}, { ...bodyValidation });
    }

    let hash = generateHash(req.body.code);
    let code = await TokenService.find(hash);
    if (
        code.createdAt.getTime() + Number(process.env.CODE_PERIOD) <
        Date.now()
    ) {
      setCodeResponse(Code.TOKEN_EXPIRED);
      return this.response(res, {}, {});
    }
    let user = await UserService.updateEmailPass(
        code.userId,
        req.body.password,
        req.body.email
    );
    if (!user) {
      setCodeResponse(Code.USER_NOT_FOUND);
      return this.response(res, {}, {});
    }
    await LoginService.deleteOtherSessions(user._id, req.loginId);
    await TokenService.delete(user._id);

    const cleanData = {
      user: {
        id: user._id,
        email: user.email,
        createdDate: user.createdAt,
      },
    };

    return this.response(res, cleanData, {});
  });
  logout = catchAsync(async (req, res) => {
    await LoginService.deleteSession(req.loginId);
    return this.response(res, {}, {});
  });

  constructor() {
    super();
    this.self = this;
  }
}

module.exports = new User();
