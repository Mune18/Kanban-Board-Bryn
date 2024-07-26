import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { TaskService } from '../task.service';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { Task } from '../task.model';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    DatePipe
  ],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class TaskComponent {
  @Input() task!: Task;
  @Input() columnIndex!: number;  // Add this line to receive the column index
  @Output() taskDeleted = new EventEmitter<number>();  // Add this line to emit the task ID when deleted
  taskDueDate: Date | null = null;

  ngOnInit() {
    // Log the date to verify its format
    console.log('Task Due Date:', this.task.dueDate);
  }

  constructor(public dialog: MatDialog, private taskService: TaskService, private snackBar: MatSnackBar) { }

  editTask(): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '250px',
      data: { ...this.task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        Object.assign(this.task, result);
        this.taskService.updateTask(this.task).subscribe();
      }
    });
  }

  deleteTask(): void {
    this.taskService.deleteTask(this.task.id).subscribe(() => {
      this.snackBar.open('Task deleted successfully', 'Close', {
        duration: 3000,
      });
      this.taskDeleted.emit(this.task.id);  // Emit the task ID when deleted
    });
  }
}
