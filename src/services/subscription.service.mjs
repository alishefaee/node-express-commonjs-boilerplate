import Subscription from '../models/subscription.model.mjs'
import { catchAsyncDB } from '../utils/functions.mjs'

class SubscriptionService {
    findOne = catchAsyncDB(async (resolve, reject) => {
        let subscription = await Subscription.findOne({}, { __v: 0, createdAt: 0, updatedAt: 0 })
        resolve(subscription)
    })
}

export default new SubscriptionService()
