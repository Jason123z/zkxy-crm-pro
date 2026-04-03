const BASE_URL = '/api/v1';

// Determine if we are in admin mode based on URL
const isAdmin = () => window.location.pathname.startsWith('/admin');
const getPrefix = () => isAdmin() ? 'crm_admin_' : 'crm_sales_';

export const getAuthToken = () => sessionStorage.getItem(`${getPrefix()}token`);
export const setAuthToken = (token: string) => sessionStorage.setItem(`${getPrefix()}token`, token);
export const removeAuthToken = () => {
  sessionStorage.removeItem(`${getPrefix()}token`);
  sessionStorage.removeItem(`${getPrefix()}current_page`);
};

async function handleResponse(response: Response) {
  if (response.status === 401) {
    removeAuthToken();
    window.location.reload();
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = 'API request failed';
    if (errorData.detail) {
      if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((err: any) => `${err.loc?.join('.') || 'Field'}: ${err.msg}`).join(', ');
      } else if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else {
        errorMessage = JSON.stringify(errorData.detail);
      }
    }
    throw new Error(errorMessage);
  }
  return await response.json();
}

export const api = {
  get: async (endpoint: string) => {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  post: async (endpoint: string, body: any) => {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  put: async (endpoint: string, body: any) => {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },

  delete: async (endpoint: string) => {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Specialized login for OAuth2 password form compatibility
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    return handleResponse(response);
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return await api.post('/auth/change-password', { 
      current_password: currentPassword, 
      new_password: newPassword 
    });
  }
};
