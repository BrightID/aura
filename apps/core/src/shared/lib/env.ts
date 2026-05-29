const env = import.meta.env;

export const IS_PRODUCTION = env.MODE === 'production';
export const __DEV__ = env.MODE === 'development';
