import logger from '../utils/logger.utils.js'
import { Code } from '../utils/consts.utils.js'
import { response as res } from '../utils/functions.js'

export default class Controller {
    constructor() {
        this.response = res
    }

    log(req, res, next) {
        logger.info({ req })
        next()
    }
}
