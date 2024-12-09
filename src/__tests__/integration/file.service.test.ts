import request from 'supertest';
import app from '../../app';
import fs from 'node:fs';
import {mockUploadRepository} from '../mocks/repositories/upload.repository';
import {EStatusCode} from '../../models/enums/statusCode';

mockUploadRepository();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Image Upload', () => {
  it('should return 201 for one valid image', async () => {
    const buffer = fs.readFileSync(__dirname + '/jo.jpg');
    const response = await request(app)
      .post(`/file/upload`)
      .attach('files', buffer, 'jo.jpg');

    expect(response.status).toBe(EStatusCode.CREATED);
  });

  it('should return 201 for multiple valid images', async () => {
    const buffer1 = fs.readFileSync(__dirname + '/jo.jpg');
    const buffer2 = fs.readFileSync(__dirname + '/jo.jpg');
    const response = await request(app)
      .post(`/file/upload`)
      .attach('files', buffer1, 'jo.jpg')
      .attach('files', buffer2, 'jo.jpg');
    expect(response.status).toBe(EStatusCode.CREATED);
  });

  it('should return 400 for a invalid image', async () => {
    const buffer = fs.readFileSync(__dirname + '/jo.jpg');
    const response = await request(app)
      .post(`/file/upload`)
      .attach('files', buffer, 'jo.txt');

    expect(response.status).toBe(EStatusCode.BAD_REQUEST);
  });

  it('should return 400 for an empty request', async () => {
    const response = await request(app).post(`/file/upload`).send();

    expect(response.status).toBe(EStatusCode.BAD_REQUEST);
  });
});
