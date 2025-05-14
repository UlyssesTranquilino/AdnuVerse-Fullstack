import { useState, useEffect } from "react";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import { Link } from "react-router-dom";
import { useUserStore } from "../global/mode";
import Skeleton from "@mui/material/Skeleton";

import { useNavigate } from "react-router-dom";
const Following = () => {
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

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?._id) {
      getAllFollowing(currentUser._id);
    }
  }, [currentUser, getAllFollowing]);

  const clearSearch = () => setSearchFollowing("");

  const filteredFollowing = following?.filter((user: any) =>
    user?.username?.toLowerCase().includes(searchFollowing.toLowerCase())
  );

  const handleFollow = async (userId: string) => {
    await followUser(userId);
    getAllFollowing(currentUser?._id); // Refresh the list
  };

  const handleUnfollow = async (userId: string) => {
    await unfollowUser(userId);
    getAllFollowing(currentUser?._id); // Refresh the list
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return !isLoading ? (
    <div className="sticky top-20 z-50 hidden lg:flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-gray-800 dark:text-[#E6E6E6]">Following</h1>
          <Link to="/following">
            <button className="cursor-pointer text-sm font-medium text-gray-800 dark:text-[#E6E6E6] hover:text-gray-500 dark:hover:text-gray-400">
              See all
            </button>
          </Link>
        </div>

        <div className="mt-3 space-y-3">
          {filteredFollowing?.length > 0 ? (
            filteredFollowing.slice(0, 6).map((user: any) => (
              <div
                key={user._id}
                className="flex flex-col gap-3 rounded-md bg-secondaryBg p-3"
              >
                <div className="flex items-center justify-center gap-3  ">
                  <Link to={`/profile/${user._id}`}>
                    {user?.avatar &&
                    !user.avatar.includes(
                      "https://lh3.googleusercontent.com/"
                    ) ? (
                      <img
                        src={user.avatar}
                        alt="User Avatar"
                        className="h-9 rounded-full w-9 object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-xl font-semibold text-blue-400 dark:text-accent">
                          {user?.firstName?.[0]?.toUpperCase()}
                          {user?.lastName?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link to={`/profile/${user._id}`}>
                      <h1 className="font-medium hover:underline">
                        {user.firstName} {user.lastName}
                      </h1>

                      <p className="text-xs text-gray-500 dark:text-gray-400 hover:underline">
                        @{user.username}
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="w-full flex gap-2 text-xs">
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
            ))
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4 bg-secondaryBg rounded-md p-3">
              You're not following anyone yet
            </div>
          )}
        </div>
      </div>
      {/* 
      Suggested for You Section
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-gray-800 dark:text-[#E6E6E6]">
            Suggested for You
          </h1>
        </div>
        <div className="mt-3 space-y-3">

          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`suggested-${index}`}
              className="flex items-center justify-between gap-3 rounded-md bg-secondaryBg p-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
                <div>
                  <h1>Suggested User {index + 1}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Suggested for you
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(`suggested-user-${index}`)} // Replace with actual user ID
                className="text-accent hover:text-accent-dark"
              >
                <PersonAddAltOutlinedIcon className="scale-90" />
              </button>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  ) : (
    <div className="sticky top-20 z-50 hidden lg:flex flex-col gap-5">
      {/* Suggested for You Section Skeleton */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton animation="wave" width={100} height={24} />
          <Skeleton animation="wave" width={60} height={20} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-md bg-secondaryBg p-3"
            >
              <div>
                <div className="flex items-center gap-3">
                  <Skeleton
                    animation="wave"
                    variant="circular"
                    width={36}
                    height={36}
                  />
                  <div>
                    <Skeleton animation="wave" width={120} height={20} />
                    <Skeleton animation="wave" width={100} height={16} />
                  </div>
                </div>
                <Skeleton animation="wave" width={170} height={36} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="mt-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton animation="wave" width={100} height={24} />
          <Skeleton animation="wave" width={60} height={20} />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-md bg-secondaryBg p-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton
                  animation="wave"
                  variant="circular"
                  width={36}
                  height={36}
                />
                <div>
                  <Skeleton animation="wave" width={120} height={20} />
                  <Skeleton animation="wave" width={100} height={16} />
                </div>
              </div>
              <Skeleton
                animation="wave"
                variant="circular"
                width={28}
                height={28}
              />
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Following;
