export interface TicketDonante {
  estadoTicket: string;
  idDonante: number;
  idTicket: number;
  idTicketXDonante: number;
  nombreDonante: string;
  nroTicket: string;
}

export interface TicketsResponse {
  status: string;
  message: string;
  data: TicketDonante[];
}

export interface RandomTicketsResponse {
  status: string;
  message: string;
  data: string[];
}

export interface SimpleResponse {
  status: string;
  message: string;
  idSecuencial?: number;
}