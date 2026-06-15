import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Donante, DonanteResponse } from '../models/donante.model';
import { TicketsResponse, RandomTicketsResponse, SimpleResponse } from '../models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class RifaService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  crearDonante(datosDonante: Donante): Observable<DonanteResponse> {
    return this.http.post<DonanteResponse>(`${this.apiUrl}donantes`, datosDonante);
  }

  generaTicketsAleatorios(cantidad: number): Observable<RandomTicketsResponse> {
    return this.http.get<RandomTicketsResponse>(`${this.apiUrl}tickets/aleatorios/${cantidad}`);
  }

  asignarTicketsDonante(idDonante: number, nrosTickets: string[]): Observable<SimpleResponse> {
    return this.http.post<SimpleResponse>(`${this.apiUrl}ticket-donantes/asignar/${idDonante}`, nrosTickets);
  }

  listarTicketsXDonante(): Observable<TicketsResponse> {
    return this.http.get<TicketsResponse>(`${this.apiUrl}ticket-donantes`);
  }

  actualizarEstadoTicket(idTicket: number, estadoTicket: string): Observable<SimpleResponse> {
    return this.http.put<SimpleResponse>(`${this.apiUrl}tickets/${idTicket}`, { estadoTicket });
  }
}