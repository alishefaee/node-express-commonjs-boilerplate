import { Code } from '../utils/consts.utils.js'
import CardCategory from '../models/card-category.model.mjs'
import { catchAsyncDB } from '../utils/functions.js'
import { generateId } from '../utils/encrypt.utils.js'
import { aggregateOne, aggregateAll } from '../utils/aggregate.utils.js'
import mongoose from 'mongoose'

class CardCategoryService {
    create = catchAsyncDB(async (resolve, reject, data) => {
        let ancestors = []
        if (data.parentId) {
            ancestors = await CardCategory.findOne({ _id: mongoose.Types.ObjectId(data.parentId) })
            ancestors.ancestorsId.push(mongoose.Types.ObjectId(data.parentId))
        }
        console.log('ancestors', ancestors)
        let category = await CardCategory.create({
            ...data,
            ancestorsId: ancestors.ancestorsId
        })
        resolve(category)
    })

    findOne = catchAsyncDB(async (resolve, reject, _id) => {
        let query = []
        query.push({ $match: { _id: mongoose.Types.ObjectId(_id) } })

        query.push({
            $lookup: {
                from: 'categories',
                localField: 'parentId',
                foreignField: '_id',
                as: 'parent'
            }
        })
        query.push({
            $unwind: {
                path: '$parent',
                preserveNullAndEmptyArrays: true
            }
        })
        query.push({
            $addFields: {
                parent: { $ifNull: ['$parent', null] }
            }
        })

        query.push({
            $project: {
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
                parentId: 0
            }
        })

        let category = await aggregateOne('category', query)
        resolve(category)
    })

    findAll = catchAsyncDB(async (resolve, reject, filter) => {
        let query = []
        let match = {}
        if (filter.ancestorsId) {
            console.log('HHHHHHHHHHHHHHHHHH')
            let categories = JSON.parse(filter.ancestorsId)
            categories.forEach((item, index, arr) => {
                arr[index] = mongoose.Types.ObjectId(item)
            })
            match = { ancestorsId: { $in: categories } }
        }
        query.push({ $match: match })

        // query.push({
        //     $unwind: {
        //         path: '$parent',
        //         preserveNullAndEmptyArrays: true
        //     }
        // })
        // query.push({
        //     $addFields: {
        //         parent: { $ifNull: ['$parent', null] }
        //     }
        // })

        query.push({
            $project: {
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
                ancestorsId: 0
            }
        })

        let category = await aggregateAll('card-category', filter, query)
        resolve(category)
    })
}

export default new CardCategoryService()
