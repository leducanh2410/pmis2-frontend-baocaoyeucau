import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginator } from './core/config/CustomPaginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_SELECTSEARCH_DEFAULT_OPTIONS, MatSelectSearchOptions } from 'ngx-mat-select-search';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-alt-snotify';
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ErrorCatchingInterceptor } from './core/interceptor/error-catching.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { HttpXsrfInterceptor } from './core/interceptor/http-xsrf.interceptor';
import { DEFAULT_TIMEOUT, TimeoutInterceptor } from './core/interceptor/timeout.interceptor';
import { Chart } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

const routerConfig: ExtraOptions = {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled'
};

@NgModule({
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: HttpXsrfInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorCatchingInterceptor, multi: true },
        { provide: DEFAULT_TIMEOUT, useValue: 30000 },

        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                coreLibraryLoader: () => import('highlight.js/lib/core'),
                lineNumbersLoader: () => import('highlightjs-line-numbers.js'), // Optional, only if you want the line numbers
                languages: {
                    sql: () => import('highlight.js/lib/languages/sql'),
                }
            }
        },
        {
            provide: MatPaginatorIntl,
            useClass: CustomPaginator
        }, 
        {
            provide: MAT_SELECTSEARCH_DEFAULT_OPTIONS,
            useValue: <MatSelectSearchOptions>{
                closeSvgIcon: "mat_outline:clear",
                noEntriesFoundLabel: 'Không có dữ liệu',
            }
        }, 
        { provide: 'SnotifyToastConfig', useValue: ToastDefaults },
        SnotifyService
    ],
    declarations: [
        AppComponent,
       
    ],
    imports: [
        MatSelectModule, MatAutocompleteModule, SnotifyModule, FormsModule, DragDropModule,
        BrowserModule, HighlightModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),
        MatTabsModule,
        // Fuse, FuseConfig & FuseMockAPI
        FuseModule,
        FuseConfigModule.forRoot(appConfig),
        FuseMockApiModule.forRoot(mockApiServices),

        // Core module of your application
        CoreModule,

        // Layout module of your application
        LayoutModule,
        // 3rd party modules that require global configuration via forRoot
        MarkdownModule.forRoot({}),
        HttpClientModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'PMIS2-BCTC-XSRF-TOKEN',
            headerName: 'X-PMIS2-BCTC-CSRF-TOKEN'
        })
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
