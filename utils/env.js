import { config } from "dotenv";


config({path: `.env.${process.env.NODE_ENV || 'dev'}.local`});

export const {JWT_SECRET, JWT_EXPIRY, GOOGLE_API, EMAIL_PASSWORD,CASHFREE_SECRET,CASHFREE_API, BUCKET_NAME, IAM_KEY, IAM_SECRET, ARCJET_API_KEY  } = process.env;