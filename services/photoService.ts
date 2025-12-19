import { apiClient, ApiResponse } from "./api";

export const photoService = {
  /**
   * Subir foto de perfil
   */
  uploadProfilePhoto: async (uri: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    
    // Preparar el archivo para subir
    const filename = uri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    // @ts-ignore - React Native FormData espera un objeto con uri, name y type
    formData.append("file", {
      uri,
      name: filename,
      type,
    });

    return apiClient.upload("/auth/foto", formData, "PATCH");
  },

  /**
   * Eliminar foto de perfil
   */
  deleteProfilePhoto: async (): Promise<ApiResponse<void>> => {
    return apiClient.delete("/auth/foto");
  },
};

export default photoService;
