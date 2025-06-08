export interface IApiImageData {
  id: string;
  src: string;
  name: string;
  author: IApiUserData;
}

export interface IApiUserData {
  id: string,
  username: string
}