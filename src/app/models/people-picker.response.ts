export interface PeoplePickerResponse {
  d: PeoplePickerData;
}

interface PeoplePickerData {
  ClientPeoplePickerSearchUser: PeoplePickerUser[];
}

export interface PeoplePickerUser {
  Id: number;
  UserName: string;
}

export interface PeoplePickerUserEntityData {
  IsAltSecIdPresent: string;
  Title: string;
  Email: string;
  MobilePhone: string;
  ObjectId: string;
  Department: string;
}

export interface FormDigestResponse {
  'odata.metadata': string;
  FormDigestTimeoutSeconds: number;
  FormDigestValue: string;
  LibraryVersion: string;
  SiteFullUrl: string;
  SupportedSchemaVersions: string[];
  WebFullUrl: string;
}
