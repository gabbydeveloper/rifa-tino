export interface Donante {
  nombre: string;
  apodo?: string;
  email: string;
  whatsapp: string;
}

export interface DonanteResponse {
  status: string;
  message: string;
  idSecuencial: number;
}