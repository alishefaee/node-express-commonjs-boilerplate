import { catchAsyncDB } from './functions.js'
import mongoose from 'mongoose'

export const aggregateAll = catchAsyncDB(async (resolve, reject, model, filter, query) => {
    let page = parseInt(filter?.page) || 1
    let limit = parseInt(filter?.limit) || 10
    let totalPages
    let totalDocs
    let hasPrevPage
    let hasNextPage
    let prevPage
    let nextPage

    console.log('queryy', query)

    let module = await import(`../models/${model}.model.mjs`)
    let Model = module.default
    console.log('Model', Model)
    const aggregate = await Model.aggregate(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)

    totalDocs = await Model.countDocuments()
    totalPages = Math.ceil(totalDocs / limit)
    if (page + 1 > totalPages) {
        nextPage = null
        hasNextPage = false
    } else {
        nextPage = page + 1
        hasNextPage = true
    }

    if (page === 1) {
        prevPage = null
        hasPrevPage = false
    } else {
        prevPage = page - 1
        hasPrevPage = true
    }
    console.log('aggregate', aggregate)
    resolve({
        aggregate,
        page,
        limit,
        totalPages,
        totalDocs,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage
    })
})

export const aggregateOne = catchAsyncDB(async (resolve, reject, model, query) => {
    let module = await import(`../models/${model}.model.mjs`)
    let Model = module.default
    const aggregate = await Model.aggregate(query)

    console.log('aggregate', aggregate[0])
    resolve(aggregate[0])
})
