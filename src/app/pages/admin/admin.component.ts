import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RifaService } from '../../core/services/rifa.service';
import { TicketDonante } from '../../core/models/ticket.model';

// Definimos un tipo para las severidades permitidas
type Severidad = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | null | undefined;

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    CardModule,
    BadgeModule,
    ConfirmDialogModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  private rifaService = inject(RifaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  //modulos = signal<Modulo[]>([]);
  tickets = signal<TicketDonante[]>([]);
  loading = false;
  dialogVisible = false;
  selectedTicket: TicketDonante | null = null;

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets() {
    this.loading = true;
    this.rifaService.listarTicketsXDonante().subscribe({
      next: (resp) => {
        this.tickets.set(resp.data);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los tickets: ' + (err.error?.message || err.message)
        });
      }
    });
  }

  abrirDialog(ticket: TicketDonante) {
    this.selectedTicket = ticket;
    this.dialogVisible = true;
  }

  cambiarEstado(estado: string) {
    if (!this.selectedTicket) return;

    this.confirmationService.confirm({
      message: `¿Estás seguro de cambiar el estado del ticket ${this.selectedTicket.nroTicket} a ${estado === 'BLQ' ? 'BLOQUEADO' : 'DISPONIBLE'}?`,
      header: 'Confirmar cambio',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.rifaService.actualizarEstadoTicket(this.selectedTicket!.idTicket, estado).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: `Ticket ${this.selectedTicket!.nroTicket} actualizado a ${estado}`
            });
            this.dialogVisible = false;
            this.cargarTickets();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar: ' + (err.error?.message || err.message)
            });
          }
        });
      }
    });
  }

  getEstadoSeverity(estado: string): Severidad {
    switch(estado) {
      case 'BLQ': return 'danger';
      case 'RES': return 'warn';
      default: return 'secondary';
    }
  }

  getEstadoLabel(estado: string): string {
    switch(estado) {
      case 'BLQ': return 'Bloqueado';
      case 'RES': return 'Reservado';
      default: return 'Disponible';
    }
  }
}