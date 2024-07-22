import { DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBStreamEvent } from "aws-lambda";
import { format } from "date-fns";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: DynamoDBStreamEvent,
  context: any = {}
): Promise<any> => {
  console.log("TABLE_NAME: ", process.env.TABLE_NAME);
  console.log("Records: ", JSON.stringify(event.Records));

  const command = new DescribeTableCommand({
    TableName: process.env.TABLE_NAME,
  });
  try {
    const response = await client.send(command);
    console.log("Describe:", response);
  } catch (error) {
    console.log(error);
  }

  for (const record of event.Records) {
    const update_params: UpdateCommandInput = {
      TableName: process.env.TABLE_NAME,
      Key: {
        id: record.dynamodb?.Keys?.id.S,
      },
      UpdateExpression:
        "set #eventName = if_not_exists(#eventName, :start) + :inc",
      ExpressionAttributeNames: {
        "#eventName": record.eventName || "",
      },
      ExpressionAttributeValues: {
        ":start": 0,
        ":inc": 1,
      },
    };

    try {
      console.log("docClient send");
      const data = await docClient.send(new UpdateCommand(update_params));
      console.log("PutItem succeeded:", JSON.stringify(data));
    } catch (err) {
      console.error(
        "Unable to put item. Error JSON:",
        JSON.stringify(err, null)
      );
    }
  }

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
