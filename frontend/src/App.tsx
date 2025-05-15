import { useEffect } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";

//Theme
import { useTheme, useUserStore } from "./global/mode";

//Component
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

//Pages
import HomePage from "./pages/Home/HomePage";
import Reels from "./pages/Reels/Reels";
import SignUpPage from "./pages/Auth/SignUpPage";
import SignInPage from "./pages/Auth/SignInPage";
import Followers from "./pages/Followers/Followers";
import Following from "./pages/Following/Following";
import Profile from "./pages/Profile/Profile";
import SearchPage from "./pages/Search/SearchPage";
import VisitProfile from "./pages/VisitProfile/VisitProfile";
import GoogleAuthHandler from "./pages/Auth/GoogleAuthHandler";
import Error from "./pages/Error";
import Upload from "./SampleUpload/Upload";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import PrivateRoute from "./components/PrivateRoute";
const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  const { isDarkMode } = useTheme();
  const { currentUser } = useUserStore();

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline /> <ScrollToTop />
      <section className="bg-primaryBg  text-primary ">
        <Navbar />
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleAuthHandler />} />{" "}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reels"
            element={
              <PrivateRoute>
                <Reels />
              </PrivateRoute>
            }
          />
          <Route
            path="/followers"
            element={
              <PrivateRoute>
                <Followers />
              </PrivateRoute>
            }
          />
          <Route
            path="/following"
            element={
              <PrivateRoute>
                <Following />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          {/* Other users' profiles */}
          <Route
            path="/profile/:userId"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/search/:searchTerm"
            element={
              <PrivateRoute>
                <SearchPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Error />} />
        </Routes>
      </section>
    </ThemeProvider>
  );
}

export default App;
