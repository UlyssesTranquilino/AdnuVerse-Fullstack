import axios from "axios";

export const postComment = async (
  type: string,
  id: string,
  comment: string
) => {
  let commentData = {
    user: "",
    parent: {
      type: type,
      id: id,
    },
    text: comment,
    createdAt: new Date(),
  };
};
