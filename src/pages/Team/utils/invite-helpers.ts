export function togglePermission(
  current: Record<string, boolean>,
  permission: string,
  checked: boolean
): Record<string, boolean> {
  const updated = { ...current, [permission]: checked };

  if (permission === 'permission-edit' && checked) {
    updated['permission-view'] = true;
  }

  return updated;
}
