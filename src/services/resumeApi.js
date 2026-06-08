import api from "../api/axios.js";

/* =========================
   Resume(Profile)
   Swagger 기준:
   GET    /api/member/profile
   POST   /api/member/profile
   PUT    /api/member/profile
   DELETE /api/member/profile
========================= */

function isNotFoundResume(error) {
  return (
    error?.response?.status === 404 &&
    String(error?.response?.data?.message || "").includes("이력서가 없습니다")
  );
}

function normalizeProfileResponse(responseData) {
  if (!responseData) return null;

  if (responseData.status === "error") {
    return null;
  }

  return responseData.data || responseData.resume || responseData.profile || responseData;
}

export async function getResumes() {
  try {
    const response = await api.get("/member/profile");
    const data = normalizeProfileResponse(response.data);

    return data ? [data] : [];
  } catch (error) {
    if (isNotFoundResume(error)) {
      return [];
    }

    throw error;
  }
}

export async function getResume() {
  try {
    const response = await api.get("/member/profile");
    return normalizeProfileResponse(response.data);
  } catch (error) {
    if (isNotFoundResume(error)) {
      return null;
    }

    throw error;
  }
}

export async function createResume(payload) {
  const response = await api.post("/member/profile", payload);
  return response.data;
}

export async function updateResume(_resumeId, payload) {
  const response = await api.put("/member/profile", payload);
  return response.data;
}

export async function deleteResume() {
  const response = await api.delete("/member/profile");
  return response.data;
}

/* =========================
   Location
   현재 Swagger에 별도 Location API 없음.
   호출 구조만 유지하고 fallback 가능하게 빈 응답 반환.
========================= */

export async function getLocations() {
  return [];
}

export async function addLocation(_resumeId, payload) {
  return {
    status: "pending",
    data: payload,
    message: "Location API is not implemented on backend yet.",
  };
}

export async function deleteLocation() {
  return {
    status: "pending",
    message: "Location API is not implemented on backend yet.",
  };
}

/* =========================
   Submit
   현재 Swagger에 submit API 없음.
   프론트 상태 유지를 위해 호출 구조만 유지.
========================= */

export async function submitResume(resumeId) {
  return {
    status: "pending",
    resumeId,
    message: "Submit API is not implemented on backend yet.",
  };
}