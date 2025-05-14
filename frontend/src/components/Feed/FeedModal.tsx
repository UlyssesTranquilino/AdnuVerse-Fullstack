import { useState, useEffect, useCallback } from "react";

import { Close, ChevronLeft, ChevronRight } from "@mui/icons-material";
import useEmblaCarousel from "embla-carousel-react";

interface FeedModalProps {
  mediaUrls: string[];
  mediaUrlActive: number;
  onClose: () => void;
}

const FeedModal = ({ mediaUrls, mediaUrlActive, onClose }: FeedModalProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    startIndex: mediaUrlActive,
    align: "center",
    slidesToScroll: 1,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnENabled] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi && emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi && emblaApi?.scrollNext();
  }, [emblaApi]);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;

    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnENabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateButtons();

    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  return (
    <div className="rounded-2xl m-auto fixed inset-0  w-[90vw] max-w-220 bg-secondaryBg h-[40%] sm:h-125 z-100 flex items-center justify-center px-2 sm:px-6 md:px-10 ">
      <div className="h-full   overflow-hidden">
        <button
          onClick={onClose}
          className="cursor-pointer hover:bg-gray-100/30 p-1 rounded-full  absolute top-2   right-2 text-white z-50"
          aria-label="Close story viewer"
        >
          <Close className="scale-115" />
        </button>
        {prevBtnEnabled && (
          <button
            onClick={scrollPrev}
            className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 text-white z-50 p-2 hover:bg-white/10 rounded-full transition  "
            aria-label="Previous story"
          >
            <ChevronLeft
              fontSize="large"
              className="text-black dark:text-white"
            />
          </button>
        )}
        <div className="relative  h-full sm:h-[85vh] mx-auto ">
          <div
            className="embla h-full w-full rounded-2xl flex items-center justify-center sm:block"
            ref={emblaRef}
          >
            <div className="embla__container  flex rounded-2xl ">
              {mediaUrls.map((item, index) => (
                <div
                  key={index}
                  className="embla__slide flex-[0_0_100%] px-2 py-3 sm:my-10 max-h-70 sm:max-h-110"
                >
                  {item.includes("/video/") ? (
                    <video
                      src={item}
                      className="object-cover rounded-lg w-full h-full"
                      controls
                    />
                  ) : (
                    <img
                      src={item}
                      alt="Preview"
                      className="object-cover rounded-lg w-full h-full"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {nextBtnEnabled && (
          <button
            onClick={scrollNext}
            className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 text-white z-50 p-2 hover:bg-white/10 rounded-full transition "
            aria-label="Next story"
          >
            <ChevronRight
              fontSize="large"
              className="text-black dark:text-white"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedModal;
