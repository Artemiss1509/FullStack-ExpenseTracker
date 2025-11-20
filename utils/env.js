import { config } from "dotenv";


config({path: `.env.${process.env.NODE_ENV || 'dev'}.local`});

export const {PORT,DB_NAME, DB_USER, DB_PASSWORD, DB_ENDPOINT, JWT_SECRET, JWT_EXPIRY, GOOGLE_API, EMAIL_PASSWORD,CASHFREE_SECRET,CASHFREE_API, BUCKET_NAME, IAM_KEY, IAM_SECRET, ARCJET_API_KEY  } = process.env;