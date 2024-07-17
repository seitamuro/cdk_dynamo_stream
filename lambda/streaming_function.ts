import { format } from "date-fns";

export const handler = async (
  event: any = {},
  context: any = {}
): Promise<any> => {
  console.log(JSON.stringify(event, null, 2));
  event.Records.forEach((record: any) => {
    logDynamoDBRecord(record);
  });

  return {
    statusCode: 200,
    body: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
  };
};

const logDynamoDBRecord = (record: any) => {
  console.log(record.eventID);
  console.log(record.eventName);
  console.log(`DynamoDB Record: ${JSON.stringify(record.dynamodb)}`);
};
