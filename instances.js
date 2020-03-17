const aws = require('@pulumi/aws');
const pulumi = require('@pulumi/pulumi');
const btoa = require('btoa');

const config = new pulumi.Config();

const publicKey = config.get('publicKey');
const key = new aws.ec2.KeyPair('aaas-key', { publicKey });
const keyName = key.keyName;

const bootstrapUserData = `
  #!/bin/bash
  # install docker
  sudo yum install docker -y

  # install docker-compose
  sudo curl -L https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose

  # give docker permissions
  sudo chmod +x /usr/local/bin/docker-compose
  sudo groupadd docker
  sudo gpasswd -a $USER docker
  sudo service docker restart
`;

const createInstance = (name, subnetId, sgId) => {
  new aws.ec2.Instance(`${name}-web-ec2`, {
    ami: 'ami-09d069a04349dc3cb', //awsAmi.id,
    instanceType: 't2.micro',
    subnetId,
    tags: {
      Name: `${name}`
    },
    securityGroups: [sgId],
    keyName: keyName,
    associatePublicIpAddress: true,
    userDataBase64: btoa(bootstrapUserData)
  });
};

module.exports = createInstance;
