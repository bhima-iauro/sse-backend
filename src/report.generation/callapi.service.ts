import * as request from 'request'
import { reject } from 'bluebird'
import * as rp from 'request-promise'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CallApiService {
    // private method;
    // private url;
    // private data;

    constructor() {
        // this.method = method;
        // this.url = url;
        // this.data = data;
    }

    /**
     * Call API with headers
     * @param headers
     */
    async makeRequestWithHeaders(
        method: string,
        url: string,
        data: any,
        headers: any
    ) {
        return new Promise((resolve) => {
            const options = {
                url: url,
                method: method,
                json: {},
                headers: headers,
                qs: {},
            }

            if (method == 'GET') {
                options.qs = data
            } else if (method == 'POST') {
                options.json = data
            } else if (method == 'PUT') {
                options.json = data
            } else if (method == 'PATCH') {
                options.json = data
            }

            request(options, function (err, response, body) {
                if (err) {
                    reject(err)
                }

                resolve(body)
            })
        })
    }

    /**
     * Call api with multipart formdata
     * @param url
     * @param formData
     */
    async Multipartrequest(url, formData, token) {

        return new Promise((resolve) => {
            const options = {
                method: 'POST',
                uri: url,
                formData: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authorization: token,
                    storageid : "aws"
                },
                json: true,
            }

            rp(options)
                .then(function (result) {
                    resolve(result)
                })
                .catch(function (err) {
                    console.log('err: ', err)
                    reject(err)
                })
        })
    }

    async getURLInBufferFormat(url) {
        return new Promise((resolve, reject) => {
            const options = {
                url: url,
                method: 'get',
                encoding: null,
            }

            request(options, function (err, response, body) {
                if (err) {
                   return reject(err)
                }
                return resolve(body)
            })
        })
    }
}
