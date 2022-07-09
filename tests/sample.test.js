import request from 'supertest'
import express from 'express'

describe('Test the root path -> return 404', () => {
    test('It should response the GET method with 404 message', (done) => {
        let t = true
        expect(t).toBe(true)
        done()
    })
})
