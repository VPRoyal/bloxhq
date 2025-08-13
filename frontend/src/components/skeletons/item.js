// Skeleton loader component
export const ItemSkeleton = () => (
    <div style={{ 
      padding: '10px 16px', 
      borderBottom: '1px solid #eee',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        width: '60%',
        height: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
    </div>
  );