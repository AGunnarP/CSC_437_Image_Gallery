import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./MainLayout";
import { useState } from "react";
import type { IApiImageData } from "./types"
import { useEffect } from 'react';
import { ImageSearchForm } from "./images/ImageSearchForm";




function App() {

  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [imageData, setImageData] = useState<IApiImageData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // ← state for search box

  const handleImageSearch = () => {

    if(!searchQuery){

      (async () => {
        try {
          const res = await fetch("/api/images");
          if (!res.ok) {
            // HTTP 4xx/5xx
            throw new Error(`HTTP ${res.status}`);
          }
          const json = await res.json();
          setImageData(json);
        } catch (err) {
          console.error("Failed to load images:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      })();

    }

    console.log(searchQuery);
  
    (async () => {
      try {

        const fetch_string = `/api/images/search?query=${searchQuery}`
        console.log(fetch_string)
        const res = await fetch(fetch_string);
        if (!res.ok) {
          // HTTP 4xx/5xx
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        setImageData(json);
      } catch (err) {
        console.error("Failed to load images:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })()

  };


  useEffect(() => {
    // IIFE so we can async/await cleanly
    (async () => {
      try {
        const res = await fetch("/api/images");
        if (!res.ok) {
          // HTTP 4xx/5xx
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        setImageData(json);
      } catch (err) {
        console.error("Failed to load images:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

    console.log(loading);
    console.log(error)

    return(
        <Routes>
            <Route path="/" element={<MainLayout />} >
                <Route index element={<AllImages imageData={imageData} searchPanel={
                    <ImageSearchForm
                      searchString={searchQuery}
                      onSearchStringChange={setSearchQuery}
                      onSearchRequested={handleImageSearch}
                    />
                  }/>}/>
                <Route path="/images/:imageId" element={<ImageDetails imageData={imageData} setImageData={setImageData}/>} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>
        </Routes>

    );

    }


    

export default App;
