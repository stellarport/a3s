const all = {
    jwt: {
        rsaPublicKey: '-----BEGIN RSA PUBLIC KEY-----\n' +
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
        '-----END RSA PUBLIC KEY-----',
        iss: 'stellarport.io'
    }
};

export const a3sConfig = {
    sandbox: {
        ...all,
        host: 'https://a3s-sandbox.api.stellarport.io/v2',
        requestSigningPublicKey: 'GC5FZPWTXINH652NYEW56UM6FZZVHDLLERX3KKL55PVQB2D5A2DG4Q47'
    },
    production: {
        ...all,
        host: 'https://a3s.api.stellarport.io/v2',
        requestSigningPublicKey: 'GABWHTAVRYF2MCNDR5YC5SC3JTZQBGDZ3HKI4QAREV5533VU43W4HJUX'
    }
};
