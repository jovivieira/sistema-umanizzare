const BASE_URL = "http://147.93.9.44:8002";

function getHeaders(contentTypeJson = true) {
  const token = localStorage.getItem("@Umanizzare:token");
  const headers: Record<string, string> = {};
  if (contentTypeJson) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const apiService = {

  // LOGIN
  async login(body: object) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "E-mail ou senha incorretos.");
    return data;
  },

  // REGISTRO
  async register(body: object) {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao realizar o cadastro mestre.");
    return data;
  },

  // LISTAR USUARIOS
 // LISTAR USUARIOS
async getUsers() {
  const response = await fetch(`${BASE_URL}/users?limit=9999`, {
    method: "GET",
    headers: getHeaders(true),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erro ao carregar usuários.");
  return data;
},

  // BUSCAR USUARIO POR ID
  async getUserById(id: string) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao buscar usuário.");
    return data;
  },

  // ALTERAR ROLE
  async updateUserRole(id: string, role: "USER" | "ADMIN") {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Erro ao atualizar permissão.");
    }
    return true;
  },

  // ATUALIZAR USUARIO
  async updateUser(id: string, body: object) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Erro ao atualizar usuário.");
    return data;
  },

  // DELETAR USUARIO
  async deleteUser(id: string) {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(false),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Erro ao deletar usuário.");
    }
    return true;
  },



// BUSCAR PERFIL
async getProfile() {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: getHeaders(true),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erro ao buscar perfil.");
  return data;
},

// ATUALIZAR PERFIL
async updateProfile(body: object) {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "PATCH",
    headers: getHeaders(true),
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erro ao atualizar perfil.");
  return data;
},

// UPLOAD FOTO
async uploadProfilePicture(file: File) {
  const token = localStorage.getItem("@Umanizzare:token");
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`${BASE_URL}/profile/picture`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erro ao enviar foto.");
  return data;
},

// DELETAR FOTO
async deleteProfilePicture() {
  const response = await fetch(`${BASE_URL}/profile/picture`, {
    method: "DELETE",
    headers: getHeaders(false),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Erro ao deletar foto.");
  }
  return true;
},
};