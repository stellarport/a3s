import jwt from 'jsonwebtoken';
import moment from 'moment';

const sandboxPublicKey = '-----BEGIN RSA PUBLIC KEY-----\n' +
    'MIICCgKCAgEAti/bW9kfXtNkmpLHrjHkON/hTPxdEaq2DgnuBZmk3nXSG2AOHK+O\n' +
    'LSjX1meTn5AFJ8zRpq0PN8frzQTs4O19iMQustJ5bggq7CcLwFm3y0nJeMtkWI/X\n' +
    'G1Zvo9rIVWLUkKpEI1brs6pFOqIBZLzrSlyRvNXtPSaJAIRWOLs9gfeOTwNxwxQT\n' +
    '6sL7TS+QIyZsrmvuRUPJmZb7Znlr7Da9w2TJbLPe9vjZ5YINY8rwAhIgxEo6p52O\n' +
    'ApDrKKQ68y/iImlGWdPiLIrh4+fJeLtqRQ0wtkuF2+boAdM/KKxaZoPfwvhxl7E7\n' +
    'lI/PbdHoBWFxunfVHCi2pLeqeyi55qn6CShqceBMkO5kL6W8Xjv6UQyLRcwb8RE5\n' +
    'm3Nc6yn36B6qfoffAumyZ3E/jAj0ShvfmRYvDceF6JmPrwUXdgcOPP8Vpz9X0lbv\n' +
    'dPk3V1J+EOMLi9pTcgvDvAd9IimLBteyYUemhpOAv7nrIfU4lgiS3OSFH+JyMOH/\n' +
    'THtxYoD9UZtC1HGEBGuiQdMcIp4SxxmhbEe2orSz6VtzBPeBigkZJ0vOc+jjMrlQ\n' +
    '3XHqoFd6QqYzkel9nSC3ncFWpA51vF7Ax2/UW33gQdCTfM6+zDUTRhhm6GJnYUE4\n' +
    'WUPTF73sw3enX/L1OCgH6dsS+17GsQJeGTCbNMm9N41712KSxdDN0dsCAwEAAQ==\n' +
    '-----END RSA PUBLIC KEY-----';

const productionPublicKey = '-----BEGIN RSA PUBLIC KEY-----\n' +
    'MIICCgKCAgEA2v7VJVU92hGGtKnC9hi30eTsqoYzCo6dDLQ9zDIb4KptK+Lezq1h\n' +
    'qV6/ontQgHeIZ1ysPwhCaUAnb4DNidmM6FXiXfoxH7B/9JoxZS/q/gBCyfBlba5W\n' +
    'ZPsEWc6VZVLuwUFcNxC+TtayoZZ1ka3pooJJcb0gATLzuXICUoq0rozV7jKK8ve7\n' +
    'uosJw2fq8dFPfPH+3qovE4LfW5iqw1+vbvOP1qq9dcqrbsqzNv3WmrU+uXBoaY+W\n' +
    'sLwO9VzcEZ9HADKPPC1QvmRJJJlD52wY7qLNB6GSbTnYGds1z7WNtzvseKdAJUn4\n' +
    'LWk8RWcPo2FftkysFUOtlkfrR4o2uf/4c/zgHtmJh/4hwX+Bbwy7GJ1vj7A9cY2k\n' +
    '/Nk1CjEwsgCajo5JKSSMaJ3cZehRBOc08vZnD0yv9vesb1XeP5apu0RT1/cenV5D\n' +
    'QBxehVj2+Jfq4ILKfWleFlV5TjeeJbQvZB3taqyf/Rw3KMhH20o6WLQocBgd04xD\n' +
    'jUVH5qt/GY0TFMs2naGjkkB/0Mr+Oc0tKFgLE5bIZ9HtiiKModFzTnNr+m/E4rX8\n' +
    'FYhMqXNxnVlt9KMtCUxj4Ecw3n0PA98QJqPx45DlDnfRmrlV0h6EcAY870nU3u6w\n' +
    'douwbZG9P361JWNXW/BWG3fsEnuGOAfm3hxJLSowhyWsb/NL1xIPj38CAwEAAQ==\n' +
    '-----END RSA PUBLIC KEY-----';

export class JWTVerifier {
    iss = 'a3s.api.stellarport.io';
    rsaPublicKey = productionPublicKey;

    useProd() {
        this.iss = 'a3s.api.stellarport.io';
        this.rsaPublicKey = productionPublicKey;
    }

    useSandbox() {
        this.iss = 'a3s-sandbox.api.stellarport.io';
        this.rsaPublicKey = sandboxPublicKey;
    }

    async verifyRequest(req, options = {}) {
        if (!req.headers.authorization) {
            return {
                verified: false,
                message: 'Please make sure your request has an Authorization header.'
            }
        }
        const token = req.headers.authorization.split(' ')[1];
        const account = options.account || req.query.account;

        if (!account) {
            return {
                verified: false,
                message: 'Account is required.'
            }
        }

        return this.verifyToken(token, account);
    }

    async verifyToken(token, account) {
        let payload = null;
        try {
            payload = new Promise((resolve, reject) => {
                jwt.verify(token, this.rsaPublicKey, { algorithms: ['RS256'] }, function (err, payload) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(payload);
                });
            })
        }
        catch (err) {
            return {
                verified: false,
                message: 'Could not verify jwt.'
            }
        }

        if (!payload.iss || payload.iss !== this.iss) {
            return {
                verified: false,
                message: 'Invalid token issuer.'
            }
        }

        if (!payload.sub || payload.sub !== account) {
            return {
                verified: false,
                message: 'Token subject does not match account.'
            }
        }

        if (moment().isAfter(payload.exp)) {
            return {
                verified: false,
                message: 'Your login access has expired. Please request a new token.'
            }
        }

        return {
            verified: true
        }
    }
}
