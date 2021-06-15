import { ScoreProvider } from "./score-provider";

const { Requester, Validator } = require('@chainlink/external-adapter'); // no @types packages for this

export interface RequestResponseResult {
  address: string;
  score_aave: string; // numberic
  score_comp: string; // numberic
  score: string; // numberic
  updated_at: string; // ISO UTC string
  is_updating_aave: boolean;
  is_updating_comp: boolean;
}

export interface ScoreRequestResponse {
  data: RequestResponseResult[];
  status: number;
}

export interface ICustomError {
  Response: string;
}

/**
 *
 * @param config
 * @param customErrrorFunction returns true if you want to retry, false otherwise
 * @returns
 */
export const RequesterRequestWrapper = (
  config: ScoreProvider,
  customErrrorFunction: { (data: ICustomError): boolean },
): Promise<ScoreRequestResponse> => Requester.request(config, customErrrorFunction);

export const RequesterErroredWrapper = (jobRunID: string, error: any, statusCode: number = 500) => Requester.errored(jobRunID, error, statusCode);

export interface IRequestInput {
  id: string; // numeric
  data: {
    tokenIdInt: string; // numeric
    tickSet: string; // numeric
  };
}

/**
 * @param input
 * @param customParams Define custom parameters to be used by the adapter.
 * Extra parameters can be stated in the extra object,
 * with a Boolean value indicating whether or not they
 * should be required.
 */
export const getValidatorWrapper = (input: IRequestInput, customParams: any): any => 
  // TODO: define types here
   new Validator(input, customParams)
;
