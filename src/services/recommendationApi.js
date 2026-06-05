import api from "../api/axios.js";

/* =========================
   Recommendation
========================= */

export async function createRecommendations(
  resumeId
) {
  const response = await api.post(
    `/resumes/${resumeId}/recommendations`
  );

  return response.data;
}

export async function getRecommendations(
  resumeId
) {
  const response = await api.get(
    `/resumes/${resumeId}/recommendations`
  );

  return response.data;
}