import * as ddb from '@aws-cdk/aws-dynamodb';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as cdk from '@aws-cdk/core';
import * as tasks from '../../lib';

let stack: cdk.Stack;
let table: ddb.Table;

beforeEach(() => {
  // GIVEN
  stack = new cdk.Stack();
  table = new ddb.Table(stack, 'my-table', {
    tableName: 'my-table',
    partitionKey: {
      name: 'name',
      type: ddb.AttributeType.STRING,
    },
  });
});

test('PutItem task', () => {
  // WHEN
  const task = new tasks.DynamoPutItem(stack, 'PutItem', {
    item: { SOME_KEY: new tasks.DynamoAttributeValue().withS('1234') },
    table,
    conditionExpression: 'ForumName <> :f and Subject <> :s',
    expressionAttributeNames: { OTHER_KEY: '#OK' },
    expressionAttributeValues: {
      ':val': new tasks.DynamoAttributeValue().withN(sfn.Data.stringAt('$.Item.TotalCount.N')),
    },
    returnConsumedCapacity: tasks.DynamoConsumedCapacity.TOTAL,
    returnItemCollectionMetrics: tasks.DynamoItemCollectionMetrics.SIZE,
    returnValues: tasks.DynamoReturnValues.ALL_NEW,
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::dynamodb:putItem',
        ],
      ],
    },
    End: true,
    Parameters: {
      Item: { SOME_KEY: { S: '1234' } },
      TableName: {
        Ref: 'mytable0324D45C',
      },
      ConditionExpression: 'ForumName <> :f and Subject <> :s',
      ExpressionAttributeNames: { OTHER_KEY: '#OK' },
      ExpressionAttributeValues: { ':val': { 'N.$': '$.Item.TotalCount.N' } },
      ReturnConsumedCapacity: 'TOTAL',
      ReturnItemCollectionMetrics: 'SIZE',
      ReturnValues: 'ALL_NEW',
    },
  });
});
