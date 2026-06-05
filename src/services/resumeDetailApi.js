import api from "../api/axios.js";

/* =========================
   Education
========================= */

export async function getEducations(resumeId) {
  const response = await api.get(`/resumes/${resumeId}/educations`);
  return response.data;
}

export async function createEducation(resumeId, payload) {
  const response = await api.post(
    `/resumes/${resumeId}/educations`,
    payload
  );
  return response.data;
}

export async function updateEducation(resumeId, educationId, payload) {
  const response = await api.put(
    `/resumes/${resumeId}/educations/${educationId}`,
    payload
  );
  return response.data;
}

export async function deleteEducation(resumeId, educationId) {
  const response = await api.delete(
    `/resumes/${resumeId}/educations/${educationId}`
  );
  return response.data;
}

/* =========================
   Experience
========================= */

export async function getExperiences(resumeId) {
  const response = await api.get(`/resumes/${resumeId}/experiences`);
  return response.data;
}

export async function createExperience(resumeId, payload) {
  const response = await api.post(
    `/resumes/${resumeId}/experiences`,
    payload
  );
  return response.data;
}

export async function updateExperience(resumeId, experienceId, payload) {
  const response = await api.put(
    `/resumes/${resumeId}/experiences/${experienceId}`,
    payload
  );
  return response.data;
}

export async function deleteExperience(resumeId, experienceId) {
  const response = await api.delete(
    `/resumes/${resumeId}/experiences/${experienceId}`
  );
  return response.data;
}

/* =========================
   Career
========================= */

export async function getCareers(resumeId) {
  const response = await api.get(`/resumes/${resumeId}/careers`);
  return response.data;
}

export async function createCareer(resumeId, payload) {
  const response = await api.post(
    `/resumes/${resumeId}/careers`,
    payload
  );
  return response.data;
}

export async function updateCareer(resumeId, careerId, payload) {
  const response = await api.put(
    `/resumes/${resumeId}/careers/${careerId}`,
    payload
  );
  return response.data;
}

export async function deleteCareer(resumeId, careerId) {
  const response = await api.delete(
    `/resumes/${resumeId}/careers/${careerId}`
  );
  return response.data;
}

/* =========================
   Certificate
========================= */

export async function getCertificates(resumeId) {
  const response = await api.get(`/resumes/${resumeId}/certificates`);
  return response.data;
}

export async function createCertificate(resumeId, payload) {
  const response = await api.post(
    `/resumes/${resumeId}/certificates`,
    payload
  );
  return response.data;
}

export async function updateCertificate(resumeId, certificateId, payload) {
  const response = await api.put(
    `/resumes/${resumeId}/certificates/${certificateId}`,
    payload
  );
  return response.data;
}

export async function deleteCertificate(resumeId, certificateId) {
  const response = await api.delete(
    `/resumes/${resumeId}/certificates/${certificateId}`
  );
  return response.data;
}