import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AbmAlumnosComponent } from './abm-alumnos/abm-alumnos.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmacionComponent } from 'src/app/shared/dialog/dialog-confirmacion/dialog-confirmacion.component';
import { AlumnosService } from './Services/alumnos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

export interface Alumno {
  nombre: string;
  apellido: string;
  email: string;
  numeroDocumento: number;
  fechaDeAlta: Date;
}

/**
 * @title Lista de alumnos
 */
@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.scss'],
})
export class AlumnosComponent implements AfterViewInit {
  dataSource = new MatTableDataSource();

  displayedColumns: string[] = [
    'nombreCompleto',
    'email',
    'numeroDocumento',
    'fechaDeAlta',
    'opcionesDelete',
    'opcionesEdit',
    'opcionesDetalle',
  ];

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  alumnosSuscription: Subscription | null = null;
  
  constructor(
    private matDialog: MatDialog,
    private alumnosService: AlumnosService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    // this.alumnosService.obtenerAlumnos().subscribe((alumnos) => {
    //   this.dataSource.data = alumnos;
    // });
  }
  ngOnDestroy(): void {
    this.alumnosSuscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.alumnosSuscription = this.alumnosService.obtenerAlumnos().subscribe({
      next: (alumnos) => {
        this.dataSource.data = alumnos;
      },
    });
  }
  abrirABMAlumnos(): void {
    const dialog = this.matDialog.open(AbmAlumnosComponent);
    dialog.afterClosed().subscribe((valor) => {
      if (valor) {
        this.alumnosService.crearAlumno(valor);
        // this.dataSource.data = [
        //   { ...valor, fechaDeAlta: new Date() },
        //   ...this.dataSource.data,
        //   ,
        // ];
      }
    });
  }

  eliminar(alumnoAEliminar: Alumno): void {
    alumnoAEliminar={...alumnoAEliminar,fechaDeAlta: new Date()}
    const dialogRef = this.matDialog.open(DialogConfirmacionComponent, {
      data: {
        message:
          'Está seguro que desea eliminar el registro del empleado: ' +
          alumnoAEliminar.apellido +
          ', ' +
          alumnoAEliminar.nombre +
          '?',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.alumnosService.eliminarAlumno(alumnoAEliminar);
        // this.dataSource.data = this.dataSource.data.filter(
        //   (alumnoActual) =>
        //     alumnoActual.numeroDocumento !== alumnoAEliminar.numeroDocumento
        // );
      }
    });
  }

  editar(alumnoAEditar: Alumno): void {
    const dialog = this.matDialog.open(AbmAlumnosComponent, {
      data: {
        alumnoAEditar,
      },
    });
    dialog.afterClosed().subscribe((valorDelFormulario) => {
      if (valorDelFormulario) {
        this.alumnosService.editarAlumno(alumnoAEditar.numeroDocumento,valorDelFormulario);
        // this.dataSource.data = this.dataSource.data.map((alumnoActual) =>
        //   alumnoActual.numeroDocumento === alumnoAEditar.numeroDocumento
        //     ? { ...alumnoActual, ...valorDelFormulario } 
        //     : alumnoActual
        // );
      }
    });
  }
  detalle(alumnoId: number): void {
    this.router.navigate([alumnoId], {
      relativeTo: this.activatedRoute,
    });
  }
}
