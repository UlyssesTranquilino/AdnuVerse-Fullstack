import { useState, useEffect } from "react";
import GoogleLogo from "../../assets/GoogleLogo.svg";
import ConnectImg from "../../assets/ConnectImg.png";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../../global/mode";
import { Toaster, toast } from "react-hot-toast";

const SignInPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoading, error, currentUser, setCurrentUser } =
    useUserStore();

  // Handle Google Login - redirect approach
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  // Handle authentication after redirect back from Google
  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user)); // Decoding user correctly

        if (!parsedUser.lastName) {
          parsedUser.lastName = "";
        }

        localStorage.setItem("token", token);
        setCurrentUser(parsedUser);

        navigate("/", { replace: true });
        toast.success("Logged in with Google successfully!");
      } catch (error) {
        console.error("Error parsing user data:", error);
        toast.error("Failed to process Google login");
      }
    }

    const error = searchParams.get("error");
    if (error) {
      setIsError(true);
      setErrorMessage(
        error === "google_auth_failed"
          ? "Google login failed. Please try again."
          : error === "user_not_found"
          ? "User not found."
          : error === "user_not_in_db"
          ? "User data not found."
          : "Login error occurred."
      );
      toast.error("Google login failed");
    }
  }, [navigate, searchParams, setCurrentUser]);

  // Handle email/password login
  const handleSignIn = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!email || !password) {
      setIsError(true);
      setErrorMessage("Please input all required fields.");
      return;
    }

    try {
      await login(email, password);
      if (error) {
        setIsError(true);
        setErrorMessage(error);
      } else {
        setIsError(false);
        navigate("/");
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-7 pb-20 lg:flex-row lg:justify-around w-full mx-auto lg:max-w-[1200px] lg:mt-8">
      <Toaster position="top-center" />

      <div className="mt-18 max-w-120 lg:max-w-100 w-full lg:flex lg:flex-col lg:gap-5 lg:items-center lg:ml-3 lg:mb-3">
        <img
          src={ConnectImg}
          alt="Social media"
          className="max-w-72 hidden lg:block"
        />
        <h1 className="font-semibold text-2xl md:text-3xl lg:text-4xl max-w-90 text-left ml-5">
          Your Campus. Your Space.{" "}
          <span className="text-[#283891] dark:text-secondary">
            Your Verse.
          </span>
        </h1>
      </div>

      <div className="flex flex-col justify-center mt-10 py-8 shadow-lg rounded-md bg-primaryBg p-5 mx-10 w-full max-w-120">
        <form onSubmit={handleSignIn} className="flex flex-col justify-center">
          <h1 className="text-lg lg:text-2xl mb-5 font-semibold">Sign in</h1>
          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary"
          />
          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary mt-5"
          />

          {isError && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-400">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            className="cursor-pointer mt-10 py-3 text-white bg-[#283891] hover:bg-[#3A4DB7] p-2 rounded-sm text-sm"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-sm text-gray-700 dark:text-gray-400 text-center mt-3 mb-2">
            or
          </p>

          <div className="w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="cursor-pointer mt-3 py-3 flex items-center justify-center gap-3 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-sm text-sm w-full"
              disabled={isLoading}
            >
              <img src={GoogleLogo} alt="Google Logo" className="w-5" />
              <p>Sign in with Google</p>
            </button>
          </div>
        </form>

        <div className="flex mt-5 flex-wrap text-sm text-customGray">
          <p className="mr-5">Don't have an account?</p>
          <Link to="/signup">
            <p className="text-gray-700 dark:text-gray-400 hover:underline cursor-pointer hover:text-[#283891] dark:hover:text-secondary">
              Sign up
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
