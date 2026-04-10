export const IS_PRODUCTION =
  (process.env.REACT_APP_VERCEL_ENV || process.env.NODE_ENV) === 'production';
export const __DEV__ =
  (process.env.REACT_APP_VERCEL_ENV || process.env.NODE_ENV) === 'development';
