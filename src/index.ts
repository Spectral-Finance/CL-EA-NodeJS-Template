import { Callback, Context } from 'aws-lambda';
import {
  ScoreRequestResponse,
  getValidatorWrapper,
  IRequestInput,
  ICustomError,
  RequesterRequestWrapper,
  RequesterErroredWrapper,
  RequestResponseResult,
} from './util/chainlink-adapter';
import { getScoreProviders, ScoreProvider } from './util/score-provider';

interface ICreateRequestResponse extends ScoreRequestResponse {
  jobRunID: string;
}

export const createRequest = async (input: IRequestInput): Promise<ICreateRequestResponse> => {
  var jobRunID = '';
  try {
    const customParams = {
      tokenIdInt: 'tokenIdInt',
      tickSet: 'tickSet',
    };
    const validator = getValidatorWrapper(input, customParams);
    jobRunID = validator.validated.id;

    const scoreProviders = getScoreProviders(validator.validated.data.tokenIdInt);
    const scores = await getScoresFromAllProviders(jobRunID, scoreProviders);
    const overallScoreResponse = calculateOverallScore(scores);
    return { jobRunID, ...overallScoreResponse };
  } catch (error) {
    console.error(error);
    throw RequesterErroredWrapper(jobRunID, error, 500);
  }
};

const getScoresFromAllProviders = async (
  jobRunID: string,
  providers: ScoreProvider[],
): Promise<ScoreRequestResponse[]> => {
  return Promise.all(providers.map((provider) => requestScoreFromProvider(jobRunID, provider)));
};

// could potentially change this per-provider
const customError = (data: ICustomError) => {
  if (data.Response === 'Error') return true;
  return false;
};

const requestScoreFromProvider = async (jobRunID: string, config: ScoreProvider): Promise<ScoreRequestResponse> => {
  const response = await RequesterRequestWrapper(config, customError);
  if (!(response.status == 200 || response.status == 201))
    throw RequesterErroredWrapper(
      jobRunID,
      new Error(`Response from provider ${config.name} did return a successful status code!`),
      response.status,
    );
  if (!response.data?.length)
    throw RequesterErroredWrapper(
      jobRunID,
      new Error(`Response from provider ${config.name} did not contain score data!`),
      400,
    );
  return response;
};

const calculateOverallScore = (scoreResponses: ScoreRequestResponse[]): ScoreRequestResponse => {
  const allScores: RequestResponseResult[] = [];
  scoreResponses.forEach((response: ScoreRequestResponse) => {
    allScores.push.apply(allScores, response.data);
  });
  return {
    data: [calculateMedianScore(allScores)], // TODO: should this still be an array? work with client side to determine what's best here
    status: 200,
  };
};

const calculateMedianScore = (scores: RequestResponseResult[]): RequestResponseResult => {
  const sortedScores = scores.sort((a, b) => {
    return parseFloat(a.score) - parseFloat(b.score);
  });

  const mid = Math.floor(sortedScores.length / 2);
  const median =
    sortedScores.length % 2 == 0 ? meanOfTwoScores(sortedScores[mid], sortedScores[mid - 1]) : sortedScores[mid - 1];

  return median;
};

const meanOfTwoScores = (scoreA: RequestResponseResult, scoreB: RequestResponseResult): RequestResponseResult => {
  const meanOfStrings = (a: string, b: string) => `${parseFloat(a) + parseFloat(b) / 2}`;
  return {
    address: scoreA.address,
    score_aave: meanOfStrings(scoreA.score_aave, scoreB.score_aave),
    score_comp: meanOfStrings(scoreA.score_comp, scoreB.score_comp),
    score: meanOfStrings(scoreA.score, scoreB.score),
    updated_at: scoreA.updated_at,
    is_updating_aave: scoreA.is_updating_aave || scoreB.is_updating_aave,
    is_updating_comp: scoreA.is_updating_comp || scoreB.is_updating_comp,
  };
};

// This is a wrapper to allow the function to work with newer AWS Lambda implementations
exports.handlerv2 = (event: any, context: Context, callback: Callback) => {
  try {
    var input = JSON.parse(event.body);
  } catch (err) {
    callback(new Error('Error parsing body!'), {
      statusCode: 500,
    });
  }
  createRequest(input)
    .then((result) => {
      callback(null, {
        statusCode: result.status,
        body: JSON.stringify(result.data),
        isBase64Encoded: false,
      });
    })
    .catch((error) => {
      callback(error, {
        statusCode: error?.statusCode ?? 500,
      });
    });
};
