import "axios";

declare module "axios" {
  // allow passing suppressToast in request config
  interface AxiosRequestConfig {
    suppressToast?: boolean;
  }
}
