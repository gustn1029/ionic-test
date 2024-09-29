import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const fetchUploadImage = async (imageBlob: Blob) => {
  const formData = new FormData();
  formData.append("image", imageBlob, "image/jpeg");

  const res = await fetch("https://43.202.81.79:8080/api/upload", {
    method: "post",
    body: formData,
  });

  if(!res.ok) {
    throw new Error('이미지 업로드에 실패했습니다.')
  };

  return res.json();
};
