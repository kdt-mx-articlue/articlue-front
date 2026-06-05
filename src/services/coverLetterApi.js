import api from "../api/axios.js";

/* =========================
   Cover Letter
========================= */

export async function getCoverLetters(resumeId) {
  const response = await api.get(`/resumes/${resumeId}/cover-letters`);
  return response.data;
}

export async function createCoverLetter(resumeId, payload) {
  const response = await api.post(
    `/resumes/${resumeId}/cover-letters`,
    payload
  );
  return response.data;
}

/* =========================
   Cover Letter Items
========================= */

export async function createCoverLetterItem(coverLetterId, payload) {
  const response = await api.post(
    `/cover-letters/${coverLetterId}/items`,
    payload
  );
  return response.data;
}

export async function updateCoverLetterItem(itemId, payload) {
  const response = await api.put(
    `/cover-letter-items/${itemId}`,
    payload
  );
  return response.data;
}

export async function deleteCoverLetterItem(itemId) {
  const response = await api.delete(
    `/cover-letter-items/${itemId}`
  );
  return response.data;
}