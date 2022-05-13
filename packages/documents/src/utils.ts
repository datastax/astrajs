import _ from "lodash";
import url from "url";

const types = ["String", "Number", "Boolean", "ObjectId"];

export const formatQuery = (query: any, options: any) => {
  // console.log(query);
  const modified = _.mapValues(query, (value: any) => {
    // console.log(value, value.constructor.name);
    if (options.collation) {
      throw new Error("Collations are not supported");
    }

    if (types.includes(value.constructor.name)) {
      return { $eq: value };
    }
    return value;
  });
  // console.log(modified);
  return modified;
};

export const parseUri = (uri: string) => {
  const parsedUrl = url.parse(uri, true);
  return {
    baseUrl: `${parsedUrl.protocol}//${parsedUrl.host}`,
    keyspaceName: parsedUrl.pathname?.replace("/", ""),
    astraApplicationToken: parsedUrl.query?.astraApplicationToken,
  };
};
