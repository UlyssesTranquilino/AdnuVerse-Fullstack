import { useState } from "react";

//Components
import Sidebar from "../../components/Sidebar";
import Following from "../../components/Following";
import Stories from "../../components/Home/Stories";
import Post from "../../components/Home/Post";
import MobileSidebar from "../../components/MobileSidebar";
import Feed from "../../components/Home/Feed";

//MUI
import Skeleton from "@mui/material/Skeleton";

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  //Refreshing when user Posted
  const [refreshFeed, setRefreshFeed] = useState(false);

  const handlePostCreated = () => {
    setRefreshFeed((prev) => !prev); // Toggle to trigger re-fetch
  };

  return !isLoading ? (
    <div className=" md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto pb-20">
      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>
      {/* bg-secondaryBg */}
      <section className="overflow-hidden w-full sm:col-span-3 md:col-span-13 lg:col-span-9 flex-1 rounded-md lg:px-15 ">
        <Stories />
        <Post onPostCreated={handlePostCreated} />
        <Feed refresh={refreshFeed} handleRefresh={handlePostCreated} />
      </section>

      <section className="hidden col-span-0 lg:block lg:col-span-3">
        <Following />
      </section>

      <MobileSidebar />
    </div>
  ) : (
    <div>
      <Skeleton animation="wave" />
    </div>
  );
};

export default HomePage;
