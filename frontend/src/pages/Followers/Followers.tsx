import { useState, useEffect } from "react";

// Icons
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// Components
import Sidebar from "../../components/Sidebar";
import MobileSidebar from "../../components/MobileSidebar";

// MUI
import Skeleton from "@mui/material/Skeleton";

import { useUserStore } from "../../global/mode";
import { useNavigate } from "react-router-dom";
const Followers = () => {
  const { getAllFollowers, currentUser, followers, error, isLoading } =
    useUserStore();

  const navigate = useNavigate();

  const [searchFollowers, setSearchFollowers] = useState("");

  useEffect(() => {
    if (currentUser?._id) {
      getAllFollowers(currentUser?._id);
    }
  }, [currentUser, getAllFollowers]);

  const clearSearch = () => setSearchFollowers("");

  const filteredFollowers = followers.filter((follower) =>
    follower.username.toLowerCase().includes(searchFollowers.toLowerCase())
  );

  return !isLoading ? (
    <div className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>
      <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:px-15">
        <h1 className="font-semibold mb-5 text-lg md:text-xl">Followers</h1>
        <div className="w-full flex justify-between max-w-200 rounded-md bg-secondaryBg p-3">
          <div className="flex items-center w-full">
            <SearchRoundedIcon className="text-gray-400" />
            <input
              type="text"
              placeholder="Search followers"
              value={searchFollowers}
              onChange={(e) => setSearchFollowers(e.target.value)}
              className="focus:outline-0 w-full pl-2"
            />
          </div>
          {searchFollowers && (
            <CloseRoundedIcon
              className="cursor-pointer hover:text-primary text-customGray"
              onClick={clearSearch}
            />
          )}
        </div>

        <div className="w-full mt-10 gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFollowers.length > 0 ? (
            filteredFollowers.map((follower, index) => (
              <div key={index} className="mt-3">
                <div className="flex flex-col gap-6 rounded-md bg-secondaryBg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0">
                      {follower?.avatar &&
                      !follower.avatar.includes(
                        "https://lh3.googleusercontent.com/"
                      ) ? (
                        <img
                          src={follower.avatar}
                          alt="User Avatar"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-lg font-semibold text-blue-400 dark:text-accent">
                            {follower?.firstName?.[0]?.toUpperCase()}
                            {follower?.lastName?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div>
                        <h1 className="">
                          {follower.firstName} {follower.lastName}
                        </h1>
                      </div>
                      <h1 className="text-sm text-customGray">
                        @{follower.username}
                      </h1>
                    </div>
                  </div>

                  <div className="w-full flex justify-around gap-4 text-xs">
                    {/* <button className="text-primary bg-gray-200 dark:bg-[#2C2C2C] hover:bg-gray-300 dark:hover:bg-[#3F3F3F] p-1 py-2 rounded-md w-full cursor-pointer">
                      Delete
                    </button> */}
                    <button
                      onClick={() => {
                        navigate(`/profile/${follower._id}`);
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
            <div className=" col-span-3">
              <div className=" mt-10 flex flex-col items-center justify-center text-center py-10">
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
                <h2 className="text-xl font-semibold mb-2">No Followers Yet</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  When someone follows this user, they’ll appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <MobileSidebar />
    </div>
  ) : (
    <div className="md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>
      <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-11 flex-1 rounded-md lg:px-15">
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

                <div className="w-full grid grid-cols-2 gap-4 text-xs">
                  <div className="w-full h-10 rounded-md flex-shrink-0 overflow-hidden">
                    <Skeleton
                      animation="wave"
                      variant="rectangular"
                      height="100%"
                    />
                  </div>

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

      <MobileSidebar />
    </div>
  );
};

export default Followers;
