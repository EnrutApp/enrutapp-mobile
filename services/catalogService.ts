import { apiClient, ApiResponse } from "./api";

export interface City {
  idCiudad: number;
  nombreCiudad: string;
  idDepartamento: number;
}

export interface Role {
  idRol: string;
  nombreRol: string;
  descripcion?: string;
  estado: boolean;
}

export interface DocumentType {
  idTipoDoc: string;
  nombreTipoDoc: string;
  descripcion?: string;
}

export const catalogService = {
  /**
   * Obtener lista de ciudades
   */
  getCities: async (): Promise<ApiResponse<City[]>> => {
    return apiClient.get<City[]>("/ciudades");
  },

  /**
   * Obtener lista de roles
   */
  getRoles: async (): Promise<ApiResponse<Role[]>> => {
    return apiClient.get<Role[]>("/roles");
  },

  /**
   * Obtener tipos de documento
   */
  getDocumentTypes: async (): Promise<ApiResponse<DocumentType[]>> => {
    return apiClient.get<DocumentType[]>("/tipos-documento");
  },
};

export default catalogService;
