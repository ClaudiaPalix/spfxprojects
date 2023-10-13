import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
//import {PropertyPaneTextField} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart, IPropertyPaneConfiguration, PropertyPaneDropdown, IPropertyPaneDropdownOption  } from '@microsoft/sp-webpart-base';
//import { IReadonlyTheme } from '@microsoft/sp-component-base';
import styles from './components/Popup.module.scss';
import * as strings from 'PopupWebPartStrings';
import Popup from './components/Popup';
import { IPopupProps } from './components/IPopupProps';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

 
// specifies that instances of PopupWebPart should receive properties conforming to the IPopupProps interface
export default class PopupWebPart extends BaseClientSideWebPart<IPopupProps> { 

  private availableLists: IPropertyPaneDropdownOption[] = [];

  private _showPopup() {
    const element: React.ReactElement<IPopupProps> = React.createElement(Popup, {
      title: 'Popup Title', // Pass any data you want to display in the popup
      context: this.context,
      listTitle: this.properties.listTitle,
      availableLists: this.availableLists,
      setListTitle: this.setListTitle.bind(this),
      setAvailableLists: this.setAvailableLists.bind(this),
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  public render(): void { //responsible for rendering React elements into the DOM(Document Object Model)
    
    this.domElement.innerHTML = `
      <div class="${styles.popupWebPart}">
        <div class="${styles.container}">
          <div class="${styles.row}">
            <button id="popupButton">Show Popup</button>
          </div>
        </div>
      </div>`;

    this._setButtonEventHandlers();
  }


  //_setButtonEventHandlers() method finds a button element with the ID popupButton inside the current component's DOM element. If the button is found, it sets up a click event listener, so when the button is clicked, the _showPopup() method will be called, presumably displaying a popup or triggering some other action in your application.
  private _setButtonEventHandlers() {
    const button: HTMLButtonElement = this.domElement.querySelector('#popupButton') as HTMLButtonElement;
    if (button) {
      button.addEventListener('click', () => this._showPopup());
    }
  }
  
  protected get dataVersion(): Version { // used to specify the version of the data stored by your web part.
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration { // used to define the configuration of the property pane for a web part. In SharePoint Framework, the property pane is a customizable interface where users can set various properties for a web part.
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneDropdown('selectedList', {
                  label: 'Select a list',
                  options: this.availableLists,
                })
              ]
            }
          ]
        }
      ]
    };
  }

protected onPropertyPaneConfigurationStart(): void {
  this._loadLists();
}

protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
  if (propertyPath === 'selectedList') {
    this.setListTitle(newValue);
  }

  super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
}

private _loadLists(): void {
  //calls all lists in current site
  const listsUrl = `${this.context.pageContext.web.absoluteUrl}/_api/web/lists`;
  //SPHttpClient is a class provided by Microsoft that allows developers to perform HTTP requests to SharePoint REST APIs or other endpoints within SharePoint or the host environment. It is used for making asynchronous network requests to SharePoint or other APIs in SharePoint Framework web parts, extensions, or other components.
  this.context.spHttpClient.get(listsUrl, SPHttpClient.configurations.v1)
  //SPHttpClientResponse is the response object returned after making a request using SPHttpClient. It contains information about the response, such as status code, headers, and the response body. 
    .then((response: SPHttpClientResponse) => response.json())
    //This is a JavaScript Promise method. When the API call is successful, it passes the response data to this function. In this case, the response data is expected to have a property value which is an array.
    .then((data: { value: any[] }) => {
      this.availableLists = data.value.map((list) => {
        return { key: list.Title, text: list.Title };
      });
      this.context.propertyPane.refresh();
    })
    .catch((error) => {
      console.error('Error fetching lists:', error);
    });
}

private setListTitle(listTitle: string): void {
  this.properties.listTitle = listTitle;
  this.context.propertyPane.refresh();
}

private setAvailableLists(availableLists: IPropertyPaneDropdownOption[]): void {
  this.availableLists = availableLists;
  this.context.propertyPane.refresh();
}

}



