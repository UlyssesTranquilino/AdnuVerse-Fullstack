import { useState } from "react";

//MUI
import Skeleton from "@mui/material/Skeleton";

import { useUserStore } from "../../global/mode";

const Organizations = ({ orgs, isCurrentUser, setEditProfileOpen }) => {
  const { currentUser } = useUserStore();

  const [isLoading, setIsLoading] = useState(false);
  return !isLoading ? (
    <div className="relative  bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <h1 className="font-semibold sm:text-lg">Organizations</h1>

      {orgs && currentUser?.orgs[0]?.trim() ? (
        <div className="flex flex-col text-sm mt-5">
          {orgs.map((org: string) => (
            <div key={org} className=" rounded-lg mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0" />
                <h1>{org}</h1>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={() => setEditProfileOpen(true)}
          className="mt-3  text-sm  text-accent border-1 border-accent rounded-md w-full py-2 border-dashed cursor-pointer hover:bg-blue-100 dark:hover:bg-[#283443]"
        >
          Add Organizations
        </button>
      )}
    </div>
  ) : (
    <div className="relative  bg-secondaryBg rounded-xl p-4 md:p-6 ">
      <div className="w-32 mb-5 h-7 flex-shrink-0 overflow-hidden">
        <Skeleton
          animation="wave"
          variant="rectangular"
          width="100%"
          height="100%"
        />
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

export default Organizations;
