import api from "../api/axios.js";

/* =========================
   Portfolio
========================= */

export async function getPortfolio(resumeId) {
  const response = await api.get(
    `/resumes/${resumeId}/portfolio`
  );

  return response.data;
}

export async function uploadPortfolio(
  resumeId,
  files
) {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  } else {
    formData.append("files", files);
  }

  const response = await api.post(
    `/resumes/${resumeId}/portfolio`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}