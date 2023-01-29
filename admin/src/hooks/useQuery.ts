import * as React from "react";
import { useHistory, useLocation } from "react-router-dom";

export const useQuery = () => {
  const { search } = useLocation();
  const history = useHistory();

  const query = React.useMemo(() => new URLSearchParams(search), [search]);

  const setQuery = React.useCallback(
    (newSearch: Record<string, string>) => {
      const newQuery = new URLSearchParams(newSearch);
      history.push({
        search: newQuery.toString(),
      });
    },
    [history]
  );

  return [query, setQuery] as const;
};
