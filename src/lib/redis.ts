import { Redis } from '@upstash/redis';

// Upstash Redis — works in Vercel serverless
// Only create client if credentials are configured
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = (url && token) ? new Redis({ url, token }) : null;

export default redis;
