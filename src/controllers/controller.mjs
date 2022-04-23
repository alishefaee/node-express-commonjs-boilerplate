import logger from '../utils/logger.utils.mjs'
import { Code } from '../utils/consts.utils.mjs'
import { response as res } from '../utils/functions.mjs'

export default class Controller {
    constructor() {
        this.response = res
    }

    log(req, res, next) {
        logger.info({ req })
        next()
    }
}
