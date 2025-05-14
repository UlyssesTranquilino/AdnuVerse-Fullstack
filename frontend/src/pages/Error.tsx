import React from "react";
import { Link } from "react-router-dom";

import ErrorImg from "../assets/Error.png";

//Components
import Sidebar from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";

const Error = () => {
  return (
    <div className=" md:grid md:grid-cols-15 px-3 sm:px-5 mt-5 gap-7 mx-auto mb-30">
      <section className="col-span-0 hidden md:block md:col-span-2 lg:col-span-3">
        <Sidebar />
      </section>
      {/* bg-secondaryBg */}
      <section className="mt-30 md:mt-10 flex flex-col  items-center justify-center   w-full col-span-11 flex-1 rounded-md lg:px-15 ">
        <img src={ErrorImg} alt="Error" className="max-w-120" />
        <h1 className="font-semibold mb-5 text-xl md:text-2xl mt-1">
          Page Not Found
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          Sorry, we couldn’t find the page you’re looking for. Looks like this
          page doesn’t exist or was moved.
        </p>
        <Link to="/">
          <button className="md:text-lg cursor-pointer relative px-5 md:px-12 py-2 bg-accent dark:bg-blue-800 text-white  rounded-lg text-sm font-medium hover:scale-[1.02] transform transition-all duration-200 group overflow-hidden">
            Back to Home
          </button>
        </Link>
      </section>

      <MobileSidebar />
    </div>
  );
};

export default Error;
