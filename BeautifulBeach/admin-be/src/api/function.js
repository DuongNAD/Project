import { data } from "react-router-dom";
import api from "./api";

export const login = (data) => api.post("login", data);
export const region = () => api.get("admin/region");
export const searchRegion = (keyword) =>
  api.get("admin/region?search=" + keyword);
export const searchBeaches = (keyword) =>
  api.get("admin/beaches?search=" + keyword);
export const searchAccount = (keyword) =>
  api.get("admin/account-list?search=" + keyword);

export const addRegion = (data) => api.post("admin/region", data);
export const updateRegion = (data, id) => api.post("admin/region/" + id, data);
export const deleteRegion = (id) => api.delete("admin/region/" + id);
export const beaches = () => api.get("admin/beaches");
export const addBeaches = (data) =>
  api.post("admin/beaches", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updateBeaches = (data, id) =>
  api.post("admin/beaches/" + id, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const deleteBeache = (id) => api.delete("admin/beaches/" + id);
export const url = process.env.REACT_APP_API_URL;
export const loginAccout = (data) => api.post("login-account", data);
export const accounts = () => api.get("admin/account-list");
export const accountsStatus = (data) => api.post("admin/account-list", data);

export const sentOtpPass = (data) => api.post("customer/sent-otp", data);
export const vefifyOtp = (data) => api.post("customer/change-otp", data);
export const vefifyPass = (data) => api.post("customer/change-password", data);
export const registerAccount = (data) =>
  api.post("account/change-otp", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const vefifyAccount = (data) => api.post("account/verify-account", data);
export const listBeachesHome = () => api.get("list-beaches");
export const ImageBannerAdmin = () => api.get("admin/image-banner");
export const commentManage = () => api.get("admin/comment");
export const commentUpdate = (data) => api.post("admin/comment", data);

export const detailBeaches = (id) => api.get("beaches?id=" + id);
export const ImageBannerAdminAdd = (data) =>
  api.post("admin/image-banner", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const ImageBannerAdminUpdate = (data, id) =>
  api.post("admin/image-banner/" + id, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const ImageBanner = (type) => api.get("list-banner?type=" + type);
export const commentApi = (data) => api.post("customer/comment", data);
export const commentList = (idBeaches) =>
  api.get("list-comment?id=" + idBeaches);
export const commentListHome = () => api.get("list-comment");
export const timeAgo = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};
export const favoritesAdd = (idBeache) =>
  api.post("customer/favorites", { beach_id: idBeache });
export const favoritesDelete = (idBeache) =>
  api.delete("customer/favorites?beach_id=" + idBeache);
export const favoritesCheck = (idBeache) =>
  api.get("customer/check-favorites?beach_id=" + idBeache);
export const listBeachesRegion = (id) =>
  api.get("list-beaches-region?id=" + id);
export const listRegion = () => api.get("list-regions");
export const listRegionBeaches = (id) => {
  if (id != null) {
    return api.get(`list-beaches?region=${id}`);
  } else {
    return api.get("list-beaches");
  }
};
export const favorites = () => api.get("customer/favorites");
export const listRegionBeachesKeyword = (keyword) => {
  if (keyword != null) {
    return api.get(`list-beaches?keyword=${keyword}`);
  } else {
    return api.get("list-beaches");
  }
};
export const visitAdd = () => api.post("visit");
export const visitTotal = () => api.get("visit");
export const accountDetal = () => api.get("customer/account");
export const accountUpdate = (data) =>
  api.post("customer/update-account", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  