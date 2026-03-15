import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
  throw new Error('Missing STRIPE_PREMIUM_PRICE_ID environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
})

export const STRIPE_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID
