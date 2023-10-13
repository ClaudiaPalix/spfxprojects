import { IPropertyPaneDropdownOption } from '@microsoft/sp-property-pane';
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IPopupProps {
  title: string;  
  context: WebPartContext;
  listTitle: string;
  availableLists: IPropertyPaneDropdownOption[];
  setListTitle: (listTitle: string) => void;
  setAvailableLists: (availableLists: IPropertyPaneDropdownOption[]) => void;
}
