import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { ItemSkeleton } from "../components/skeletons/item";
import { Virtuoso } from "react-virtuoso";

const ItemRenderer = React.memo(({ item }) => (
  <div
    style={{
      padding: "12px 16px",
      borderBottom: "1px solid #eee",
      display: "flex",
      alignItems: "center",
      transition: "background-color 0.2s",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => (e.target.style.backgroundColor = "#f8f9fa")}
    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  >
    <Link
      to={`/items/${item.id}`}
      style={{
        textDecoration: "none",
        color: "#212529",
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: "500", marginBottom: "4px" }}>
          {item.name}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#6c757d",
            display: "flex",
            gap: "12px",
          }}
        >
          <span>${item.price}</span>
          <span
            style={{
              backgroundColor: "#e9ecef",
              padding: "2px 6px",
              borderRadius: "10px",
            }}
          >
            {item.category}
          </span>
        </div>
      </div>
      <div style={{ color: "#007bff" }}>→</div>
    </Link>
  </div>
));
ItemRenderer.displayName = "ItemRenderer";

const Items = () => {
  const { items = [], fetchItems, loading, totalItems } = useData();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      try {
        await fetchItems({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
        });
        if (mounted) setHasMore(items.length === itemsPerPage);
      } catch (error) {
        // Will olny show error if component is mounted
        if (mounted) {
          console.error("Error fetching items:", error);
        }
      }
    };
    loadItems();

    // Clean‑up to avoid memory leak
    return () => {
      mounted = false;
    };
  }, [fetchItems, currentPage, debouncedSearch]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch("");
  }, []);

  // RenderedItem
  const RenderedItem = useCallback(
    (index, item) => <ItemRenderer key={item.id} item={item} />,
    []
  );

  const EmptyPlaceholder = useMemo(
    () => (
      <div
        style={{
          padding: "48px 16px",
          textAlign: "center",
          color: "#6c757d",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
        <h3 style={{ margin: "0 0 8px 0" }}>
          {debouncedSearch ? "No items found" : "No items available"}
        </h3>
        <p style={{ margin: 0 }}>
          {debouncedSearch
            ? `Try adjusting your search for "${debouncedSearch}"`
            : "Items will appear here when available"}
        </p>
      </div>
    ),
    [debouncedSearch]
  );

  const LoadingFooter = useMemo(
    () =>
      loading && items.length > 0 ? (
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            color: "#6c757d",
          }}
        >
          Loading more items...
        </div>
      ) : null,
    [loading, items.length]
  );

  const virtuosoComponents = useMemo(
    () => ({
      Footer: () => LoadingFooter,
      EmptyPlaceholder: () => EmptyPlaceholder,
    }),
    [LoadingFooter, EmptyPlaceholder]
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Search Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #dee2e6",
          backgroundColor: "white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: "500px" }}>
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={search}
            onChange={handleSearchChange}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "2px solid #e9ecef",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#007bff")}
            onBlur={(e) => (e.target.style.borderColor = "#e9ecef")}
          />
          <div
            style={{
              marginTop: "8px",
              color: "#6c757d",
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {loading ? "Searching..." : `${totalItems} items found`}
            </span>
            {search && (
              <button
                onClick={clearSearch}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Virtualized Items List */}
      <div style={{ flex: 1 }}>
        {loading && items.length === 0 ? (
          // Initial loading skeletons
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <ItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Virtuoso
            data={items}
            endReached={loadMore}
            itemContent={RenderedItem}
            components={virtuosoComponents}
            style={{ height: "100%" }}
            increaseViewportBy={200}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(Items);
