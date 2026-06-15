export interface Donante {
  nombreCompleto: string;
  apodo?: string;
  email: string;
  celular: string;
}

export interface DonanteResponse {
  status: string;
  message: string;
  idSecuencial: number;
}