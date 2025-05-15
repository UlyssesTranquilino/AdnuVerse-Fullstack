import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../../global/mode";
import { toast } from "react-hot-toast";
import Logo from "../../assets/Logo.png";

const GoogleAuthHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("GoogleAuthHandler: URL search params:", searchParams.toString());

    const token = searchParams.get("token");
    const user = searchParams.get("user");

    console.log("Extracted token:", token);
    console.log("Extracted user string:", user);

    if (token && user) {
      try {
        const decodedUser = decodeURIComponent(user);
        console.log("Decoded user string:", decodedUser);

        const parsedUser = JSON.parse(decodedUser);
        console.log("Parsed user object:", parsedUser);

        parsedUser.lastName = parsedUser.lastName || ""; // Ensure lastName exists

        // Set the token and user data
        localStorage.setItem("token", token);
        setCurrentUser(parsedUser);

        // Show success toast and navigate
        // toast.success("Logged in with Google successfully!");
        console.log("Login processed successfully, navigating to home...");
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Failed to process Google login");
        navigate("/login?error=invalid_google_data", { replace: true });
      }
    } else {
      console.error("Missing token or user in URL params.");
      toast.error("Invalid Google login data");
      navigate("/login?error=invalid_google_data", { replace: true });
    }

    setLoading(false);
  }, [searchParams, navigate, setCurrentUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-primaryBg dark:bg-secondaryBg p-4">
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
