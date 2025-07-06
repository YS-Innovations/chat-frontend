// src/pages/Team/hooks/usePagination.ts

import { useState } from "react";

export function usePagination(initialPageIndex = 0, initialPageSize = 10) {
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return {
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
  };
}
