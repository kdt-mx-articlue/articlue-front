import api from "../api/axios.js";

export async function getProfile() {
  const response = await api.get("/member/profile");
  return response.data;
}

export async function createProfile(payload) {
  const response = await api.post("/member/profile", payload);
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.put("/member/profile", payload);
  return response.data;
}