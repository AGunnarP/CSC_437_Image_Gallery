import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./MainLayout";
import { useState, useEffect, useRef } from "react";
import type { IApiImageData } from "./types"
import { ImageSearchForm } from "./images/ImageSearchForm";
import { ProtectedRoute } from "./ProtectedRoute"; // adjust path if needed


function App() {

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [imageData, setImageData] = useState<IApiImageData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // ← state for search box
  const [authToken, setAuthToken] = useState<string>("");

  const fetchCounterRef = useRef(0); // ⬅️ Start at 0

  const handleImageSearch = () => {
    fetchCounterRef.current++;
    const requestId = fetchCounterRef.current;
  
    const endpoint = searchQuery
      ? `/api/images/search?query=${searchQuery}`
      : `/api/images`;
  
    console.log("Request:", requestId, "URL:", endpoint);
  
    (async () => {
      try {
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${authToken}`, // ✅ secure call
          },
        });
  
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
  
        if (fetchCounterRef.current === requestId) {
          setImageData(json);
          setError(false);
        } else {
          console.log("Outdated response ignored:", requestId);
        }
      } catch (err) {
        console.error("Failed to load images:", err);
        if (fetchCounterRef.current === requestId) {
          setError(true);
        }
      } finally {
        if (fetchCounterRef.current === requestId) {
          setLoading(false);
        }
      }
    })();
  };
  


  useEffect(() => {
    if (authToken) {
      setLoading(true); // show loading while fetching
      handleImageSearch(); // trigger fetch on login
    }
  }, [authToken]); // ✅ re-runs only when authToken changes

    console.log(loading);
    console.log(error)
    console.log(authToken)

    return (
      <Routes>
        <Route path="/" element={<MainLayout />}>
          
          {/* ✅ Protected Homepage */}
          <Route
            index
            element={
              <ProtectedRoute authToken={authToken}>
                <AllImages
                  imageData={imageData}
                  searchPanel={
                    <ImageSearchForm
                      searchString={searchQuery}
                      onSearchStringChange={setSearchQuery}
                      onSearchRequested={handleImageSearch}
                    />
                  }
                />
              </ProtectedRoute>
            }
          />
    
          {/* ✅ Protected Image Details */}
          <Route
            path="/images/:imageId"
            element={
              <ProtectedRoute authToken={authToken}>
                <ImageDetails
                  imageData={imageData}
                  setImageData={setImageData}
                />
              </ProtectedRoute>
            }
          />
    
          {/* ✅ Protected Upload Page */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute authToken={authToken}>
                <UploadPage authToken={authToken}/>
              </ProtectedRoute>
            }
          />
    
          {/* 🚪 Public login and register routes */}
          <Route
            path="/login"
            element={<LoginPage setAuthToken={setAuthToken} />}
          />
          <Route
            path="/register"
            element={<LoginPage isRegistering={true} setAuthToken={setAuthToken} />}
          />
    
        </Route>
      </Routes>
    );

    }


    

export default App;
