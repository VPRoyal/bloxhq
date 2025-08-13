import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useMemo,
} from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async (params = {}) => {
    const { page = 1, limit = 10, search = "" } = params;
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { q: search }),
      });
      const res = await fetch(`http://localhost:4001/api/items?${queryParams}`);
      if (!res.ok) {
        throw new Error("Failed to fetch items");
      }
      const data = await res.json();
      setItems(data.items || []);
      setTotalItems(data?.pagination.total || 0);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
    setTotalItems(0);
  }, []);

  // Memoized context values
  const contextValue = useMemo(
    () => ({
      items,
      fetchItems,
      clearItems,
      loading,
      totalItems,
    }),
    [items, fetchItems, clearItems, loading, totalItems]
  );

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
