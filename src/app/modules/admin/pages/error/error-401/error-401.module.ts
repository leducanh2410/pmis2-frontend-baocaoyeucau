import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Error401Component } from 'app/modules/admin/pages/error/error-401/error-401.component';
import { error401Routes } from 'app/modules/admin/pages/error/error-401/error-401.routing';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@NgModule({
    declarations: [
        Error401Component
    ],
    imports: [
        RouterModule.forChild(error401Routes), MatIconModule,MatButtonModule
    ]
})
export class Error401Module {
}
