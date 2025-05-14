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

const ProfileFollowing = ({ userId }) => {
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
    getAllFollowers,
  } = useUserStore();

  const [searchFollowing, setSearchFollowing] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const [isFetching, setIsFetching] = useState(false);

  // Fetch all followers when userId changes
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        await getAllFollowing(userId);
        setIsFetching(false);
      }
    };

    fetchData();
  }, [userId, getAllFollowing]);

  const clearSearch = () => setSearchFollowing("");

  // Filter followers based on search input
  const filteredFollowing = following.filter(
    (user) =>
      user?.username &&
      user.username.toLowerCase().includes(searchFollowing.toLowerCase())
  );

  const handleFollow = async (userId: string) => {
    setProcessing(userId);
    try {
      await toast.promise(followUser(userId), {
        loading: "Following...",
        success: "Followed successfully",
        error: "Failed to follow",
      });
      if (currentUser?._id) {
        await getAllFollowing(currentUser._id);
      }
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    setProcessing(userId);
    try {
      await toast.promise(unfollowUser(userId), {
        loading: "Unfollowing...",
        success: "Unfollowed",
        error: "Failed to unfollow",
      });
      if (currentUser?._id) {
        await getAllFollowing(currentUser._id);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setProcessing(null);
    }
  };

  return !isFetching ? (
    <div className=" mt-5 gap-7 mx-auto mb-30 ">
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

      {/* Main Content */}
      <section className="overflow-hidden w-full  flex-1 rounded-md ">
        <h1 className="font-semibold mb-5 text-lg md:text-xl">Following</h1>

        {/* Search Bar */}
        <div className="w-full flex justify-between max-w-200 rounded-md bg-secondaryBg p-3">
          <div className="flex items-center w-full">
            <SearchRoundedIcon className="text-gray-400" />
            <input
              type="text"
              placeholder="Search followers"
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

        {/* Followers List */}
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
                      onClick={() => navigate(`/profile/${user._id}`)}
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
                  When someone follows this user, they'll appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  ) : (
    <div className="mt-5 gap-7 mx-auto mb-30">
      {/* Main Content - Skeleton Loading */}
      <section className="overflow-hidden w-full flex-1 rounded-md ">
        <div className="w-21 mb-5 h-7 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
        <div className="w-full max-w-200 mb-5 h-11 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>

        <div className="mt-10 gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="mt-3">
              <div className="flex flex-col gap-6 rounded-md bg-secondaryBg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex-shrink-0 overflow-hidden">
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      width="100%"
                      height="100%"
                    />
                  </div>
                  <div>
                    <div className="w-15 h-5 flex-shrink-0 overflow-hidden">
                      <Skeleton
                        animation="wave"
                        variant="rectangular"
                        width="100%"
                        height="100%"
                      />
                    </div>
                    <div className="mt-1 flex items-center text-customGray">
                      <div className="w-24 h-3 flex-shrink-0 overflow-hidden">
                        <Skeleton
                          animation="wave"
                          variant="rectangular"
                          width="100%"
                          height="100%"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full  gap-4 text-xs">
                  <div className="w-full h-10 rounded-md flex-shrink-0 overflow-hidden">
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      height="100%"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfileFollowing;
