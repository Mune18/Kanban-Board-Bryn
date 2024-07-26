// src/app/edit-task-dialog/edit-task-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { Task } from '../task.model';

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatSelectModule,
  ],
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css'],
})

export class EditTaskDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public task: Task
  ) {
    // Convert dueDate to Date object for date picker if it's a valid string
    if (typeof this.task.dueDate === 'string') {
      const date = new Date(this.task.dueDate);
      this.task.dueDate = isNaN(date.getTime()) ? new Date() : date; // Default to current date if invalid
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Ensure dueDate is a Date object before converting to string
    if (this.task.dueDate instanceof Date) {
      this.task.dueDate = this.task.dueDate.toISOString(); // Convert Date to ISO string
    }
    this.dialogRef.close(this.task);
  }
}
