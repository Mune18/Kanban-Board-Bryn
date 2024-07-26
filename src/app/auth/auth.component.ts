import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  isLoginMode = true;

  form = this.fb.group({
    fullName: [''], // Initialize empty for login
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: [''] // Initialize empty for login
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.updateValidators();
  }

  updateValidators() {
    if (this.isLoginMode) {
      this.form.get('fullName')?.clearValidators();
      this.form.get('confirmPassword')?.clearValidators();
    } else {
      this.form.get('fullName')?.setValidators(Validators.required);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
    }
    this.form.get('fullName')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }

  login(): void {
    if (this.form.valid) {
      const { email, password } = this.form.value;

      this.authService.login(email!, password!).subscribe({
        next: (response: any) => {
          if (response.token) {
            this.authService.saveToken(response.token);
            this.router.navigate(['/board']);
          } else {
            console.error('Invalid response format:', response);
          }
        },
        error: (err: any) => {
          console.error('Login failed', err);
        }
      });
    }
  }

  register(): void {
    if (
      this.form.valid &&
      this.form.value.password === this.form.value.confirmPassword
    ) {
      const { fullName, email, password } = this.form.value;

      this.authService.register(fullName!, email!, password!).subscribe({
        next: () => {
          this.router.navigate(['/auth']);
        },
        error: (err: any) => {
          console.error('Registration failed', err);
        }
      });
    } else {
      console.error('Passwords do not match or form is invalid');
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.updateValidators();
    this.form.reset();
  }
}
