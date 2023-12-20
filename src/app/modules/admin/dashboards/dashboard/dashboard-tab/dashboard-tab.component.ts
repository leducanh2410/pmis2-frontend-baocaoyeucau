import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef, createComponent } from '@angular/core';
import { DashboardTabService, Tab } from '.././dashboard-tab.service';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dashboard-tab',
  templateUrl: './dashboard-tab.component.html',
  styleUrls: ['./dashboard-tab.component.scss']
})

export class DashboardTabComponent implements OnInit {

    // Get the reference of the content area
    // @ViewChild('content', { read: ViewContainerRef }) content: ViewContainerRef;

    // // Declare the variables to store the tabs and the active tab id
    // tabs: Tab[];
    // activeTabId: string;
  
    constructor(
      // private dashboardTabsService: DashboardTabService, // Inject the tabs service
      // // Inject the component factory resolver
      // private viewContainerRef: ViewContainerRef
    ) { }
  
    ngOnInit(): void {
//       Subscribe to the tabs changes from the service
//       this.dashboardTabsService.getTabs().subscribe(tabs => {
//         this.tabs = tabs;
//       });
  
//       // Get the active tab id from the service
//       this.activeTabId = this.dashboardTabsService.getActiveTabId();
//     }
  
//     // Switch to a tab by id
//     switchTab(id: string) {
//       // Get the tab object by id from the service
//       const tab = this.dashboardTabsService.getTabById(id);
  
//       // Create a component instance from the tab component type
//       // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(tab.component);
//       // const componentRef = componentFactory.create(this.content.injector);
// const viewContainerRef = this.viewContainerRef.createComponent(tab.component)
  
//       // Clear the content area and insert the component instance
//       this.content.clear();
//       this.content.insert(viewContainerRef.hostView);
  
//       // Update the active tab id in the service and the component
//       this.dashboardTabsService.switchTab(id);
//       this.activeTabId = id;
//     }
  
//     // Remove a tab by id
//     removeTab(id: string, event: Event) {
//       // Prevent the click event from bubbling up to the tab label
//       event.stopPropagation();
  
//       // Remove the tab from the service
//       this.dashboardTabsService.removeTab(id);
  
//       // Get the active tab id from the service
//       this.activeTabId = this.dashboardTabsService.getActiveTabId();
//     }
//     addTab() {
//       // Generate a unique id for the new tab
//       const id = 'tab' + (this.tabs.length + 1);
  
//       // Create a new tab object with a label, a component, and some data
//       const newTab: Tab = {
//         id: id,
//         label: 'New Tab',
//         component: 'some-component',
//         data: {
//           input: 'some input',
//           output: 'some output'
//         }
//       };
  
//       // Add the new tab to the service
//       this.dashboardTabsService.addTab(newTab);
    }
tabs = ['First'];
  selected = new FormControl(0);

  addTab(selectAfterAdding: boolean) {
    this.tabs.push('New');

    if (selectAfterAdding) {
      this.selected.setValue(this.tabs.length - 1);
    }
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }
}
