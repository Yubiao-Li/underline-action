export function copyObjArray(obj: any, num: number) {
  const result = [];
  for (let i = 0; i < num; i++) {
    result.push(JSON.parse(JSON.stringify(obj)));
  }
  return result;
}
