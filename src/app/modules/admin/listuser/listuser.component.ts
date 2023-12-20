import { AfterViewInit, OnDestroy, OnInit, Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

@Component({
  selector: 'app-api',
  templateUrl: './listuser.component.html',
  styleUrls: ['./listuser.component.css']
})
export class ListUserComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('drawer') drawer: MatDrawer;
  drawerMode: 'over' | 'side' = 'side';
  drawerOpened: boolean = true;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _fuseMediaWatcherService: FuseMediaWatcherService
  ) {
  }

  ngAfterViewInit() {
  }
  ngOnInit() {
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {

        // Set the drawerMode and drawerOpened if the given breakpoint is active
        if (matchingAliases.includes('md')) {
          this.drawerMode = 'side';
          this.drawerOpened = true;
        }
        else {
          this.drawerMode = 'over';
          this.drawerOpened = false;
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}