import api from "../api/axios.js";

export async function analyzeResume(resumeId) {
  const response = await api.post("/ai/analyze", {
    resumeId,
  });

  return response.data;
}