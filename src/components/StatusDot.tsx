export function StatusDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={`absolute bottom-0 right-0 block rounded-full border-2 border-white
        ${isOnline ? 'bg-green-500' : 'bg-gray-400'}
        w-3 h-3`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
}
