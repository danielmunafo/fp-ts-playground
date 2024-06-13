import { HeartRateArbitrary, HeartRateEntity } from "@fp-ts-playground/core";
import { sample } from "fast-check";
import { isLeft, isRight } from "fp-ts/Either";
import { Kafka } from "kafkajs";
import { beforeEach } from "node:test";
import logger from "../logger/logger";
import { KafkaEntityProducer } from "./KafkaEntityProducer";

process.env.KAFKAJS_NO_PARTITIONER_WARNING = "1";

describe("KafkaEntityProducer", () => {
  const schema = {
    encode: jest.fn(),
    decode: jest.fn(),
    id: 0,
  };
  const kafka = new Kafka({
    clientId: "testing-kafka",
    brokers: ["mock-host:99999"],
    retry: {
      retries: 5,
      initialRetryTime: 1000,
    },
    connectionTimeout: 25000,
  });
  const sendMessageMockResult = [
    {
      topicName: "health_metrics",
      partition: 0,
      errorCode: 0,
      baseOffset: "0",
      logAppendTime: "-1",
      logStartOffset: "0",
    },
  ];

  beforeEach(() => jest.clearAllMocks());

  it("should sendMessage successfully", async () => {
    const producer = kafka.producer();
    const sendSpy = jest
      .spyOn(producer, "send")
      .mockResolvedValue(sendMessageMockResult);
    const kafkaEntityProducer = new KafkaEntityProducer<HeartRateEntity>(
      producer,
      logger,
      schema,
      "health_metrics",
    );
    const input = new HeartRateEntity({
      ...sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0],
    });
    const entitySpy = jest.spyOn(input, "validate");

    const result = await kafkaEntityProducer.sendMessage(input)();
    if (isLeft(result)) throw new Error("Error shouldn't have happened.");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(result.right).toEqual(sendMessageMockResult);
    expect(schema.encode).toHaveBeenCalledWith(input);
    expect(entitySpy).toHaveBeenCalledTimes(1);
  });

  it("should fail sendMessage", async () => {
    const producer = kafka.producer();
    const sendSpy = jest
      .spyOn(producer, "send")
      .mockRejectedValue(new Error("generic"));
    const kafkaEntityProducer = new KafkaEntityProducer<HeartRateEntity>(
      producer,
      logger,
      schema,
      "health_metrics",
    );
    const input = new HeartRateEntity({
      ...sample(HeartRateArbitrary({ timestamp: new Date() }), 1)[0],
    });
    const entitySpy = jest.spyOn(input, "validate");

    const result = await kafkaEntityProducer.sendMessage(input)();
    if (isRight(result)) throw new Error("Error shouldn have happened.");

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(result.left).toBeInstanceOf(Error);
    expect(schema.encode).toHaveBeenCalledWith(input);
    expect(entitySpy).toHaveBeenCalledTimes(1);
  });

  it("should NOT sendMessage when entity is invalid", async () => {
    const producer = kafka.producer();
    const sendSpy = jest
      .spyOn(producer, "send")
      .mockResolvedValue(sendMessageMockResult);
    const kafkaEntityProducer = new KafkaEntityProducer<HeartRateEntity>(
      producer,
      logger,
      schema,
      "health_metrics",
    );
    const input = new HeartRateEntity({
      ...sample(
        HeartRateArbitrary({ timestamp: "invalid" as unknown as Date }),
        1,
      )[0],
    });
    const entitySpy = jest.spyOn(input, "validate");

    const result = await kafkaEntityProducer.sendMessage(input)();
    if (isRight(result)) throw new Error("Error shouldn have happened.");

    expect(sendSpy).not.toHaveBeenCalled();
    expect(result.left).toBeInstanceOf(Error);
    expect(schema.encode).not.toHaveBeenCalled();
    expect(entitySpy).toHaveBeenCalledTimes(1);
  });
});
