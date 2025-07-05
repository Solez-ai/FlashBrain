import { apiRequest } from "./queryClient";

export async function apiGet(url: string) {
  const response = await apiRequest("GET", url);
  return response.json();
}

export async function apiPost(url: string, data: any) {
  const response = await apiRequest("POST", url, data);
  return response.json();
}

export async function apiPut(url: string, data: any) {
  const response = await apiRequest("PUT", url, data);
  return response.json();
}

export async function apiDelete(url: string) {
  const response = await apiRequest("DELETE", url);
  return response.status === 204 ? null : response.json();
}
