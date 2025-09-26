export function buildQueryParams(params: Record<string, any>): URLSearchParams {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        queryParams.append(key, value.toString());
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  return queryParams;
}
