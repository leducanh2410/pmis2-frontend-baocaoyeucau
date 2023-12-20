import { HttpClient } from "@angular/common/http";
import { OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Observable, of } from "rxjs";
import { ServiceService } from "../service/service.service";
import { StateAth } from "./conmon.types";

export class BaseService {
    constructor(
        public _serviceService: ServiceService) {

    }

}