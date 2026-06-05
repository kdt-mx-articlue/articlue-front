import api from "../api/axios.js";

/* =========================
   Resume
========================= */

export async function getResumes() {
  const response = await api.get("/resumes");
  return response.data;
}

export async function getResume(resumeId) {
  const response = await api.get(`/resumes/${resumeId}`);
  return response.data;
}

export async function createResume(payload) {
  const response = await api.post("/resumes", payload);
  return response.data;
}

export async function updateResume(resumeId, payload) {
  const response = await api.put(
    `/resumes/${resumeId}`,
    payload
  );

  return response.data;
}

export async function deleteResume(resumeId) {
  const response = await api.delete(
    `/resumes/${resumeId}`
  );

  return response.data;
}

/* =========================
   Location
========================= */

export async function getLocations(resumeId) {
  const response = await api.get(
    `/resumes/${resumeId}/locations`
  );

  return response.data;
}

export async function addLocation(
  resumeId,
  payload
) {
  const response = await api.post(
    `/resumes/${resumeId}/locations`,
    payload
  );

  return response.data;
}

export async function deleteLocation(
  resumeId,
  locationId
) {
  const response = await api.delete(
    `/resumes/${resumeId}/locations/${locationId}`
  );

  return response.data;
}

/* =========================
   Submit
========================= */

export async function submitResume(
  resumeId
) {
  const response = await api.post(
    `/resumes/${resumeId}/submit`
  );

  return response.data;
}