import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RifaService } from '../../core/services/rifa.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    CardModule,
    ToastModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  private rifaService = inject(RifaService);
  private messageService = inject(MessageService);

  isLoading = false;

  formulario = this.fb.group({
    cantidadBoletos: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    apodo: [''],
    email: ['', [Validators.required, Validators.email]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^[0-9+]{8,15}$/)]]
  });

  onSubmit() {
    if (this.formulario.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario inválido',
        detail: 'Por favor completa todos los campos correctamente.'
      });
      return;
    }

    const cantidad = this.formulario.value.cantidadBoletos!;
    const datosDonante = {
      nombre: this.formulario.value.nombre!,
      apodo: this.formulario.value.apodo || '',
      email: this.formulario.value.email!,
      whatsapp: this.formulario.value.whatsapp!
    };

    this.isLoading = true;

    // 1. Generar tickets aleatorios
    this.rifaService.generaTicketsAleatorios(cantidad).subscribe({
      next: (ticketsResp) => {
        const tickets = ticketsResp.data;
        
        // 2. Crear donante
        this.rifaService.crearDonante(datosDonante).subscribe({
          next: (donanteResp) => {
            const idDonante = donanteResp.idSecuencial;
            
            // 3. Asignar tickets al donante
            this.rifaService.asignarTicketsDonante(idDonante, tickets).subscribe({
              next: () => {
                this.isLoading = false;
                this.messageService.add({
                  severity: 'success',
                  summary: '¡Éxito!',
                  detail: `Se generaron y asignaron ${tickets.length} boletos: ${tickets.join(', ')}. ¡Gracias por ayudar a Tino!`
                });
                this.formulario.reset({ cantidadBoletos: 1 });
              },
              error: (err) => {
                this.isLoading = false;
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error al asignar tickets',
                  detail: err.error?.message || 'No se pudieron asignar los boletos. Intenta nuevamente.'
                });
              }
            });
          },
          error: (err) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error al registrar datos',
              detail: err.error?.message || 'No se pudo crear el registro del donante.'
            });
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error al generar tickets',
          detail: err.error?.message || 'No se pudieron generar los boletos. Puede que no haya suficientes disponibles.'
        });
      }
    });
  }
}