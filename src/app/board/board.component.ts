import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskComponent } from '../task/task.component';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    DragDropModule,
    HttpClientModule,
    MatToolbarModule,
    TaskComponent,
    MatDialogModule
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  providers: [TaskService]
})
export class BoardComponent {
  columns = [
    {
      name: 'To Do',
      tasks: [] as Task[]
    },
    {
      name: 'In Progress',
      tasks: [] as Task[]
    },
    {
      name: 'Done',
      tasks: [] as Task[]
    }
  ];

  connectedTo: string[] = [];

  constructor(private taskService: TaskService, private dialog: MatDialog) {}

  ngOnInit() {
    this.taskService.getTasks().subscribe(tasks => {
      tasks.forEach(task => {
        const parsedDate = new Date(task.dueDate);
        if (!isNaN(parsedDate.getTime())) {
          task.dueDate = parsedDate; // Valid date
        } else {
          task.dueDate = new Date(); // Default to current date if invalid
        }
        
        const column = this.columns.find(col => col.name === task.status);
        column?.tasks.push(task);
      });
    });
  
    this.connectedTo = this.columns.map((_, index) => `cdk-drop-list-${index}`);
  }

  openAddTaskDialog(columnIndex: number) {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '250px',
      data: {
        task: {
          title: '',
          description: '',
          dueDate: '',
          status: this.columns[columnIndex].name,
          priority: 'Low'
        }
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newTask: Task = { 
          id: Date.now(), 
          title: result.title, 
          description: result.description, 
          dueDate: result.dueDate, 
          status: this.columns[columnIndex].name,
          priority: result.priority || 'Low'
        };
        this.columns[columnIndex].tasks.push(newTask);
        this.taskService.addTask(newTask).subscribe();
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>) {
    console.log('Drop event triggered');
    console.log('Event:', event);
  
    // Check if the drop was within the same container
    if (event.previousContainer === event.container) {
      console.log('Same container drag');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log('Different container drag');
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
  
      const task = event.container.data[event.currentIndex];
      console.log('Task moved:', task);
  
      const columnIndex = this.columns.findIndex(
        (column) => column.tasks === event.container.data
      );
      task.status = this.columns[columnIndex].name;
  
      // Update task on the backend
      this.taskService.updateTask(task).subscribe(
        (response) => {
          console.log('Task updated:', response);
        },
        (error) => {
          console.error('Update failed:', error);
        }
      );
    }
  }

  handleTaskDeleted(taskId: number, columnIndex: number): void {
    this.columns[columnIndex].tasks = this.columns[columnIndex].tasks.filter(task => task.id !== taskId);
  }
}
  