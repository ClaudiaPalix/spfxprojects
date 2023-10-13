import * as React from 'react';
import styles from './Popup.module.scss';
import type { IPopupProps } from './IPopupProps';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

interface IPopupItem {
  Title: string;
  Answer: string;
  // Add other properties as needed
}

interface IState {
  PopupListData: IPopupItem[];
}


export default class Popup extends React.Component<IPopupProps, IState>{
  private popupRef: React.RefObject<HTMLDivElement>;
  //creates a React ref using the useRef hook. Refs in React are a way to reference a DOM node or a React element directly.

  constructor(props: IPopupProps){
    super(props);
    this.state = {
      PopupListData: [],
    };
    this.popupRef = React.createRef<HTMLDivElement>();
  }

  private closePopup = (): void => {
    if (this.popupRef.current) {
      this.popupRef.current.style.display = 'none';
    }
  };

  private handleClickOutside = (event: MouseEvent): void => {
    if (this.popupRef.current && !this.popupRef.current.contains(event.target as Node)) {
      this.closePopup();
    }
  };

  public componentDidMount(): void {
    document.addEventListener('mousedown', this.handleClickOutside);
    this._loadData(this.props.listTitle);
  }

  public componentDidUpdate(prevProps: IPopupProps): void {
    // Check if the list title has changed
    if (prevProps.listTitle !== this.props.listTitle) {
      this._loadData(this.props.listTitle);
    }
  }

  private _loadData(listTitle: string): void{
    if (!listTitle){
      console.error('List title is undefined. Make sure it is provided as a prop.');
      return;
    }
    //When this code is executed in a SharePoint Framework web part, it forms a complete URL that points to the REST API endpoint for retrieving specific fields (Title and Answer) from the items of a SharePoint list with the given listTitle. This URL can then be used in a fetch or axios call to retrieve data from the SharePoint list.
    const apiUrl = `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${listTitle}')/items?$filter=Title eq 'Sam'&$select=Title,Answer`;


    //This code performs an HTTP GET request to a specified API endpoint (apiUrl) using the spHttpClient object provided by SharePoint Framework's context (this.props.context.spHttpClient). The code then processes the response and updates the component's state based on the retrieved data.
    this.props.context.spHttpClient.get(apiUrl, SPHttpClient.configurations.v1)
    //'response.json()' is used to parse the response body as JSON.
    .then((response: SPHttpClientResponse) => response.json())
    //Once the JSON data is parsed, it checks if data.value is defined. If it is, it updates the component's state (PopupListData) with the retrieved data. If data.value is not defined, it logs an error message.
    .then((data: { value: IPopupItem[] }) => {
      console.log('Fetched data:', data);
        // Check if data.value is defined
        if (data.value) {
          this.setState({ PopupListData: data.value });
        } else {
          console.error('Data.value is undefined or null');
        }
      })
      .catch((error) => {
        //error message incase of network issues, server errors
        console.error('Error fetching data:', error);
      });
  }

  public render(): React.ReactElement<IPopupProps> {
    return (
      <div ref={this.popupRef} className={`${styles.popup} ${styles.show}`}>
        <div className={styles.popupContent}>
          <h2>{this.props.title}</h2>
          <ul>
          {this.state.PopupListData.map((item: IPopupItem) => (
            <li key={item.Title}>
              <strong>{item.Title}:</strong> {item.Answer}
            </li>
          ))}
        </ul>
          <button className={styles.closeButton} onClick={this.closePopup} type='button'>
            X
          </button>
          {/* Add more content here */}
        </div>
      </div>
    );
  }

}

/** 
const Popup: React.FunctionComponent<IPopupProps> = (props: IPopupProps) => {

  
  const popupRef = React.useRef<HTMLDivElement | null>(null); //creates a React ref using the useRef hook. Refs in React are a way to reference a DOM node or a React element directly. 

  const closePopup = () => { //hide the referenced div element. 
    if (popupRef.current) {
      popupRef.current.style.display = 'none';
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      closePopup();
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
**/
  
{/** return (
    <div ref={popupRef} className={`${styles.popup} ${styles.show}`}>
      <div className={styles.popupContent}>
        <h2>{props.title}</h2> 
        <button className={styles.closeButton} onClick={closePopup} type='button'>X</button> 
      </div>
    </div>
  );
};

export default Popup;**/}

