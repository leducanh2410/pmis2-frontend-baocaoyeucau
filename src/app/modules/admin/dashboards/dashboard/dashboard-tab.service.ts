import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Define an interface for the tab object
export interface Tab {
  id: string; // A unique identifier for the tab
  label: string; // The text to display on the tab header
  component: any; // The component type to load in the tab content
  data?: any; // Any additional data for the tab, such as inputs or outputs
}

@Injectable({
  providedIn: 'root'
})
export class DashboardTabService {

  private tabs: Tab[] = [];

  // A subject to emit the tabs changes
  private tabsSubject = new Subject<Tab[]>();

  // A property to store the active tab id
  private activeTabId: string;

  constructor() { }

  // A method to get the tabs as an observable
  getTabs() {
    return this.tabsSubject.asObservable();
  }

  // A method to add a new tab
  addTab(tab: Tab) {
    // Push the new tab to the tabs array
    this.tabs.push(tab);

    // Emit the tabs changes
    this.tabsSubject.next(this.tabs);

    // Switch to the new tab
    this.switchTab(tab.id);
  }

  // A method to remove a tab by id
  removeTab(id: string) {
    // Find the index of the tab to remove
    const index = this.tabs.findIndex(tab => tab.id === id);

    // Remove the tab from the tabs array
    this.tabs.splice(index, 1);

    // Emit the tabs changes
    this.tabsSubject.next(this.tabs);

    // Check if the removed tab was the active tab
    if (this.activeTabId === id) {
      // Switch to the previous or the next tab, depending on the index
      if (index > 0) {
        this.switchTab(this.tabs[index - 1].id);
      } else if (this.tabs.length > 0) {
        this.switchTab(this.tabs[0].id);
      } else {
        // No more tabs, set the active tab id to null
        this.activeTabId = null;
      }
    }
  }

  // A method to switch to a tab by id
  switchTab(id: string) {
    // Set the active tab id
    this.activeTabId = id;
  }

  // A method to get the active tab id
  getActiveTabId() {
    return this.activeTabId;
  }

  // A method to get a tab by id
  getTabById(id: string) {
    // Find the tab in the tabs array
    return this.tabs.find(tab => tab.id === id);
  }
}
