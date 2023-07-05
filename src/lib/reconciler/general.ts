export const isArray = Array.isArray;

export const isString = (val: unknown): val is string => typeof val === 'string';

const onRE = /^on[^a-z]/;
export const isOn = (key: string) => onRE.test(key);

export const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object';

export const EMPTY_OBJ: { readonly [key: string]: any } = {}
export const EMPTY_ARR = []