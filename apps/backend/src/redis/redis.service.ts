import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis, { RedisOptions, Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: RedisClient;
  private readonly subscribers: Map<string, RedisClient> = new Map();
  private readonly logger = new Logger(RedisService.name);

  constructor(options: RedisOptions) {
    this.client = new Redis(options);

    this.client.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(`Redis error: ${err.message}`, err.stack);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }
    return this.client.set(key, value);
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(keys);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.client.hdel(key, ...fields);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return this.client.decr(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async zadd(
    key: string,
    score: number | string,
    member: string,
  ): Promise<number> {
    return this.client.zadd(key, score, member);
  }

  async zrange(
    key: string,
    start: number,
    stop: number,
  ): Promise<string[]> {
    return this.client.zrange(key, start, stop);
  }

  async publish(channel: string, message: string): Promise<number> {
    return this.client.publish(channel, message);
  }

  async subscribe(
    channel: string,
    callback: (message: string, channel: string) => void,
  ): Promise<void> {
    const subscriber = new Redis(this.client.options);
    await subscriber.subscribe(channel);
    subscriber.on('message', (ch: string, msg: string) => {
      callback(msg, ch);
    });
    this.subscribers.set(channel, subscriber);
  }

  async unsubscribe(channel: string): Promise<void> {
    const subscriber = this.subscribers.get(channel);
    if (subscriber) {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
      this.subscribers.delete(channel);
    }
  }

  getClient(): RedisClient {
    return this.client;
  }

  async disconnect(): Promise<void> {
    for (const [channel, subscriber] of this.subscribers) {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    }
    this.subscribers.clear();
    await this.client.quit();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }
}