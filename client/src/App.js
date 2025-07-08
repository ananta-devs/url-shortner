import React, { useState } from 'react';
import './App.css';

function App() {
  // State to store the long URL input by the user
  const [longUrl, setLongUrl] = useState('');
  // State to store the shortened URL received from the server
  const [shortUrl, setShortUrl] = useState('');
  // State to manage loading status during API calls
  const [isLoading, setIsLoading] = useState(false);
  // State to display copy success message
  const [copySuccess, setCopySuccess] = useState('');

  /**
   * Handles the form submission to shorten a URL.
   * Prevents default form behavior, sets loading state, and makes an API call to the backend.
   * Displays success or error messages based on the API response.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true); // Set loading state to true
    setShortUrl(''); // Clear previous short URL
    setCopySuccess(''); // Clear previous copy success message

    try {
      // Make a POST request to the backend API to shorten the URL
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }), // Send the long URL in the request body
      });
      const data = await response.json();

      // Check if the API call was successful
      if (response.ok) {
        setShortUrl(data.shortUrl); // Set the shortened URL
      } else {
        // Throw an error if the API call failed
        throw new Error(data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error shortening URL:', error); // Log the error
      alert(error.message); // Display error to the user
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  /**
   * Handles copying the shortened URL to the clipboard.
   * Uses the Clipboard API and provides feedback to the user.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl).then(() => {
      setCopySuccess('Copied!'); // Set success message
      setTimeout(() => setCopySuccess(''), 2000); // Clear message after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err); // Log copy error
      setCopySuccess('Failed to copy!'); // Set failure message
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>URL Shortener</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="url" // Input type set to 'url' for better semantic validation
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter a long URL to make it short"
            required // Input is required
          />
          <button type="submit" disabled={isLoading}>Shorten</button>
        </form>

        {/* Display loader while shortening URL */}
        {isLoading && <div className="loader"></div>}

        {/* Display shortened URL and copy button if available */}
        {shortUrl && (
          <div className="result">
            <p>Your shortened URL:</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                {shortUrl}
              </a>
              {/* Copy button */}
              <button onClick={handleCopy} className="copy-button">Copy</button>
            </div>
            {/* Copy success/failure message */}
            {copySuccess && <span className="copy-success-message">{copySuccess}</span>}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;