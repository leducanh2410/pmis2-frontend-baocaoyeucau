import { Route } from '@angular/router';
import { Error401Component } from 'app/modules/admin/pages/error/error-401/error-401.component';

export const error401Routes: Route[] = [
    {
        path     : '',
        component: Error401Component
    }
];
