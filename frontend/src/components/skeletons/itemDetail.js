const ItemDetailSkeleton = () => (
  <div style={{ padding: "16px", maxWidth: "600px" }}>
    <div
      style={{
        width: "120px",
        height: "36px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
        marginBottom: "24px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />

    <div
      style={{
        width: "70%",
        height: "32px",
        backgroundColor: "#f0f0f0",
        borderRadius: "4px",
        marginBottom: "24px",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />

    <div
      style={{
        border: "1px solid #eee",
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: "#fafafa",
      }}
    >
      <div
        style={{
          width: "40%",
          height: "20px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          marginBottom: "12px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
      <div
        style={{
          width: "30%",
          height: "24px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />
    </div>
  </div>
);

export default ItemDetailSkeleton;
