import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from './task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost/kanban-board2/API/task.php';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, { headers: this.authService.getAuthHeaders() });
  }

  addTask(task: Task): Observable<any> {
    return this.http.post(this.apiUrl, task, { headers: this.authService.getAuthHeaders() });
  }

  updateTask(task: Task): Observable<any> {
    return this.http.put(this.apiUrl, task, { headers: this.authService.getAuthHeaders() });
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(this.apiUrl, { 
      headers: this.authService.getAuthHeaders(),
      body: { id }
    });
  }
}
