import { readJson, writeJson, readString, writeString } from "./careerDataService.js";

export const USER_PROFILE_KEY = "articlue_user_profile";
export const PROFILE_NAME_KEY = "articlue_profile_name";
export const PROFILE_IMAGE_KEY = "articlue_profile_image";
export const CURRENT_USER_KEY = "articlue_current_user";
export const THEME_KEY = "articlue-theme";

export const EMPTY_USER_PROFILE = {
  name: "",
  nickname: "",
  email: "",
  phone: "",
  birth: "",
  postcode: "",
  address: "",
  baseAddress: "",
  detailAddress: "",
  gender: "",
  military: "",
};

export function getCurrentUser() {
  return readJson(CURRENT_USER_KEY, null);
}

export function getUserProfile() {
  const currentUser = getCurrentUser();
  const savedProfile = readJson(USER_PROFILE_KEY, {});

  return {
    ...EMPTY_USER_PROFILE,
    name:
      savedProfile?.name ||
      readString(PROFILE_NAME_KEY, "") ||
      currentUser?.name ||
      "사용자",
    nickname: savedProfile?.nickname || currentUser?.nickname || "",
    email: savedProfile?.email || currentUser?.email || "",
    phone: savedProfile?.phone || currentUser?.phone || "",
    birth: savedProfile?.birth || currentUser?.birth || "",
    postcode: savedProfile?.postcode || currentUser?.postcode || "",
    address: savedProfile?.address || currentUser?.address || "",
    baseAddress:
      savedProfile?.baseAddress ||
      currentUser?.baseAddress ||
      savedProfile?.address ||
      currentUser?.address ||
      "",
    detailAddress:
      savedProfile?.detailAddress || currentUser?.detailAddress || "",
    gender: savedProfile?.gender || currentUser?.gender || "",
    military: savedProfile?.military || currentUser?.military || "",
  };
}

export function saveUserProfile(profile) {
  writeJson(USER_PROFILE_KEY, profile);

  if (profile?.name) {
    writeString(PROFILE_NAME_KEY, profile.name);
  }
}

export function getProfileImage() {
  return readString(PROFILE_IMAGE_KEY, "");
}

export function saveProfileImage(imageDataUrl) {
  writeString(PROFILE_IMAGE_KEY, imageDataUrl);
}

export function getTheme() {
  return readString(THEME_KEY, "light");
}

export function saveTheme(theme) {
  writeString(THEME_KEY, theme);
}