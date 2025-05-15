import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../../global/mode";
import { toast, Toaster } from "react-hot-toast";
import Logo from "../../assets/Logo.png";

const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");
 console.log("Callback URL params:", { token, user });
    // Process login only if token and user exist
    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));
        parsedUser.lastName = parsedUser.lastName || ""; // Ensure lastName exists

        // Set the token and user data
        localStorage.setItem("token", token);
        setCurrentUser(parsedUser);

        // Show success toast and navigate
        // toast.success("Logged in with Google successfully!");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Failed to process Google login");
        navigate("/login?error=invalid_google_data", { replace: true });
      }
    } else {
      toast.error("Invalid Google login data");
      navigate("/login?error=invalid_google_data", { replace: true });
    }

    // Once processing is done, stop loading
    setLoading(false);
  }, [searchParams, navigate, setCurrentUser]); // Run only when searchParams or navigate change

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primaryBg dark:bg-secondaryBg p-4">
      {/* <Toaster position="top-center" /> */}

      {/* Animated Logo */}
      <div className="relative w-40 h-40 mb-8">
        <img
          src={Logo}
          alt="Logo"
          className={`w-full h-full object-contain transition-all duration-500 ${
            loading ? "opacity-70 scale-90" : "opacity-100 scale-100"
          }`}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
          </div>
        )}
      </div>

      {/* Status Message */}
      <p className="text-lg text-primary dark:text-primary mt-4">
        {loading ? "Processing your login..." : "Redirecting you..."}
      </p>
    </div>
  );
};

export default GoogleAuthHandler;
