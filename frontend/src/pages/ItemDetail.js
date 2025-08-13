import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ItemDetailSkeleton from "../components/skeletons/itemDetail";
import ErrorDisplay from "../components/errorDisplay";

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const loadItem = useCallback(async () => {
    if (!id) {
      setError("Invalid item ID");
      setLoading(false);
      return;
    }

    let cancelled = false;

    try {
      setLoading(true);
      setError(null);

      // Use relative URL
      const res = await fetch(`http://localhost:4001/api/items/${id}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Item not found");
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      }

      const itemData = await res.json();

      // Only update state if component is still mounted and request wasn't cancelled
      if (!cancelled && mountedRef.current) {
        setItem(itemData);
      }
    } catch (err) {
      if (!cancelled && mountedRef.current) {
        console.error("Error loading item:", err);
        setError(err.message);
      }
    } finally {
      if (!cancelled && mountedRef.current) {
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    mountedRef.current = true;
    loadItem();

    return () => {
      mountedRef.current = false;
    };
  }, [loadItem]);

  const itemDisplay = useMemo(() => {
    if (!item) return null;

    return (
      <div style={{ padding: "16px", maxWidth: "600px" }}>
        {/* Back button */}
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginBottom: "24px",
            padding: "8px 16px",
            border: "1px solid #dee2e6",
            backgroundColor: "white",
            textDecoration: "none",
            color: "#495057",
            borderRadius: "6px",
            fontSize: "14px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f8f9fa";
            e.target.style.borderColor = "#007bff";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "white";
            e.target.style.borderColor = "#dee2e6";
          }}
        >
          ← Back to Items
        </Link>

        {/* Item details */}
        <h1
          style={{
            margin: "0 0 24px 0",
            color: "#212529",
            fontSize: "28px",
            fontWeight: "600",
            lineHeight: "1.3",
          }}
        >
          {item.name}
        </h1>

        <div
          style={{
            border: "1px solid #dee2e6",
            borderRadius: "12px",
            padding: "24px",
            backgroundColor: "#f8f9fa",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "auto 1fr",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
              }}
            >
              <strong
                style={{
                  color: "#495057",
                  fontSize: "16px",
                  minWidth: "80px",
                }}
              >
                Category:
              </strong>
              <span
                style={{
                  marginLeft: "16px",
                  padding: "6px 12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "16px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {item.category}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 0",
                borderTop: "1px solid #dee2e6",
              }}
            >
              <strong
                style={{
                  color: "#495057",
                  fontSize: "16px",
                  minWidth: "80px",
                }}
              >
                Price:
              </strong>
              <span
                style={{
                  marginLeft: "16px",
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#28a745",
                }}
              >
                ${parseFloat(item.price).toFixed(2)}
              </span>
            </div>

            {/* Additional fields if they exist */}
            {item.description && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "12px 0",
                  borderTop: "1px solid #dee2e6",
                }}
              >
                <strong
                  style={{
                    color: "#495057",
                    fontSize: "16px",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Description:
                </strong>
                <p
                  style={{
                    margin: 0,
                    color: "#6c757d",
                    lineHeight: "1.5",
                  }}
                >
                  {item.description}
                </p>
              </div>
            )}

            {item.createdAt && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "12px 0",
                  borderTop: "1px solid #dee2e6",
                }}
              >
                <strong
                  style={{
                    color: "#495057",
                    fontSize: "14px",
                  }}
                >
                  Added:
                </strong>
                <span
                  style={{
                    marginLeft: "12px",
                    color: "#6c757d",
                    fontSize: "14px",
                  }}
                >
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }, [item]);
  if (loading) {
    return <ItemDetailSkeleton />;
  }
  if (error) {
    return <ErrorDisplay error={error} onRetry={retryLoad} onGoBack={goBack} />;
  }
  if (!item) {
    return (
      <ErrorDisplay error="Item not found" onRetry={null} onGoBack={goBack} />
    );
  }

  return itemDisplay;
}

export default React.memo(ItemDetail);
