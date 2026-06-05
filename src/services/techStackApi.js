import api from "../api/axios.js";

/* =========================
   Tech Stack
========================= */

export async function getTechStacks() {
  const response = await api.get(
    "/tech-stacks"
  );

  return response.data;
}

export async function addResumeTechStack(
  resumeId,
  payload
) {
  const response = await api.post(
    `/resumes/${resumeId}/tech-stacks`,
    payload
  );

  return response.data;
}

export async function deleteResumeTechStack(
  resumeId,
  resumeTechId
) {
  const response = await api.delete(
    `/resumes/${resumeId}/tech-stacks/${resumeTechId}`
  );

  return response.data;
}