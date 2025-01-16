export const optionalProperty = (key: string, value: any) => (value ? { [key]: value } : {});
