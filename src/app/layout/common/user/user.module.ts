import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UserComponent } from 'app/layout/common/user/user.component';
import { SharedModule } from 'app/shared/shared.module';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { AuthResetPasswordModule } from 'app/modules/auth/reset-password/reset-password.module';

@NgModule({
    declarations: [
        UserComponent,
        ChangePasswordDialogComponent
    ],
    imports     : [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        MatDialogModule,
        SharedModule,
        AuthResetPasswordModule
    ],
    exports     : [
        UserComponent
    ]
})
export class UserModule
{
}
