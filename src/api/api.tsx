import axios, { AxiosRequestConfig } from "axios";
const globalUrl = "https://ajempire-backend.vercel.app/api";
export const getData = async (url: string, config?: AxiosRequestConfig) =>
  axios.get(`${globalUrl}${url}`, config);
export const postData = async (url: string, data: unknown, config?: AxiosRequestConfig) =>
  axios.post(`${globalUrl}${url}`, data, config);
export const updateData = async (url: string, data: unknown, config: object) =>
  axios.patch(`${globalUrl}${url}`, data, config);
export const deleteData = async (url: string, config: object) =>
  axios.delete(`${globalUrl}${url}`, config);
