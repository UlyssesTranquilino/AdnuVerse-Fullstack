import { useState, useEffect } from "react";
import GoogleLogo from "../../assets/GoogleLogo.svg";
import ConnectImg from "../../assets/ConnectImg.png";
import { Link, useNavigate } from "react-router-dom";

import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import { useSearchParams } from "react-router-dom";

import { useUserStore } from "../../global/mode";
import { toast } from "react-hot-toast";

const SignUpPage = () => {
  const navigate = useNavigate();

  const { currentUser, isLoading, error, signup, setCurrentUser } =
    useUserStore();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(user));

        if (!parsedUser.lastName) {
          parsedUser.lastName = "";
        }

        localStorage.setItem("token", token);
        setCurrentUser(parsedUser);

        navigate("/", { replace: true });
        toast.success("Signed up with Google successfully!");
      } catch (error) {
        console.error("Error parsing Google user data:", error);
        toast.error("Failed to complete Google signup");
      }
    }

    const error = searchParams.get("error");
    if (error) {
      toast.error("Google signup failed");
      setIsError(true);
      setErrorMessage(
        error === "google_auth_failed"
          ? "Google signup failed. Please try again."
          : error === "user_exists"
          ? "Account already exists."
          : "Signup error occurred."
      );
    }
  }, [navigate, searchParams, setCurrentUser]);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogOut = () => {
    googleLogout();
  };

  // Inside your component:
  const login = useGoogleLogin({
    flow: "implicit",
    prompt: "select_account",
    // hd: "gbox.adnu.edu",
    onSuccess: async (tokenResponse) => {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });
      const profile = await res.json();

      navigate("/");
    },
    onError: (err) => console.error("Google Login Error", err),
  });

  const handleSignUp = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    await signup(
      firstName,
      lastName,
      email,
      username,
      password,
      confirmPassword
    );

    if (error) {
      setIsError(true);
      setErrorMessage(error);
    } else {
      setIsError(false);
      navigate("/signin");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center px-7 pb-20 lg:flex-row lg:justify-around w-full mx-auto lg:max-w-[1200px] lg:mt-8">
      <div className="mt-18 max-w-120 lg:max-w-100 w-full lg:flex lg:flex-col lg:gap-5 lg:items-center lg:ml-3 lg:mb-3">
        <img
          src={ConnectImg}
          alt="Social media"
          className="max-w-72 hidden lg:block"
        />{" "}
        <h1 className="font-semibold text-2xl md:text-3xl lg:text-4xl max-w-90 text-left ml-5">
          Your Campus. Your Space.{" "}
          <span className="text-[#283891] dark:text-secondary">
            Your Verse.
          </span>
        </h1>
      </div>

      <div className="flex flex-col justify-center mt-10 py-8 shadow-lg rounded-md bg-primaryBg p-5 mx-10 w-full max-w-120">
        <form className="flex flex-col justify-center">
          <h1 className="text-lg lg:text-2xl mb-5 font-semibold">Sign up</h1>

          <input
            type="text"
            value={firstName}
            placeholder="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary"
          />

          <input
            type="text"
            value={lastName}
            placeholder="Last Name"
            onChange={(e) => setLastName(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary mt-5"
          />

          <input
            type="text"
            value={username}
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary mt-5"
          />

          <input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary mt-5"
          />

          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary mt-5"
          />

          <input
            type="password"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="text-sm focus:outline-1 border-1 p-2 rounded-sm focus:outline-secondary mt-5"
          />

          {isError && (
            <p className="mt-3 text-sm text-red-500 dark:text-red-400">
              {errorMessage}
            </p>
          )}

          <button
            onClick={handleSignUp}
            className="cursor-pointer mt-10 py-3 text-white bg-[#283891] hover:bg-[#3A4DB7] p-2 rounded-sm text-sm"
          >
            Sign up
          </button>

          <p className="text-sm text-gray-700 dark:text-gray-400 text-center mt-3 mb-2">
            or
          </p>
          <div className="w-full">
            {" "}
            {/* Added this wrapper div */}
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "https://adnuverse-backend.onrender.com/auth/google";
              }}
              className="cursor-pointer mt-3 py-3 flex items-center justify-center gap-3 bg-white text-black border border-gray-300 hover:bg-gray-100 rounded-sm text-sm w-full"
            >
              <img src={GoogleLogo} alt="Google Logo" className="w-5" />
              <p>Sign in with Google</p>
            </button>
          </div>
        </form>

        <div className="flex mt-5 flex-wrap text-sm text-customGray">
          <p className="mr-5">Already have an account?</p>
          <Link to="/signin">
            <p className="text-gray-700 dark:text-gray-400 hover:underline cursor-pointer hover:text-[#283891] dark:hover:text-secondary">
              Sign in
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
