import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkDynamodbStreamsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "Table", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    const history_table = new dynamodb.Table(this, "HistoryTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const streamingFunction = new NodejsFunction(this, "streaming_function", {
      entry: "lambda/streaming_function.ts",
      handler: "handler",
      environment: {
        TABLE_NAME: history_table.tableName,
      },
    });

    table.grantStreamRead(streamingFunction);
    history_table.grantWriteData(streamingFunction);

    streamingFunction.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      })
    );
  }
}
