import { Injectable } from '@angular/core';
import { FileSaverService as NgxFileSaverService } from 'ngx-filesaver';
@Injectable({
  providedIn: 'root'
})
export class FileSaverService {

  constructor(
    private _fileSaverService: NgxFileSaverService
  ) { }

  downloadFile(base64Data: any, fileName: string, type: string): void {
    const byteStr = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteStr.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteStr.length; i++) {
        int8Array[i] = byteStr.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: type })
    this._fileSaverService.save(blob, fileName);
  }
}
