import { AfterViewInit, OnDestroy, OnInit, Component, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

@Component({
  selector: 'component-NhomDuLieu',
  templateUrl: './nhomdulieu.component.html',
  styleUrls: ['./nhomdulieu.component.css']
})
export class NhomDuLieuComponent implements OnInit, OnDestroy, AfterViewInit {
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor() {
  }

  ngAfterViewInit() {
  }
  ngOnInit() {

  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

}