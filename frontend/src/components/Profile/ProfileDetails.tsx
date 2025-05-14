import { useState } from "react";

//MUI
import Skeleton from "@mui/material/Skeleton";

import { useUserStore } from "../../global/mode";

const ProfileDetails = ({ user, isCurrentUser, setEditProfileOpen }) => {
  const { currentUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  return !isLoading ? (
    <div className="relative  bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <h1 className="font-semibold sm:text-lg">Introduction</h1>

      {user?.bio ? (
        <p className="text-sm mt-3 sm">{user.bio}</p>
      ) : (
        isCurrentUser && (
          <button
            onClick={() => setEditProfileOpen(true)}
            className="mt-3  text-sm  text-accent border-1 border-accent rounded-md w-full py-2 border-dashed cursor-pointer hover:bg-blue-100 dark:hover:bg-[#283443]"
          >
            Add Bio
          </button>
        )
      )}

      <div className="flex flex-col text-sm mt-5">
        {user?.role && (
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
            <h1>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h1>
          </div>
        )}

        {user?.department != "" && (
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
            <h1>{user?.department}</h1>
          </div>
        )}

        {user?.batchYear != 0 ||
          (user?.batchYear != null && (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
              <h1>Batch Year: {user?.batchYear}</h1>
            </div>
          ))}
      </div>
    </div>
  ) : (
    <div className="relative  bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <div className="w-35 mb-5 h-7 flex-shrink-0 overflow-hidden">
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height="100%"
        />
      </div>

      <div>
        <div className="w-full mb-2 h-5 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
        <div className="w-[60%] mb-5 h-5 flex-shrink-0 overflow-hidden">
          <Skeleton
            animation="wave"
            variant="rectangular"
            width="100%"
            height="100%"
          />
        </div>
      </div>

      <div className="flex flex-col text-sm mt-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className=" rounded-lg mb-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden">
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="100%"
                  height="100%"
                />
              </div>{" "}
              <div className="w-30 h-4 flex-shrink-0 overflow-hidden">
                <Skeleton
                  animation="wave"
                  variant="rectangular"
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileDetails;
