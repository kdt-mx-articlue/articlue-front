import api from "../api/axios.js";

/* =========================
   GitHub Auth
========================= */

export async function githubLogin(payload) {
  const response = await api.post(
    "/github/auth/login",
    payload
  );

  return response.data;
}

export async function issueGithubToken(payload) {
  const response = await api.post(
    "/github/auth/token",
    payload
  );

  return response.data;
}

/* =========================
   GitHub Info
========================= */

export async function getGithubInfo() {
  const response = await api.get(
    "/github/info"
  );

  return response.data;
}

export async function getGithubRepositories() {
  const response = await api.get(
    "/github/repos"
  );

  return response.data;
}

export async function getGithubRepositoryDetail(params) {
  const response = await api.get(
    "/github/detail/info",
    {
      params,
    }
  );

  return response.data;
}

export async function saveGithubInfo(payload) {
  const response = await api.post(
    "/github/storage",
    payload
  );

  return response.data;
}

/* =========================
   Resume Github Repository
========================= */

export async function connectResumeRepository(
  resumeId,
  payload
) {
  const response = await api.post(
    `/resumes/${resumeId}/github-repositories`,
    payload
  );

  return response.data;
}

export async function disconnectResumeRepository(
  resumeId,
  resumeGithubRepoId
) {
  const response = await api.delete(
    `/resumes/${resumeId}/github-repositories/${resumeGithubRepoId}`
  );

  return response.data;
}