import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RifaService } from '../../core/services/rifa.service';
import { MessageModule } from 'primeng/message';

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
    ProgressSpinnerModule,
    ConfirmDialogModule,
    MessageModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private fb = inject(FormBuilder);
  private rifaService = inject(RifaService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  nrosBoletos = signal("");

  isLoading = false;

  formulario = this.fb.group({
    cantidadBoletos: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    nombre: ['', [Validators.required, Validators.minLength(6)]],
    apodo: [''],
    email: ['', [Validators.required, Validators.email]],
    whatsapp: ['', [Validators.required, Validators.pattern(/^[0-9+]{8,15}$/)]]
  });

  premios(event: Event) {
    let premios = "1. Cocina de inducción, 4 hornillas y horno (valorada en $500) <br>";
    premios += "2. Hermoso traje de danza árabe (valorado en $200) <br>";
    premios += "3. Una cámara para vigilar a tu mascota cuando no estés en casa (valorada en $70)<br>";
    premios += "4. Una profilaxis profunda ultrasónica y fluorización ó exfoliación (valorada en $40)<br>";
    premios += "5. 4 clases de pole dance (valoradas en $45)<br>";
    premios += "6. 4 clases de heels dance (valoradas en $45)<br>";
    premios += "7. Sesión fotográfica del ganador y su mascota (valorada en $70)<br>";
    premios += "8. Lecciones de violonchelo (valoradas en $50)<br>";
    premios += "9. Lecciones de guitarra (valoradas en $50)<br>";
    premios += "10. Una fotografía impresa de El Panecillo y sus alrededores (valorada en $50)<br>";
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: "Los premios son:",
      message: premios,
      rejectLabel: 'Cancelar',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: "Aceptar",
        severity: 'secondary'
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.formulario.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    switch (controlName) {
      case 'cantidadBoletos':
        if (errors['required']) return 'El número de boletos es obligatorio.';
        if (errors['min']) return 'Debe ser al menos 1 boleto.';
        if (errors['max']) return 'Máximo 10 boletos.';
        break;
      case 'nombre':
        if (errors['required']) return 'El nombre es obligatorio.';
        if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
        break;
      case 'email':
        if (errors['required']) return 'El email es obligatorio.';
        if (errors['email']) return 'Formato de email inválido.';
        break;
      case 'whatsapp':
        if (errors['required']) return 'El WhatsApp es obligatorio.';
        if (errors['pattern']) return 'Solo números y +, entre 8 y 15 caracteres.';
        break;
      default:
        return 'Campo inválido.';
    }
    return '';
  }

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
      nombreCompleto: this.formulario.value.nombre!,
      apodo: this.formulario.value.apodo || '',
      email: this.formulario.value.email!,
      celular: this.formulario.value.whatsapp!
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
                if (tickets.length === 1) {
                  this.nrosBoletos.set('El número de tu boleto es el: ' + tickets[0]);
                } else {
                  this.nrosBoletos.set('Los números de tus boletos son: ' + tickets.join(', '));
                }
                this.formulario.reset({ cantidadBoletos: 1 });
                /*setTimeout(() => {
                  this.nrosBoletos.set('');
                }, 15000);*/
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