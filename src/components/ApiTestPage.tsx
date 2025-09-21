import { useState, useEffect } from 'preact/hooks';

interface ApiResponse {
  message: string;
  paperId: string;
  timestamp: string;
  method: string;
  success: boolean;
}

interface TestResult {
  method: string;
  success: boolean;
  response?: ApiResponse;
  error?: string;
  timestamp: string;
}

export default function ApiTestPage() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paperId, setPaperId] = useState<string>('1');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'available' | 'unavailable'>('unknown');

  // Check API availability on component mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/hello`;
      const response = await fetch(`${apiUrl}?paperId=test`, { method: 'GET' });
      setApiStatus(response.ok ? 'available' : 'unavailable');
    } catch {
      setApiStatus('unavailable');
    }
  };

  const callNetlifyAPI = async (method: 'GET' | 'POST' = 'GET') => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const testResult: TestResult = {
      method,
      success: false,
      timestamp: new Date().toISOString()
    };

    try {
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/hello`;
      
      let response: Response;
      
      if (method === 'GET') {
        const url = `${apiUrl}?paperId=${paperId}`;
        response = await fetch(url);
      } else {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paperId }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      setResponse(data);
      testResult.success = true;
      testResult.response = data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      testResult.error = errorMessage;
    } finally {
      setLoading(false);
      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setResponse(null);
    setError(null);
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>
        🚀 Netlify API Test Page
      </h1>
      
      {/* API Status */}
      <div style={{
        backgroundColor: apiStatus === 'available' ? '#d4edda' : apiStatus === 'unavailable' ? '#f8d7da' : '#fff3cd',
        color: apiStatus === 'available' ? '#155724' : apiStatus === 'unavailable' ? '#721c24' : '#856404',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: `1px solid ${apiStatus === 'available' ? '#c3e6cb' : apiStatus === 'unavailable' ? '#f5c6cb' : '#ffeaa7'}`,
        textAlign: 'center'
      }}>
        <strong>API Status:</strong> {
          apiStatus === 'available' ? '✅ Available' : 
          apiStatus === 'unavailable' ? '❌ Unavailable' : 
          '⏳ Checking...'
        }
        {apiStatus === 'unavailable' && (
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            Make sure to deploy your Netlify functions first!
          </div>
        )}
      </div>
      
      {/* Test Configuration */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, color: '#555' }}>Test Configuration</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Paper ID:
          </label>
          <input
            type="text"
            value={paperId}
            onChange={(e) => setPaperId((e.target as HTMLInputElement).value)}
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => callNetlifyAPI('GET')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007cba',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Test GET Request'}
          </button>
          
          <button
            onClick={() => callNetlifyAPI('POST')}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Test POST Request'}
          </button>

          <button
            onClick={clearResults}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Current Response */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          <h3 style={{ marginTop: 0, color: '#155724' }}>✅ Latest API Response</h3>
          <pre style={{
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '14px',
            margin: '10px 0'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Test Results History */}
      {testResults.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#555' }}>Test Results History</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {testResults.map((result, index) => (
              <div key={index} style={{
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <strong>{result.method}</strong> - {result.success ? '✅ Success' : '❌ Failed'}
                  </span>
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {result.response && (
                  <pre style={{ margin: '5px 0 0 0', fontSize: '12px', overflow: 'auto' }}>
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                )}
                {result.error && (
                  <div style={{ color: '#721c24', marginTop: '5px' }}>
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API Information */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#6c757d',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#495057' }}>ℹ️ API Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <p><strong>Endpoint:</strong> <code>/hello</code></p>
            <p><strong>Methods:</strong> GET, POST</p>
            <p><strong>Parameters:</strong> paperId (query param for GET, body for POST)</p>
          </div>
          <div>
            <p><strong>Response Format:</strong> JSON</p>
            <p><strong>Fields:</strong> message, paperId, timestamp, method, success</p>
            <p><strong>CORS:</strong> Enabled for all origins</p>
          </div>
        </div>
      </div>
    </div>
  );
}
