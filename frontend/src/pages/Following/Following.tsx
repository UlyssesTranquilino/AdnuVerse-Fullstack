import { useState, useEffect } from "react";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Components
import Sidebar from "../../components/Sidebar";
import MobileSidebar from "../../components/MobileSidebar";

// MUI
import Skeleton from "@mui/material/Skeleton";

// Store hook
import { useUserStore, useTheme } from "../../global/mode";

import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const Following = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const {
    getAllFollowing,
    currentUser,
    following,
    error,
    isLoading,
    followUser,
    unfollowUser,
  } = useUserStore();

  const [searchFollowing, setSearchFollowing] = useState("");
  const [processing, setProcessing] = useState<string | null>(null); // Track which user is being processed

  // Fetch all following users when currentUser changes
  useEffect(() => {
    if (currentUser?._id) {
      getAllFollowing(currentUser?._id);
    }
  }, [currentUser, getAllFollowing]);

  // Function to clear search input
  const clearSearch = () => setSearchFollowing("");

  // Filter followers based on search input
  const filteredFollowing = following.filter(
    (user: any) =>
      user?.username &&
      user.username.toLowerCase().includes(searchFollowing.toLowerCase())
  );

  const handleUnfollow = async (userId: string) => {
    setProcessing(userId);
    try {
      await toast.promise(unfollowUser(userId), {
        loading: "Unfollowing...",
        success: "Unfollowed",
        error: "Failed to unfollow",
      });
      // Refresh the following list after successful unfollow
      if (currentUser?._id) {
        await getAllFollowing(currentUser._id);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleFollow = async (userId: string) => {
    setProcessing(userId);
    try {
      await toast.promise(followUser(userId), {
        loading: "Following...",
        success: "Followed successfully",
        error: "Failed to follow",
      });
      // Refresh the following list after successful follow
      if (currentUser?._id) {
        await getAllFollowing(currentUser._id);
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setProcessing(null);
    }
  };

  return !isLoading ? (
    <div className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
      {/* Sidebar for Desktop */}
      <Toaster
        toastOptions={{
          className: "text-primary bg-secondaryBg",
          style: {
            color: isDarkMode ? "white" : "black",
            backgroundColor: isDarkMode ? "#1F2937" : "#F9FAFB",
          },
        }}
      />

      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>

      {/* Main Content */}
      <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:px-15">
        <h1 className="font-semibold mb-5 text-lg md:text-xl">Following</h1>

        {/* Search Bar */}
        <div className="w-full flex justify-between max-w-200 rounded-md bg-secondaryBg p-3">
          <div className="flex items-center w-full">
            <SearchRoundedIcon className="text-gray-400" />
            <input
              type="text"
              placeholder="Search following"
              value={searchFollowing}
              onChange={(e) => setSearchFollowing(e.target.value)}
              className="focus:outline-0 w-full pl-2"
            />
          </div>
          {searchFollowing && (
            <CloseRoundedIcon
              className="cursor-pointer hover:text-primary text-customGray"
              onClick={clearSearch}
            />
          )}
        </div>

        {/* Follower List */}
        <div className="w-full mt-10 gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFollowing.length > 0 ? (
            filteredFollowing.map((user) => (
              <div key={user._id} className="mt-3">
                <div className="flex flex-col gap-6 rounded-md bg-secondaryBg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0">
                      {user?.avatar &&
                      !user.avatar.includes(
                        "https://lh3.googleusercontent.com/"
                      ) ? (
                        <img
                          src={user.avatar}
                          alt="User Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-400 dark:text-accent">
                            {user?.firstName?.[0]?.toUpperCase()}
                            {user?.lastName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div>
                        <h1 className="">
                          {user.firstName} {user.lastName}
                        </h1>
                      </div>
                      <h1 className="text-sm text-customGray">
                        @{user.username}
                      </h1>
                    </div>
                  </div>

                  <div className="w-full flex justify-around gap-4 text-xs">
                    <button
                      onClick={() => handleUnfollow(user._id)}
                      disabled={processing === user._id}
                      className={`text-primary bg-gray-200 dark:bg-[#2C2C2C] hover:bg-gray-300 dark:hover:bg-[#3F3F3F] p-1 py-2 rounded-md w-full cursor-pointer ${
                        processing === user._id ? "opacity-50" : ""
                      }`}
                    >
                      {processing === user._id ? "Processing..." : "Unfollow"}
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/profile/${user._id}`);
                      }}
                      className="text-accent p-1 py-2 border-1 border-accent hover:bg-blue-100 dark:hover:bg-[#283443] rounded-md w-full cursor-pointer"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3">
              <div className="mt-10 flex flex-col items-center justify-center text-center py-10">
                <div className="w-24 h-24 bg-gray-200 dark:bg-[#2C2C2C] rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  Not Following Anyone Yet
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  When you start following people, they'll appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </div>
  ) : (
    <div className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
      {/* Sidebar for Desktop */}
      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>

      {/* Main Content - Skeleton Loading */}
      <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:px-15">
        {/* ... (keep your existing skeleton loader) */}
      </section>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </div>
  );
};

export default Following;
