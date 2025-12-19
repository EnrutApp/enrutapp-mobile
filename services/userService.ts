import { apiClient, ApiResponse } from "./api";
import { User } from "./authService";

export interface UpdateUserDto {
  nombre?: string;
  telefono?: string;
  direccion?: string;
  idCiudad?: number;
  tipoDoc?: string;
  idRol?: string;
  numDocumento?: string;
}

export const userService = {
  /**
   * Actualizar información del usuario
   */
  updateUser: async (
    idUsuario: string,
    data: UpdateUserDto
  ): Promise<ApiResponse<User>> => {
    return apiClient.put<User>(`/usuarios/${idUsuario}`, data);
  },

  /**
   * Obtener usuario por ID
   */
  getUserById: async (idUsuario: string): Promise<ApiResponse<User>> => {
    return apiClient.get<User>(`/usuarios/${idUsuario}`);
  },
};

export default userService;
