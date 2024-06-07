import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incidente',
  templateUrl: './incidente.page.html',
  styleUrls: ['./incidente.page.scss'],
})
export class IncidentePage implements OnInit {
  incident: any;

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadIncident();
  }

  async loadIncident() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        this.incident = await this.firebaseService.getDocument(`incidents/${id}`);
      } catch (error) {
        console.error('Error al cargar el incidente:', error);
      }
    }
  }

  async markAsRead() {
    if (this.incident && this.incident.id) {
      try {
        this.incident.status = 'read'; // Cambia el estado localmente para actualizar el color
        await this.firebaseService.updateDocument(`incidents/${this.incident.id}`, { status: 'read' });
        this.navigateToNotifications(); // Navega a notificaciones después de marcar como leído
      } catch (error) {
        console.error('Error al marcar como leído:', error);
      }
    }
  }

  navigateToNotifications() {
    this.router.navigate(['./main/notificaciones']).then(() => {
      window.location.reload();
    });
  }

  // Agrega este método en la clase IncidentePage
  async markAsFinished() {
    if (this.incident && this.incident.id) {
      try {
        this.incident.status = 'finalizado'; // Cambia el estado localmente para actualizar el color
        await this.firebaseService.updateDocument(`incidents/${this.incident.id}`, { status: 'finalizado' });
        this.navigateToNotifications(); // Navega a notificaciones después de marcar como finalizado
      } catch (error) {
        console.error('Error al marcar como finalizado:', error);
      }
    }
  }

}
