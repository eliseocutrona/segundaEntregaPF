import { Component, OnInit } from '@angular/core';
import { Alumno } from '../alumnos.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AlumnosService } from '../Services/alumnos.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionService } from '../../inscripciones/Services/inscripcion.service';
import { Inscripcion } from '../../inscripciones/inscripciones.component';
import { DialogConfirmacionComponent } from 'src/app/shared/dialog/dialog-confirmacion/dialog-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-detalleAlumnos',
  templateUrl: './detalleAlumnos.component.html',
  styleUrls: ['./detalleAlumnos.component.scss'],
})
export class DetalleAlumnosComponent implements OnInit {
  displayedColumns: string[] = [
    'nombreCurso',
    'fechaInicioCurso',
    'fechaFinCurso',
    'opcionesDelete',
  ];
  dataSource = new MatTableDataSource<Inscripcion>();

  alumno: Alumno | undefined;
  //inscripcion: any;
  inscripcionSuscription: Subscription | null = null;
  private destroyed$ = new Subject();

  nombreControl = new FormControl();
  apellidoControl = new FormControl();
  emailControl = new FormControl();
  nroDocumentoControl = new FormControl();

  alumnosDetalleForms = new FormGroup({
    nombre: this.nombreControl,
    apellido: this.apellidoControl,
    email: this.emailControl,
    nroDocumento: this.nroDocumentoControl,
  });
  constructor(
    private activatedRoute: ActivatedRoute,
    private alumnosService: AlumnosService,
    private inscripcionService: InscripcionService,
    private matDialog: MatDialog
  ) {
     this.alumnosService
       .obtenerAlumnoPorId(
         parseInt(this.activatedRoute.snapshot.params['nroDocumento'])
       )
       .pipe(takeUntil(this.destroyed$))
       .subscribe((alumno) => (this.alumno = alumno));
     this.nombreControl.setValue(this.alumno?.nombre);
     this.apellidoControl.setValue(this.alumno?.apellido);
     this.emailControl.setValue(this.alumno?.email);
     this.nroDocumentoControl.setValue(this.alumno?.numeroDocumento);

      if (this.alumno) {
        this.inscripcionService
          //.obtenerCursosDeAlumno(this.alumno.numeroDocumento)
          .obtenerAlumnos()
          .subscribe((inscripciones) => {
            this.dataSource.data = inscripciones;
          });
      }
  }

  ngOnDestroy(): void {
   this.destroyed$.next(true);
   this.inscripcionSuscription?.unsubscribe();
  }
   ngOnInit(): void {
    // this.inscripcionSuscription = this.inscripcionService.obtenerAlumnosPorCurso(parseInt(this.activatedRoute.snapshot.params['id'])).subscribe({
    //   next: (cursos) => {
    //     this.dataSource.data = cursos;
    //   },
    // }); 
    this.inscripcionSuscription = this.inscripcionService.obtenerInscripcion().subscribe({
      next: (inscripciones) => {
        this.dataSource.data = inscripciones;
      },
    });    
  }

  eliminar(alumnoAEliminar: Inscripcion): void {
    const dialogRef = this.matDialog.open(DialogConfirmacionComponent, {
      data: {
        message:
          'Está seguro que desea dar de baja la inscripción del curso: ' +
          alumnoAEliminar.nombreCurso +
          '?',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
         this.inscripcionService.eliminarInscripcion(alumnoAEliminar)
        //  this.dataSource.data = this.dataSource.data.filter(
        //    (alumnoActual) =>
        //      alumnoActual.numeroDocumentoAlumno !==
        //      alumnoAEliminar.numeroDocumentoAlumno
        //  );
      }
    });
  }
}
