import { rateLimit } from 'express-rate-limit'
import * as dotenv from 'dotenv'
import { isNotEmptyString } from '../utils/is'

dotenv.config()

const MAX_REQUEST_PER_HOUR = process.env.MAX_REQUEST_PER_HOUR

const maxCount = (isNotEmptyString(MAX_REQUEST_PER_HOUR) && !isNaN(Number(MAX_REQUEST_PER_HOUR)))
  ? parseInt(MAX_REQUEST_PER_HOUR)
  : 0 // 0 means unlimited

/* const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Maximum number of accesses within an hour
  max: maxCount,
  statusCode: 200, // 200 means success，but the message is 'Too many request from this IP in 1 hour'
  message: async (req, res) => {
    res.send({ status: 'Fail', message: 'Too many request from this IP in 1 hour', data: null })
  },
}) */

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // Maximum number of accesses within an hour
  max: maxCount,
  statusCode: 200, // 200 means success，but the message is 'Too many request from this IP in 1 hour'
  message: async (req, res) => {
    res.send({
      status: 'Fail',
      message: `Too many requests from this ${req.headers.loginEnabled ? 'user' : 'IP'} in 1 hour`,
      data: null,
    })
  },
  skip: async (req) => {
    // Check if user is an admin and skip rate limit
    return req.headers.isAdmin
  },
  keyGenerator: async (req) => {
    // If login is enabled, use the user ID as the key, otherwise use the IP address
    if (req.headers.loginEnabled)
      return req.headers.userId
    else
      return req.ip
  },
})

export { limiter }
