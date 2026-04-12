import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'DocForge — Dashboard'
  },
  {
    path: 'converter',
    loadComponent: () =>
      import('./pages/converter/converter.component').then(m => m.ConverterComponent),
    title: 'DocForge — Document Converter'
  },
  {
    path: 'image-editor',
    loadComponent: () =>
      import('./pages/image-editor/image-editor.component').then(m => m.ImageEditorComponent),
    title: 'DocForge — Image Editor'
  },
  {
    path: 'text-tools',
    loadComponent: () =>
      import('./pages/text-tools/text-tools.component').then(m => m.TextToolsComponent),
    title: 'DocForge — Text Tools'
  },
  {
    path: 'qr-code',
    loadComponent: () =>
      import('./pages/qr-code/qr-code.component').then(m => m.QrCodeComponent),
    title: 'DocForge — QR Code Generator'
  },
  {
    path: 'uuid-generator',
    loadComponent: () =>
      import('./pages/uuid-generator/uuid-generator.component').then(m => m.UuidGeneratorComponent),
    title: 'DocForge — UUID Generator'
  },
  {
    path: 'resume-builder',
    loadComponent: () =>
      import('./pages/resume-builder/resume-builder.component').then(m => m.ResumeBuilderComponent),
    title: 'DocForge — Resume Builder'
  },
  {
    path: 'invoice-generator',
    loadComponent: () =>
      import('./pages/invoice-generator/invoice-generator.component').then(m => m.InvoiceGeneratorComponent),
    title: 'DocForge — Invoice Generator'
  },
  {
    path: 'invitation-builder',
    loadComponent: () =>
      import('./pages/invitation-builder/invitation-builder.component').then(m => m.InvitationBuilderComponent),
    title: 'DocForge — Invitation Builder'
  },
  {
    path: 'emi-calculator',
    loadComponent: () =>
      import('./pages/emi-calculator/emi-calculator.component').then(m => m.EmiCalculatorComponent),
    title: 'DocForge — EMI Calculator'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
