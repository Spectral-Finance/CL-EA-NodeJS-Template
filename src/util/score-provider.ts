import config from "../config"

export interface ScoreProvider {
  name: string,
  url: string;
  headers: {
    'Content-Type': string;
    'x-api-key': string;
  };
  data: string;
  method: string;
  timeout: number;
}

// will be abstracted to something decided through governance later
// for now just two MACRO score APIs as proof of concept
export const getScoreProviders = (tokenIdInt: string): ScoreProvider[] => {
  return [
    {
      name: "MACRO Score API",
      url: 'https://xzff24vr3m.execute-api.us-east-2.amazonaws.com/default/spectral-proxy/',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config().apiKey,
      },
      data: `{\"tokenInt\":\"${tokenIdInt}\"}`,
      method: 'POST',
      timeout: 30000,
    },
    {
      name: "MACRO Score API evil twin",
      url: 'https://xzff24vr3m.execute-api.us-east-2.amazonaws.com/default/spectral-proxy/',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config().apiKey,
      },
      data: `{\"tokenInt\":\"${tokenIdInt}\"}`,
      method: 'POST',
      timeout: 30000,
    }
  ]
}