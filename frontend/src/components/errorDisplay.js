const ErrorDisplay = ({ error, onRetry, onGoBack }) => (
    <div style={{ 
      padding: '32px 16px', 
      textAlign: 'center',
      maxWidth: '600px'
    }}>
      <div style={{ 
        fontSize: '48px', 
        marginBottom: '16px',
        color: '#dc3545'
      }}>
        ⚠️
      </div>
      <h2 style={{ 
        color: '#dc3545', 
        marginBottom: '16px',
        fontSize: '20px'
      }}>
        {error === 'Item not found' ? 'Item Not Found' : 'Something went wrong'}
      </h2>
      <p style={{ 
        color: '#6c757d', 
        marginBottom: '24px',
        lineHeight: '1.5'
      }}>
        {error === 'Item not found' 
          ? "The item you're looking for doesn't exist or has been removed."
          : 'There was an error loading the item details.'
        }
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={onGoBack}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ← Back to Items
        </button>
        {error !== 'Item not found' && (
          <button 
            onClick={onRetry}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );

export default ErrorDisplay;